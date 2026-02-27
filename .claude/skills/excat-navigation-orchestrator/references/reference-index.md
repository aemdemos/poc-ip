# Reference Index — Navigation Orchestrator

| Category | Files |
|----------|-------|
| **Validation artifacts** | Phase JSON files under `blocks/header/navigation-validation/` — see `references/validation-artifacts.md` |
| **Output schema** | `references/output-contract.json` |
| **Sub-agent schemas** | `references/desktop-navigation-agent-schema.json`, `references/mobile-navigation-agent-schema.json`, `references/megamenu-schema.json`, `references/validation-agent-schema.json` |
| **Structural comparison** | `references/structural-summary-schema.json`; `scripts/compare-structural-schema.js` (threshold **95%**, `--output-register` flag) |
| **Style register** | `references/style-register-schema.json`; runtime: `blocks/header/navigation-validation/style-register.json` |
| **Schema register** | `references/schema-register-schema.json`; written by compare script |
| **Megamenu mapping** | `references/megamenu-mapping-schema.json`; runtime: `megamenu-mapping.json` (source) + `migrated-megamenu-mapping.json` |
| **Megamenu behavior register** | `references/megamenu-behavior-register-schema.json`; runtime: `megamenu-behavior-register.json`; written by `scripts/compare-megamenu-behavior.js` |
| **Per-component critique** | `nav-component-critique/SKILL.md` — steps A–G; replaces external critique skills for header |
| **Visual style comparison** | `nav-component-critique/SKILL.md` Step E — PRIMARY method for style scoring; visual screenshot comparison with structured scoring rubric |
| **Mobile validation** | `mobile/` subdirectory — `mobile-schema-register.json`, `mobile-style-register.json`, `mobile-heading-coverage.json`, `mobile-behavior-register.json`, `mobile/critique/` |
| **Enforcement** | `hooks/nav-validation-gate.js` — 14 PostToolUse gates + 15 Stop checks (desktop + mobile); logs tagged [DESKTOP]/[MOBILE]/[CRITIQUE] |
| **Nav content validation** | `scripts/validate-nav-content.js` — MANDATORY after every nav.md write; exit 0 = pass |
| **Debug log** | `blocks/header/navigation-validation/debug.log` |

**Critique proof (hook-enforced):** Every validated component in `style-register.json` must have `critiqueReportPath`, `screenshotSourcePath`, `screenshotMigratedPath` (all existing on disk), and `critiqueIterations >= 1`. Self-assessed scores are rejected.
