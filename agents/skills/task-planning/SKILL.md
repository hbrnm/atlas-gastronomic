---
name: task-planning
description: Create a scoped, risk-aware execution plan before non-trivial changes.
---

# Task Planning

## Purpose
Create a scoped, risk-aware execution plan before non-trivial changes.

## Workflow
1. Restate the requested outcome and constraints.
2. Inspect relevant files and current Git state.
3. Identify dependencies, affected paths, risks and approval boundaries.
4. Define observable acceptance criteria and verification commands.
5. Prefer the smallest coherent change set.
6. Present the plan before execution when the change is broad or canonical.

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
