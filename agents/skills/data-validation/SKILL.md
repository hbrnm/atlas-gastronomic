---
name: data-validation
description: Validate recipe data structure and cross-entity consistency.
---

# Data Validation

## Purpose
Validate recipe data structure and cross-entity consistency.

## Workflow
1. Validate JSON against the declared schema draft and schema version.
2. Check required fields, types, enums, units and stable identifiers.
3. Check ingredient IDs and step ingredient references.
4. Check duplicate and consecutive step numbers.
5. Check that every ingredient is used or explained as garnish/serving.
6. Check timing and yield consistency where determinable.
7. Report structural and semantic findings separately.

## Output
Provide a concise result with:
- scope and inputs;
- actions performed;
- evidence and references;
- findings and confidence;
- unresolved questions and blockers;
- exact files changed, if any;
- verification results.

## Failure conditions
Stop and report the blocker if required evidence is unavailable, source identity cannot be verified, a material contradiction remains unresolved, an approval boundary is reached, or the requested outcome would require inventing information.
