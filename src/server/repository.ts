import { DatabaseSync } from 'node:sqlite';
import { Recipe, RecipeIngredient, RecipeStep, StepIngredientAllocation } from '../shared/types.js';
import { RecipeEditorialProfile, RecipeEditorialAuditRecord, EditorialStatus, ActorRole } from '../shared/editorial-types.js';
import { detectMaterialChanges, validateEditorialProfile } from '../shared/editorial-validation.js';
import { insertRecipeIntoDb } from './db.js';

export interface AuthenticatedActor {
  actor_id: string;
  actor_role: ActorRole;
  is_human: boolean;
  display_name: string;
}

export interface RecipeListItem {
  id: string;
  recipe_id: string;
  version: string;
  title: string;
  summary: string;
  culinary_tradition: string | null;
  region: string | null;
  category: string;
  status: string;
  yield_quantity: number;
  yield_unit: string;
  total_minutes: number | null;
  lead_time_hours?: number | null;
  difficulty: string | null;
  ingredients_count: number;
  steps_count: number;
  image_url?: string | null;
  editorial_subtitle?: string | null;
  editorial_status?: string | null;
  created_at: string;
  updated_at: string;
}

export class RecipeRepository {
  constructor(private db: DatabaseSync) {}

  getAllRecipes(): RecipeListItem[] {
    const stmt = this.db.prepare(`
      SELECT 
        r.id, r.recipe_id, r.version, r.title, r.summary,
        r.culinary_tradition, r.region, r.category, r.status,
        r.yield_quantity, r.yield_unit, r.total_minutes, r.lead_time_hours, r.difficulty,
        r.created_at, r.updated_at,
        e.image_url, e.editorial_subtitle, e.editorial_status,
        (SELECT COUNT(*) FROM recipe_ingredients i WHERE i.recipe_id = r.id) as ingredients_count,
        (SELECT COUNT(*) FROM recipe_steps s WHERE s.recipe_id = r.id) as steps_count
      FROM recipes r
      LEFT JOIN recipe_editorial e ON e.recipe_id = r.id
      ORDER BY r.updated_at DESC
    `);

    return stmt.all() as unknown as RecipeListItem[];
  }

