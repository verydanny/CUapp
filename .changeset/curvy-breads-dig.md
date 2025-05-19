---
'cuapp': patch
---

feat(workflow): enhance feature rule for DX and self-updates

**Overview:**
This change significantly updates the `.cursor/rules/feature-workflow.mdc` rule to provide clearer guidelines for handling Developer Experience (DX), tooling, and workflow-related changes, including modifications to the rule itself.

**Key Changes:**

- Explicitly classifies DX/tooling/workflow updates as features.
- Provides branch naming conventions for these types of changes (e.g., `feat/workflow/...`, `feat/dx/...`).
- Clarifies documentation expectations for DX changes (often the rule/script is the primary doc).
- Recommends `patch` version bumps for DX changes impacting package development processes.
- Standardizes commit scopes (e.g., `feat(workflow):`, `feat(dx):`).
- Added a 'Cursor Rule Modification Protocol' to ensure `cursor-rules.mdc` is consulted.

**Developer Impact:**

- Provides a more robust and consistent process for all types of feature development.
- Reduces ambiguity when handling non-application code changes.
- Ensures that improvements to the development process itself are versioned and documented.

**Documentation:**

- Updated `.cursor/rules/feature-workflow.mdc`.
