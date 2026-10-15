import {
  RecipeEditorialProfile,
  EditorialStatus,
  EditorialValidationResult,
  EditorialValidationIssue,
  ImageLicense,
} from './editorial-types.js';

const VALID_LICENSES: ImageLicense[] = [
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'Public-Domain-Mark',
  'Unsplash-License',
  'Proprietary-Atlas',
  'Custom-Documented',
];

export function validateEditorialProfile(
  profile: Partial<RecipeEditorialProfile>,
  targetStatus: EditorialStatus = profile.editorial_status || 'draft'
): EditorialValidationResult {
  const errors: EditorialValidationIssue[] = [];
  const warnings: EditorialValidationIssue[] = [];

  if (!profile.recipe_id || profile.recipe_id.trim().length === 0) {
    errors.push({
      field: 'recipe_id',
      code: 'ERR_RECIPE_ID_REQUIRED',
      message: 'ID-ul rețetei asociate este obligatoriu.',
    });
  }

  if (profile.image_license && !VALID_LICENSES.includes(profile.image_license)) {
    errors.push({
      field: 'image_license',
      code: 'ERR_INVALID_LICENSE',
      message: `Licența '${profile.image_license}' nu face parte din taxonomia controlată permisă.`,
    });
  }

  if (profile.image_license === 'Custom-Documented' && (!profile.image_license_notes || profile.image_license_notes.trim().length === 0)) {
    errors.push({
      field: 'image_license_notes',
      code: 'ERR_LICENSE_NOTES_REQUIRED',
      message: 'Pentru o licență Custom-Documented, notele explicative ale termenilor legali sunt obligatorii.',
    });
  }

  // Mandatory constraints for in_review and approved
  if (targetStatus === 'in_review' || targetStatus === 'approved') {
    if (!profile.editorial_subtitle || profile.editorial_subtitle.trim().length < 8) {
      errors.push({
        field: 'editorial_subtitle',
        code: 'ERR_SUBTITLE_TOO_SHORT',
        message: 'Subtitlul editorial trebuie să aibă cel puțin 8 caractere.',
      });
    }

    if (!profile.terroir || profile.terroir.trim().length < 10) {
      errors.push({
        field: 'terroir',
        code: 'ERR_TERROIR_REQUIRED',
        message: 'Notele de terroir și proveniență trebuie să aibă cel puțin 10 caractere.',
      });
    }

    if (!profile.chef_quote || profile.chef_quote.trim().length < 10) {
      errors.push({
        field: 'chef_quote',
        code: 'ERR_CHEF_QUOTE_REQUIRED',
        message: 'Citatul bucătarului trebuie să aibă cel puțin 10 caractere.',
      });
    }

    if (!profile.chef_tip || profile.chef_tip.trim().length < 10) {
      errors.push({
        field: 'chef_tip',
        code: 'ERR_CHEF_TIP_REQUIRED',
        message: 'Sfatul tehnic al bucătarului trebuie să aibă cel puțin 10 caractere.',
      });
    }

    if (!profile.pairing_suggestion || profile.pairing_suggestion.trim().length < 3) {
      errors.push({
        field: 'pairing_suggestion',
        code: 'ERR_PAIRING_REQUIRED',
        message: 'Asocierea culinară (vin/băutură) este obligatorie pentru revizuire și aprobare.',
      });
    }

    if (!profile.image_url || profile.image_url.trim().length === 0) {
      errors.push({
        field: 'image_url',
        code: 'ERR_IMAGE_URL_REQUIRED',
        message: 'Activul fotografic este obligatoriu pentru revizuire și aprobare.',
      });
    }

    if (!profile.image_source_url || profile.image_source_url.trim().length === 0) {
      errors.push({
        field: 'image_source_url',
        code: 'ERR_IMAGE_SOURCE_REQUIRED',
        message: 'Sursa activului fotografic (URL sau arhivă) este obligatorie pentru trasabilitate.',
      });
    }

    if (!profile.image_license) {
      errors.push({
        field: 'image_license',
        code: 'ERR_IMAGE_LICENSE_REQUIRED',
        message: 'Licența imaginii trebuie declarată explicit din taxonomia controlată.',
      });
    }
  }

  // Specific Approval Invariants
  if (targetStatus === 'approved') {
    if (profile.image_rights_status !== 'verified') {
      errors.push({
        field: 'image_rights_status',
        code: 'ERR_RIGHTS_NOT_VERIFIED',
        message: 'Profilul editorial nu poate fi aprobat fără verificarea drepturilor de imagine (image_rights_status = verified).',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export const MATERIAL_EDITORIAL_FIELDS = [
  'editorial_subtitle',
  'heritage',
  'region_context',
  'terroir',
  'chef_quote',
  'chef_tip',
  'pairing_suggestion',
  'image_url',
  'image_source_url',
  'image_license',
  'historical_sources',
] as const;

export function detectMaterialChanges(
  current: RecipeEditorialProfile,
  incoming: Partial<RecipeEditorialProfile>
): string[] {
  const changed: string[] = [];

  for (const field of MATERIAL_EDITORIAL_FIELDS) {
    if (field in incoming) {
      const currentVal = (current as any)[field];
      const incomingVal = (incoming as any)[field];

      if (Array.isArray(currentVal) || Array.isArray(incomingVal)) {
        const currJson = JSON.stringify(currentVal || []);
        const incJson = JSON.stringify(incomingVal || []);
        if (currJson !== incJson) {
          changed.push(field);
        }
      } else {
        const cNorm = currentVal === null || currentVal === undefined ? '' : String(currentVal).trim();
        const iNorm = incomingVal === null || incomingVal === undefined ? '' : String(incomingVal).trim();
        if (cNorm !== iNorm) {
          changed.push(field);
        }
      }
    }
  }

  return changed;
}
