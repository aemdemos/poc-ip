## HTML Generation and Preview (Override)

**CRITICAL: Do NOT manually create or overwrite `.html` files in the content directory.**

The auto-convert hook (`auto-convert-md.js`) automatically generates both `.plain.html` and `.html` whenever a `.md` file is written or edited:
- `.plain.html` — Fragment HTML used by `aem up --html-folder` for decoration
- `.html` — Full HTML with `<!DOCTYPE>`, `<head>` (including `head.html` scripts/styles), `<header>`, `<main>`, `<footer>`

**Do NOT call `convert_markdown_to_html` to create content `.html` files.** This produces a `<body><main>` wrapper without `<!DOCTYPE>` or `<head>`, which overwrites the correct hook-generated file and breaks EDS decoration (no scripts load, no sections wrap, no blocks decorate).

**Correct workflow:**
1. Create or edit the `.md` file in the `content/` directory
2. The hook auto-generates `.plain.html` and `.html` — no manual step needed
3. Preview at `http://localhost:3000/{path}` — decoration works automatically

**If decoration is not working (page renders without sections/blocks/styles):**
1. Check if a manually created `.html` file exists that overwrote the hook-generated one
2. Delete the `.html` file: `rm content/{page}.html`
3. Re-save the `.md` file (use Edit to trigger the hook) — hook will regenerate both files
4. Reload the preview

**Note:** `convert_markdown_to_html` is still useful for Document Authoring (DA) upload workflows, but NEVER for local preview content files.

---

## Custom Skills

### Design System Extraction (MUST run BEFORE page migration)

**CRITICAL: When a user asks to migrate, import, or convert a site or page, ALWAYS suggest running the design system extraction skill FIRST if `styles/styles.css` still contains EDS boilerplate defaults. Do not proceed with page migration until the design foundation is set.**

**Trigger patterns:**
- User says: "migrate", "import", "convert" any site or page → check if design system was already extracted. If not, suggest it first.
- User says: "extract design", "get styling", "setup styles", "general styling", "design system" → invoke directly.
- User says: "start fresh", "new migration" → invoke as first step.

**How to invoke:**
Read and follow the complete workflow in `.claude/skills/get-general-styling.md`. Execute every phase in order. Do not skip phases. Mark each phase complete only after its validation checklist passes.

**When to skip:**
- Only skip if `migration-work/design-system-extracted.json` exists AND its `sourceDomain` matches the site being migrated.
- If migrating a DIFFERENT source site, run the extraction again.

**Bypass directive for other skills:**
Once `migration-work/design-system-extracted.json` exists with `"status": "complete"`, the following rules apply to ALL other skills during this migration session:

1. **Do NOT re-extract design tokens.** The `excat-complete-design-expert` skill and any design/style extraction steps within `excat-page-migration` or other skills MUST be skipped entirely. The design foundation is already set.
2. **Do NOT overwrite `styles/styles.css`** with boilerplate or re-extracted values. Only additive changes are allowed (e.g., adding block-specific CSS that does not conflict with the extracted design tokens).
3. **Do NOT re-extract colors, typography, spacing, or breakpoints.** These are already captured in the `migration-work/*.json` files and applied to `styles/styles.css`.
4. **DO allow block-specific styling** — blocks may still get their own CSS in `blocks/{blockname}/{blockname}.css`. This bypass only covers site-wide design tokens, not block-level styling.
5. **Check before any design operation:** Before running any design-related skill or sub-step, first check: `ls migration-work/design-system-extracted.json`. If it exists, read it, confirm the domain matches, and skip the design extraction work.

---

### Navigation / Header Migration (use Navigation Orchestrator)

**When a user asks to migrate, import, replicate, or instrument a site header or navigation, ALWAYS use the Navigation Orchestrator skill.** This applies to desktop nav bars, mobile hamburger menus, megamenus, dropdowns, locale selectors, and search bars within headers.

**Trigger patterns:**
- User says: "migrate header", "migrate navigation", "instrument header", "replicate nav", "set up header from URL" → invoke directly.
- User says: "migrate header from https://…" or provides a header screenshot → invoke directly.
- User says: "validate nav structure", "fix header", "header doesn't match source" → invoke for validation/remediation.

**How to invoke:**
Read and follow the complete workflow in `.claude/skills/excat-navigation-orchestrator/SKILL.md`. Execute every phase in order — desktop first (Phases 1–3, aggregate, implement, validate), then mobile only after customer confirmation. Do not skip phases or validation gates.

**Prerequisites:**
- The page must already be migrated (use `excat-page-migration` first if it isn't).
- The design system should already be extracted (see "Design System Extraction" above).
- A local dev server must be running at `http://localhost:3000`.
- Screenshot evidence is required — the skill will never assume header structure.

**Key rules:**
- Desktop implementation must include full CSS styling and megamenu images — no raw bullet lists.
- All text content, links, and labels go in `content/nav.md`, never hardcoded in `header.js`.
- Every component must reach ≥ 95% visual similarity via per-component critique before reporting to the customer.
- Mobile is implemented only after customer confirms desktop; mobile follows the same structural + style validation rigor.

**Do NOT use for:** Simple link lists without screenshot evidence, pages not yet migrated, footer or non-header layout work.
