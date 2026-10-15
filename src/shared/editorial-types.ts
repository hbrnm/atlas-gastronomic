/**
 * Atlas Gastronomic — Editorial Presentation & Provenance Types
 * Strictly decoupled from Recipe Core V1 domain invariants.
 */

export type EditorialStatus = 'draft' | 'in_review' | 'needs_revision' | 'approved';

export type ImageLicense =
  | 'CC0-1.0'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'Public-Domain-Mark'
  | 'Unsplash-License'
  | 'Proprietary-Atlas'
  | 'Custom-Documented';

export type ImageRightsStatus = 'unverified' | 'verification_pending' | 'verified' | 'restricted';

export type EditorialClaimConfidence = 'documented' | 'widely_attested' | 'editorial_interpretation' | 'uncertain';

export type ActorRole = 'editor' | 'reviewer' | 'approver' | 'system';

export interface RecipeEditorialProfile {
  recipe_id: string;
  profile_version: number;
  editorial_status: EditorialStatus;
  editorial_subtitle?: string | null;
  heritage?: string | null;
  region_context?: string | null;
  terroir?: string | null;
  chef_quote?: string | null;
  chef_tip?: string | null;
  pairing_suggestion?: string | null;
  historical_sources?: string[];
  claim_confidence?: EditorialClaimConfidence;
  image_url?: string | null;
  image_alt?: string | null;
  image_caption?: string | null;
  image_source_url?: string | null;
  image_author?: string | null;
  image_license?: ImageLicense | null;
  image_license_notes?: string | null;
  image_attribution?: string | null;
  image_rights_status: ImageRightsStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeEditorialAuditRecord {
  id: string;
  recipe_id: string;
  recipe_slug: string;
  recipe_title: string;
  profile_version: number;
  from_status: EditorialStatus | null;
  to_status: EditorialStatus;
  actor_id: string;
  actor_role: ActorRole;
  changed_fields: string[];
  rationale: string;
  created_at: string;
}

export interface EditorialValidationIssue {
  field: string;
  message: string;
  code: string;
}

export interface EditorialValidationResult {
  isValid: boolean;
  errors: EditorialValidationIssue[];
  warnings: EditorialValidationIssue[];
}
