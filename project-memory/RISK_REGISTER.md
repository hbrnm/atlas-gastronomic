# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-001 | Agent fails to load a rule due to unsupported or invalid frontmatter. | Medium | High | Test rules in both IDE and CLI; keep YAML frontmatter minimal and valid. |
| R-002 | Memory files drift from actual Git state. | Medium | High | Reconcile memory against branch, status and commits at every session start. |
| R-003 | Agent treats schema validation as culinary approval. | Medium | Critical | Separate structural validation from semantic and human editorial gates. |
| R-004 | Placeholder schema IDs become permanent. | Medium | Medium | Resolve public namespace before schema contract expansion. |
| R-005 | Standards are edited in place without version history. | Medium | High | Preserve v1.0.0 intact and require approval for later versions. |
| R-006 | User changes are overwritten while applying the bundle. | Medium | High | Inspect local status and merge README rather than blindly replacing it. |
