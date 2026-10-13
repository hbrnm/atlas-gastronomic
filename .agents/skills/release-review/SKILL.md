---
name: release-review
description: Prepare a release-readiness report without performing publication.
---

# Release Review

## Purpose
Prepare a release-readiness report without performing publication.

## Workflow
1. Confirm all required editorial and technical gates have evidence.
2. Check source traceability, recipe version and review history.
3. Check unresolved FAIL and NEEDS_HUMAN_REVIEW findings.
4. Confirm explicit human approval exists for the exact version.
5. If approval is absent, mark release BLOCKED.
6. Produce a release checklist and handoff; do not publish.

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
