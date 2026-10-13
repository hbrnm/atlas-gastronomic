---
trigger: always_on
---

# Human approval gate

Automated checks and editorial scores are advisory. They cannot approve or publish a recipe.

Only an explicitly identified human editor may approve the exact content version. Approval evidence must identify the recipe, version, reviewer, timestamp and decision. Any material change after approval invalidates that approval and returns the item to review.

The agent must never set `human_approved` or `published`, trigger publication, or imply approval from a passing score.