  getRecipeById(id: string): Recipe | null {
    const recipeRow = this.db.prepare(`
      SELECT * FROM recipes WHERE id = ? OR recipe_id = ?
    `).get(id, id) as any;

    if (!recipeRow) {
      return null;
    }

    // Get ingredients
    const ingRows = this.db.prepare(`
      SELECT * FROM recipe_ingredients 
      WHERE recipe_id = ? 
      ORDER BY sequence_order ASC
    `).all(recipeRow.id) as any[];

    const ingredients: RecipeIngredient[] = ingRows.map((r) => ({
      id: r.id,
      ingredient_id: r.ingredient_id,
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      preparation: r.preparation,
      group: r.group_name,
      optional: Boolean(r.optional),
      notes: r.notes,
      sequence_order: r.sequence_order,
    }));

    // Get steps
    const stepRows = this.db.prepare(`
      SELECT * FROM recipe_steps 
      WHERE recipe_id = ? 
      ORDER BY step_number ASC
    `).all(recipeRow.id) as any[];

    const steps: RecipeStep[] = stepRows.map((s) => {
      const refRows = this.db.prepare(`
        SELECT ingredient_id, quantity_used_in_step, unit, component, notes
        FROM step_ingredient_refs 
        WHERE step_id = ?
      `).all(s.id) as {
        ingredient_id: string;
        quantity_used_in_step: number | null;
        unit: string | null;
        component: string | null;
        notes: string | null;
      }[];

      const ingredient_refs = refRows.map((ref) => ref.ingredient_id);

      // Condition 2: Distinguish between absent and empty list.
      // If any allocation details are present, populate allocations; otherwise leave undefined (never force to []).
      const hasAllocations = refRows.some(
        (r) => r.quantity_used_in_step !== null || r.component !== null || r.notes !== null
      );

      const allocations: StepIngredientAllocation[] | undefined = hasAllocations
        ? refRows.map((r) => ({
            ingredient_id: r.ingredient_id,
            quantity_used_in_step: r.quantity_used_in_step,
            unit: r.unit,
            component: r.component,
            notes: r.notes,
          }))
        : undefined;

      // Condition 2: depends_on_json: NULL maps to undefined (implicit sequential). '[]' maps to [].
      let depends_on: string[] | null | undefined = undefined;
      if (s.depends_on_json !== null && s.depends_on_json !== undefined) {
        try {
          depends_on = JSON.parse(s.depends_on_json);
        } catch {
          depends_on = undefined;
        }
      }

      // Thermal constraints: NULL maps to undefined.
      let thermal_constraints = undefined;
      if (s.thermal_constraints_json !== null && s.thermal_constraints_json !== undefined) {
        try {
          thermal_constraints = JSON.parse(s.thermal_constraints_json);
        } catch {
          thermal_constraints = undefined;
        }
      }

      // Risks: NULL maps to undefined.
      let risks = undefined;
      if (s.risks_json !== null && s.risks_json !== undefined) {
        try {
          risks = JSON.parse(s.risks_json);
        } catch {
          risks = undefined;
        }
      }

      return {
        id: s.id,
        step_id: s.step_id || undefined,
        step_number: s.step_number,
        instruction: s.instruction,
        duration_minutes: s.duration_minutes,
        active_minutes: typeof s.active_minutes === 'number' ? s.active_minutes : undefined,
        passive_minutes: typeof s.passive_minutes === 'number' ? s.passive_minutes : undefined,
        depends_on,
        temperature_c: s.temperature_c,
        heat_level: s.heat_level,
        success_cue: s.success_cue,
        ingredient_refs,
        allocations,
        thermal_constraints,
        risks,
      };
    });

    const safeJsonParse = (str: string | null | undefined) => {
      if (!str) return undefined;
      try {
        return JSON.parse(str);
      } catch {
        return undefined;
      }
    };

    return {
      id: recipeRow.id,
      recipe_id: recipeRow.recipe_id,
      version: recipeRow.version,
      title: recipeRow.title,
      summary: recipeRow.summary,
      culinary_tradition: recipeRow.culinary_tradition,
      region: recipeRow.region,
      category: recipeRow.category,
      status: recipeRow.status,
      yield: {
        quantity: recipeRow.yield_quantity,
        unit: recipeRow.yield_unit,
        approx_final_weight_g: recipeRow.yield_approx_final_weight_g,
      },
      timing: {
        active_minutes: recipeRow.active_minutes,
        total_minutes: recipeRow.total_minutes,
        lead_time_hours: typeof recipeRow.lead_time_hours === 'number' ? recipeRow.lead_time_hours : undefined,
      },
      difficulty: recipeRow.difficulty,
      equipment: safeJsonParse(recipeRow.equipment_json) || [],
      allergens: safeJsonParse(recipeRow.allergens_json) || [],
      sources: safeJsonParse(recipeRow.sources_json) || [],
      editorial_notes: safeJsonParse(recipeRow.editorial_notes_json) || [],
      claims: safeJsonParse(recipeRow.claims_json),
      review: safeJsonParse(recipeRow.review_json),
      nutrition_estimate: safeJsonParse(recipeRow.nutrition_json),
      ingredients,
      steps,
      editorial: this.getEditorialByRecipeId(recipeRow.id),
      created_at: recipeRow.created_at,
      updated_at: recipeRow.updated_at,
    };
  }

