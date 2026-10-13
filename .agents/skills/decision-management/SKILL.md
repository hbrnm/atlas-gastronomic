---
name: decision-management
description: Create, review and supersede durable project decisions.
---

# Decision Management

## Purpose
Create, review and supersede durable project decisions.

## Workflow
1. Search DECISION_LOG.md and existing decision records for related decisions.
2. Separate facts, assumptions, options, trade-offs and recommendation.
3. Assign the next unique DEC identifier.
4. Record status as proposed, approved, rejected or superseded.
5. Do not mark approved without explicit human approval.
6. Preserve superseded records and update the index.

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
