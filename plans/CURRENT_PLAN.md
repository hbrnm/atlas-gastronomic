# Current Plan — PHASE 1

## Objective
Apply the Atlas AOS foundation to the local `hbrnm/atlas-gastronomic` checkout without overwriting user work.

## Scope
- `GEMINI.md`
- `.agents/rules/` (8 rules)
- `.agents/skills/` (12 skills)
- `project-memory/` initial files and decision records
- `standards/v1.0.0/` exact imported Standards Pack
- `plans/` roadmap and PHASE 0 report
- repository README integration

## Execution sequence
1. Inspect `git status`, branch and local tree.
2. Reconcile any local files with this bundle; never overwrite unreviewed work.
3. Copy the versioned Standards Pack intact.
4. Add root instructions, rules, skills, memory and plans.
5. Merge the README introduction and links.
6. Validate Markdown/YAML frontmatter and JSON examples.
7. Verify Antigravity loads rules and skills in IDE and CLI.
8. Run a new-session recovery test.
9. Review diff and commit on a feature branch, not `main`.

## Acceptance criteria
- All expected files exist and are tracked.
- Original Standards Pack v1.0.0 files remain unchanged.
- Every rule has valid frontmatter and an explicit trigger.
- Every skill has a `SKILL.md`, name, description, workflow, output and failure conditions.
- Human approval and publication restrictions are explicit.
- Memory distinguishes verified facts, approved decisions and open questions.
- IDE and CLI behavior is tested rather than assumed.
- No unrelated application stack or dependencies are introduced.

## Not in PHASE 1
- No application code or database.
- No schema contract redesign.
- No automated publishing.
- No external framework installation.
- No CI assumptions before the application stack is known.
