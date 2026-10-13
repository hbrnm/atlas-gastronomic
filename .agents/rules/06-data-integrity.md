---
trigger: always_on
---

# Data integrity

Treat schemas under `standards/v1.0.0/schemas/` as the current v1.0.0 contract. Do not silently alter them.

Preserve stable IDs, explicit units, null for unknown values, provenance and version history. Ingredient references used in steps must resolve to listed ingredients. Every listed ingredient must be used or explicitly identified as serving/garnish.

Validate structure and semantic relationships separately. A JSON Schema PASS does not prove culinary correctness, source validity or editorial approval.

Any schema contract change requires a proposal, migration impact analysis and human approval before implementation.