  saveRecipe(recipe: Recipe): Recipe {
    const existing = this.getRecipeById(recipe.id);

    if (existing) {
      // Atomic Update
      this.db.exec('BEGIN TRANSACTION;');
      try {
        const updateRecipe = this.db.prepare(`
          UPDATE recipes SET
            recipe_id = ?,
            version = ?,
            title = ?,
            summary = ?,
            culinary_tradition = ?,
            region = ?,
            category = ?,
            status = ?,
            yield_quantity = ?,
            yield_unit = ?,
            yield_approx_final_weight_g = ?,
            active_minutes = ?,
            total_minutes = ?,
            lead_time_hours = ?,
            difficulty = ?,
            equipment_json = ?,
            allergens_json = ?,
            sources_json = ?,
            editorial_notes_json = ?,
            claims_json = ?,
            review_json = ?,
            nutrition_json = ?,
            updated_at = ?
          WHERE id = ?
        `);

        const now = new Date().toISOString();
        updateRecipe.run(
          recipe.recipe_id,
          recipe.version || '1.0.0',
          recipe.title,
          recipe.summary || '',
          recipe.culinary_tradition || null,
          recipe.region || null,
          recipe.category || 'General',
          recipe.status || 'draft',
          recipe.yield?.quantity ?? 4,
          recipe.yield?.unit ?? 'porții',
          recipe.yield?.approx_final_weight_g ?? null,
          recipe.timing?.active_minutes ?? null,
          recipe.timing?.total_minutes ?? null,
          recipe.timing?.lead_time_hours ?? null,
          recipe.difficulty || null,
          JSON.stringify(recipe.equipment || []),
          JSON.stringify(recipe.allergens || []),
          JSON.stringify(recipe.sources || []),
          JSON.stringify(recipe.editorial_notes || []),
          recipe.claims !== undefined && recipe.claims !== null ? JSON.stringify(recipe.claims) : null,
          recipe.review !== undefined && recipe.review !== null ? JSON.stringify(recipe.review) : null,
          recipe.nutrition_estimate !== undefined && recipe.nutrition_estimate !== null ? JSON.stringify(recipe.nutrition_estimate) : null,
          now,
          recipe.id
        );

        // Delete old children
        this.db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(recipe.id);
        this.db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?').run(recipe.id);

        // Insert new ingredients
        const insertIng = this.db.prepare(`
          INSERT INTO recipe_ingredients (
            id, recipe_id, ingredient_id, name, quantity, unit, preparation,
            group_name, optional, notes, sequence_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        (recipe.ingredients || []).forEach((ing, idx) => {
          insertIng.run(
            ing.id || `ing_${recipe.id}_${idx + 1}`,
            recipe.id,
            ing.ingredient_id || `ing_${idx + 1}`,
            ing.name,
            ing.quantity ?? null,
            ing.unit ?? null,
            ing.preparation ?? null,
            ing.group ?? null,
            ing.optional ? 1 : 0,
            ing.notes ?? null,
            ing.sequence_order || idx + 1
          );
        });

        // Insert new steps with persistent, stable step_id
        const insertStep = this.db.prepare(`
          INSERT INTO recipe_steps (
            id, recipe_id, step_id, step_number, instruction, duration_minutes,
            active_minutes, passive_minutes, depends_on_json, temperature_c,
            heat_level, success_cue, thermal_constraints_json, risks_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertRef = this.db.prepare(`
          INSERT OR REPLACE INTO step_ingredient_refs (
            step_id, ingredient_id, quantity_used_in_step, unit, component, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        (recipe.steps || []).forEach((step, idx) => {
          const stepPk = step.id?.startsWith(`${recipe.id}_`) ? step.id : `${recipe.id}_${step.id || idx + 1}`;
          // Preserve existing step_id, or assign stable default
          const stableStepId = step.step_id && step.step_id.trim().length > 0 
            ? step.step_id.trim() 
            : `${recipe.recipe_id || recipe.id}_step_${step.step_number || idx + 1}`;

          insertStep.run(
            stepPk,
            recipe.id,
            stableStepId,
            step.step_number || idx + 1,
            step.instruction,
            step.duration_minutes ?? null,
            step.active_minutes ?? null,
            step.passive_minutes ?? null,
            step.depends_on !== undefined && step.depends_on !== null ? JSON.stringify(step.depends_on) : null,
            step.temperature_c ?? null,
            step.heat_level ?? null,
            step.success_cue ?? null,
            step.thermal_constraints !== undefined && step.thermal_constraints !== null ? JSON.stringify(step.thermal_constraints) : null,
            step.risks !== undefined && step.risks !== null ? JSON.stringify(step.risks) : null
          );

          // Build allocations lookup
          const allocationMap = new Map<string, { quantity_used_in_step: number | null; unit: string | null; component: string | null; notes: string | null }>();
          if (step.allocations && Array.isArray(step.allocations)) {
            step.allocations.forEach((a) => {
              allocationMap.set(a.ingredient_id, {
                quantity_used_in_step: a.quantity_used_in_step ?? null,
                unit: a.unit ?? null,
                component: a.component ?? null,
                notes: a.notes ?? null,
              });
            });
          }

          const allRefs = new Set([...(step.ingredient_refs || []), ...Array.from(allocationMap.keys())]);
          for (const ref of allRefs) {
            const alloc = allocationMap.get(ref);
            insertRef.run(
              stepPk,
              ref,
              alloc?.quantity_used_in_step ?? null,
              alloc?.unit ?? null,
              alloc?.component ?? null,
              alloc?.notes ?? null
            );
          }
        });

        this.db.exec('COMMIT;');
      } catch (err) {
        this.db.exec('ROLLBACK;');
        throw err;
      }
    } else {
      // New Recipe Insert
      insertRecipeIntoDb(this.db, recipe);
    }

    return this.getRecipeById(recipe.id)!;
  }

  deleteRecipe(id: string): boolean {
    const res = this.db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    return res.changes > 0;
  }

  getEditorialByRecipeId(id: string): RecipeEditorialProfile | null {
    const row = this.db.prepare(`
      SELECT e.*, r.id as canonical_recipe_id
      FROM recipe_editorial e
      JOIN recipes r ON r.id = e.recipe_id
      WHERE e.recipe_id = ? OR r.recipe_id = ?
    `).get(id, id) as any;

    if (!row) return null;

    const safeJsonParse = (str: string | null | undefined) => {
      if (!str) return [];
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    };

    return {
      recipe_id: row.canonical_recipe_id || row.recipe_id,
      profile_version: row.profile_version || 1,
      editorial_status: row.editorial_status || 'draft',
      editorial_subtitle: row.editorial_subtitle || null,
      heritage: row.heritage || null,
      region_context: row.region_context || null,
      terroir: row.terroir || null,
      chef_quote: row.chef_quote || null,
      chef_tip: row.chef_tip || null,
      pairing_suggestion: row.pairing_suggestion || null,
      historical_sources: safeJsonParse(row.historical_sources_json),
      claim_confidence: row.claim_confidence || 'uncertain',
      image_url: row.image_url || null,
      image_alt: row.image_alt || null,
      image_caption: row.image_caption || null,
      image_source_url: row.image_source_url || null,
      image_author: row.image_author || null,
      image_license: row.image_license || null,
      image_license_notes: row.image_license_notes || null,
      image_attribution: row.image_attribution || null,
      image_rights_status: row.image_rights_status || 'unverified',
      approved_by: row.approved_by || null,
      approved_at: row.approved_at || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  getAllEditorialProfiles(): Record<string, RecipeEditorialProfile> {
    const rows = this.db.prepare('SELECT * FROM recipe_editorial').all() as any[];
    const result: Record<string, RecipeEditorialProfile> = {};
    for (const r of rows) {
      const profile = this.getEditorialByRecipeId(r.recipe_id);
      if (profile) {
        result[profile.recipe_id] = profile;
      }
    }
    return result;
  }

  saveEditorial(
    recipeId: string,
    profileData: Partial<RecipeEditorialProfile>,
    actor: AuthenticatedActor,
    rationale = 'Actualizare profil editorial'
  ): { editorial: RecipeEditorialProfile; auditRecord: RecipeEditorialAuditRecord; previousStatus: EditorialStatus } {
    const recipeRow = this.db.prepare('SELECT id, recipe_id as slug, title FROM recipes WHERE id = ? OR recipe_id = ?').get(recipeId, recipeId) as any;
    if (!recipeRow) {
      throw new Error(`Rețeta cu identificatorul '${recipeId}' nu a fost găsită.`);
    }

    const canonicalId = recipeRow.id;
    const existing = this.getEditorialByRecipeId(canonicalId);
    const previousStatus: EditorialStatus = existing?.editorial_status || 'draft';
    let targetStatus: EditorialStatus = profileData.editorial_status || previousStatus;

    let profileVersion = existing?.profile_version || 1;
    let approvedBy = existing?.approved_by || null;
    let approvedAt = existing?.approved_at || null;

    // Detect material changes
    const materialChanges = existing ? detectMaterialChanges(existing, profileData) : [];

    // APPROVAL INVALIDATION RULE:
    // If already approved and material edits occurred, automatically invalidate approval!
    if (previousStatus === 'approved' && materialChanges.length > 0 && targetStatus === 'approved') {
      targetStatus = 'in_review';
      approvedBy = null;
      approvedAt = null;
      profileVersion += 1;
      rationale = `${rationale} (Aprobare invalidată automat din cauza modificării câmpurilor: ${materialChanges.join(', ')})`;
    } else if (materialChanges.length > 0) {
      profileVersion += 1;
    }

    // HUMAN APPROVER IDENTITY ENFORCEMENT:
    // Only an explicitly authorized human approver can transition status to 'approved'.
    if (targetStatus === 'approved') {
      if (actor.actor_role !== 'approver' || !actor.is_human) {
        throw new Error('FORBIDDEN: Aprobarea editorială necesită credențiale verificate de aprobator uman (Automated agents cannot approve).');
      }
      const rightsStatus = profileData.image_rights_status || existing?.image_rights_status;
      if (rightsStatus !== 'verified') {
        throw new Error('VALIDATION_ERROR: Profilul nu poate fi aprobat fără verificarea drepturilor de imagine (image_rights_status = verified).');
      }
      approvedBy = actor.actor_id; // Server-resolved human identity! Discard any client-forged value!
      approvedAt = new Date().toISOString();
    } else if (previousStatus === 'approved') {
      approvedBy = null;
      approvedAt = null;
    }

    // Run deterministic validation
    const valResult = validateEditorialProfile({ ...existing, ...profileData, recipe_id: canonicalId }, targetStatus);
    if (!valResult.isValid) {
      throw new Error(`VALIDATION_ERROR: ${valResult.errors.map((e) => e.message).join(' | ')}`);
    }

    const now = new Date().toISOString();
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.db.exec('BEGIN TRANSACTION;');
    try {
      const upsert = this.db.prepare(`
        INSERT INTO recipe_editorial (
          recipe_id, profile_version, editorial_status, editorial_subtitle, heritage,
          region_context, terroir, chef_quote, chef_tip, pairing_suggestion,
          historical_sources_json, claim_confidence, image_url, image_alt, image_caption,
          image_source_url, image_author, image_license, image_license_notes, image_attribution,
          image_rights_status, approved_by, approved_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
        ON CONFLICT(recipe_id) DO UPDATE SET
          profile_version = excluded.profile_version,
          editorial_status = excluded.editorial_status,
          editorial_subtitle = excluded.editorial_subtitle,
          heritage = excluded.heritage,
          region_context = excluded.region_context,
          terroir = excluded.terroir,
          chef_quote = excluded.chef_quote,
          chef_tip = excluded.chef_tip,
          pairing_suggestion = excluded.pairing_suggestion,
          historical_sources_json = excluded.historical_sources_json,
          claim_confidence = excluded.claim_confidence,
          image_url = excluded.image_url,
          image_alt = excluded.image_alt,
          image_caption = excluded.image_caption,
          image_source_url = excluded.image_source_url,
          image_author = excluded.image_author,
          image_license = excluded.image_license,
          image_license_notes = excluded.image_license_notes,
          image_attribution = excluded.image_attribution,
          image_rights_status = excluded.image_rights_status,
          approved_by = excluded.approved_by,
          approved_at = excluded.approved_at,
          updated_at = excluded.updated_at
      `);

      upsert.run(
        canonicalId,
        profileVersion,
        targetStatus,
        profileData.editorial_subtitle ?? existing?.editorial_subtitle ?? null,
        profileData.heritage ?? existing?.heritage ?? null,
        profileData.region_context ?? existing?.region_context ?? null,
        profileData.terroir ?? existing?.terroir ?? null,
        profileData.chef_quote ?? existing?.chef_quote ?? null,
        profileData.chef_tip ?? existing?.chef_tip ?? null,
        profileData.pairing_suggestion ?? existing?.pairing_suggestion ?? null,
        JSON.stringify(profileData.historical_sources ?? existing?.historical_sources ?? []),
        profileData.claim_confidence ?? existing?.claim_confidence ?? 'documented',
        profileData.image_url ?? existing?.image_url ?? null,
        profileData.image_alt ?? existing?.image_alt ?? null,
        profileData.image_caption ?? existing?.image_caption ?? null,
        profileData.image_source_url ?? existing?.image_source_url ?? null,
        profileData.image_author ?? existing?.image_author ?? null,
        profileData.image_license ?? existing?.image_license ?? null,
        profileData.image_license_notes ?? existing?.image_license_notes ?? null,
        profileData.image_attribution ?? existing?.image_attribution ?? null,
        profileData.image_rights_status ?? existing?.image_rights_status ?? 'unverified',
        approvedBy,
        approvedAt,
        existing?.created_at || now,
        now
      );

      // Append immutable audit log row within the SAME atomic transaction
      const auditStmt = this.db.prepare(`
        INSERT INTO recipe_editorial_audit (
          id, recipe_id, recipe_slug, recipe_title, profile_version,
          from_status, to_status, actor_id, actor_role, changed_fields_json,
          rationale, created_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `);

      const changedFields = materialChanges.length > 0 ? materialChanges : ['status_or_metadata'];
      auditStmt.run(
        auditId,
        canonicalId,
        recipeRow.slug,
        recipeRow.title,
        profileVersion,
        previousStatus,
        targetStatus,
        actor.actor_id,
        actor.actor_role,
        JSON.stringify(changedFields),
        rationale,
        now
      );

      this.db.exec('COMMIT;');
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }

    const saved = this.getEditorialByRecipeId(canonicalId)!;
    const auditRecord: RecipeEditorialAuditRecord = {
      id: auditId,
      recipe_id: canonicalId,
      recipe_slug: recipeRow.slug,
      recipe_title: recipeRow.title,
      profile_version: profileVersion,
      from_status: previousStatus,
      to_status: targetStatus,
      actor_id: actor.actor_id,
      actor_role: actor.actor_role,
      changed_fields: materialChanges,
      rationale,
      created_at: now,
    };

    return { editorial: saved, auditRecord, previousStatus };
  }

  saveRecipeWithEditorial(
    recipe: Recipe,
    editorialData: Partial<RecipeEditorialProfile> | undefined,
    actor: AuthenticatedActor,
    rationale = 'Actualizare sincronizată rețetă și profil editorial'
  ): { recipe: Recipe; editorial: RecipeEditorialProfile | null } {
    const savedRecipe = this.saveRecipe(recipe);

    let savedEditorial: RecipeEditorialProfile | null = null;
    if (editorialData) {
      const res = this.saveEditorial(savedRecipe.id, editorialData, actor, rationale);
      savedEditorial = res.editorial;
    } else {
      savedEditorial = this.getEditorialByRecipeId(savedRecipe.id);
    }

    return {
      recipe: {
        ...savedRecipe,
        editorial: savedEditorial,
      },
      editorial: savedEditorial,
    };
  }
}
