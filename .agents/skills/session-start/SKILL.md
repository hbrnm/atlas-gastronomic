---
name: session-start
description: Recover project context and reconcile the current repository state before work.
---

# Session Start

## Purpose
Recover project context and reconcile the current repository state before work.

## Workflow
1. Read GEMINI.md and applicable rules.
2. Read project-memory/INDEX.md and all core memory files.
3. Inspect latest session report and snapshot.
4. Inspect Git branch, status and recent commits.
5. Reconcile discrepancies and list active tasks, blockers and unknowns.
6. Summarize recovered context without inventing missing history.

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
