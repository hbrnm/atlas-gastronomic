# Atlas Gastronomic — Project Memory Index

This directory is the durable operational memory of Atlas Gastronomic. Keep entries factual, dated and traceable.

## Read at every session start
1. `PROJECT_IDENTITY.md` — mission, scope and invariants.
2. `PROJECT_STATE.md` — current verified project state.
3. `SESSION_STATE.md` — active work and recovery checkpoint.
4. `DECISION_LOG.md` — decision index and approval status.
5. `OPEN_QUESTIONS.md` — unresolved questions.
6. `TASK_REGISTRY.md` — active and queued work.
7. `KNOWLEDGE_BASE.md` — durable knowledge with provenance.
8. `RISK_REGISTER.md` — known project risks.

Then inspect the latest report in `sessions/` and snapshot in `snapshots/`, if any.

## Authority and conflict handling
1. Current repository contents and Git history for implementation state.
2. Explicitly approved decision records for project decisions.
3. Versioned standards under `standards/` for editorial and data contracts.
4. Current project state and task registry.
5. Session reports and snapshots.
6. Conversation recollection or unverified assumptions.

If two canonical sources conflict, do not silently resolve the conflict. Record it in `OPEN_QUESTIONS.md` and request a human decision.

## Memory conventions
- Dates: ISO 8601 (`YYYY-MM-DD`); timestamps include timezone when relevant.
- Decisions: `DEC-0001`, `DEC-0002`, sequential and never reused.
- Tasks: `TASK-0001`, `TASK-0002`, sequential and never reused.
- Claims: retain source identity and confidence.
- Unknown: write `unknown` or `null`, not a guess.
- Historical reports are append-only; corrections should be explicit.
