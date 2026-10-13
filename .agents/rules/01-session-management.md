---
trigger: always_on
---

# Session management

At session start, recover context from `project-memory/INDEX.md`, identity, project state, session state, decision log, open questions and task registry. Inspect the latest session report and snapshot when available.

Reconcile memory against the current Git branch, working tree and recent commits. Do not assume the last session ended cleanly.

Before substantial work, write a scoped plan with affected paths, dependencies, risks and acceptance criteria. For long tasks, maintain checkpoints in `SESSION_STATE.md`.

At handoff, update session state, task registry and a dated report under `project-memory/sessions/`. Record incomplete work and exact next steps. Do not claim persistence unless files were actually written and verified.
