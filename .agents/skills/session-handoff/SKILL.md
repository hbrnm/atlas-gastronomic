---
name: session-handoff
description: Persist verified progress and prepare a reliable continuation point.
---

# Session Handoff

## Purpose
Persist verified progress and prepare a reliable continuation point.

## Workflow
1. Summarize the task, scope and acceptance criteria.
2. List exact files changed and observed verification results.
3. Update SESSION_STATE.md and TASK_REGISTRY.md with factual status.
4. Record durable decisions only in the decision log and individual decision records.
5. Write a dated session report under project-memory/sessions/.
6. List blockers, unverified items and exact next actions.

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
