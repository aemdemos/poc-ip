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

## Project Conventions (Source: americanhome.co.jp)

**Breakpoints:** The original site (americanhome.co.jp) uses `768px` as its primary mobile→desktop content breakpoint and `1024px` for the header/navigation desktop switch. General content and block CSS should use `@media (width >= 768px)`. The header block uses `@media (width >= 1024px)` to match the original site's navigation breakpoint. Do NOT use `600px` from EDS boilerplate defaults.

**Boilerplate blocks:** Several blocks still contain untouched EDS boilerplate CSS (e.g., `form`, `tabs`, `table`). When styling these blocks, replace any boilerplate `600px` breakpoints with `768px` to match the project convention.

**Image art direction:** The original site uses server-side device detection to serve different images for mobile vs desktop (e.g., `-sp.jpeg` for mobile, `-pc.jpeg` for desktop). The carousel block supports art direction by authoring two images per cell in markdown (mobile first, desktop second). The `carousel.js` `createSlide` function merges them into a single `<picture>` element with a `<source media="(min-width: 768px)">` for desktop and the mobile image as the `<img>` fallback.

---

## Mobile vs Desktop Image Art Direction (CRITICAL — applies to ALL page migrations)

**CRITICAL: The original site (americanhome.co.jp) uses server-side User-Agent detection to serve DIFFERENT HTML for mobile vs desktop.** This means images, and sometimes entire content blocks, differ between the two versions. Every page migration MUST account for this.

**During migration, ALWAYS perform a dual-fetch of the source page:**
1. Fetch with a **desktop** User-Agent (or use the default browser) to get the desktop HTML/images.
2. Fetch with a **mobile** User-Agent (e.g., iPhone Safari) to get the mobile HTML/images.
3. Compare all `<img>` elements between the two responses. Any image that differs (different URL, different filename, different rendition size) requires art direction handling.

**What to look for — common patterns on this site:**
- **Different filenames:** Desktop uses `-pc.png`/`-pc.jpeg`, mobile uses `-sp.png`/`-sp.jpeg` or a differently named file (e.g., `btn03-pc.png` on desktop → `btn02.png` on mobile).
- **Different rendition sizes:** Same filename but different `image.coreimg.XX.YYY.png` dimensions (e.g., desktop `540px` vs mobile `320px`). The container path also differs: `container_1888795670` (desktop) vs `container_860166202_` (mobile).
- **Content images, CTA button images, illustration images, H3 header images, anchor link icons** — ALL image types can have mobile/desktop variants. Do not assume only "hero" or "banner" images have art direction.

**How to author art direction in EDS content:**
- Place **two consecutive `<img>` elements** inside the same parent — mobile image FIRST, desktop image SECOND.
- For images inside `<p>` tags: `<p><img src="mobile.png" alt="..."><img src="desktop.png" alt="..."></p>`
- For images inside `<a>` tags: `<a href="..."><img src="mobile.png" alt="..."><img src="desktop.png" alt="..."></a>`
- For images inside `<h3>` tags: `<h3><img src="mobile.png" alt="..."><img src="desktop.png" alt="...">Text</h3>`

**CSS art direction rules (add to template CSS):**
```css
/* Mobile (base): hide desktop image (second consecutive img) */
body.<template> p > img + img,
body.<template> h3 > img + img,
body.<template> a > img + img {
  display: none;
}

/* Desktop (>= 768px): hide mobile image, show desktop image */
@media (width >= 768px) {
  body.<template> p > img:has(+ img),
  body.<template> h3 > img:has(+ img),
  body.<template> a > img:has(+ img) {
    display: none;
  }

  body.<template> p > img + img,
  body.<template> h3 > img + img,
  body.<template> a > img + img {
    display: inline;
  }
}
```

**Checklist for every page migration:**
- [ ] Fetched page with both mobile and desktop User-Agents
- [ ] Compared all images between the two responses
- [ ] Identified all images that differ (filename, URL, or rendition size)
- [ ] Authored two `<img>` elements (mobile first, desktop second) for every differing image
- [ ] Added CSS art direction rules to the template CSS
- [ ] Verified on mobile viewport (375px): correct mobile images shown, desktop images hidden
- [ ] Verified on desktop viewport (1280px): correct desktop images shown, mobile images hidden

---

## Template Convention (Per-Page Templates)

**CRITICAL: Every newly migrated page MUST get its own dedicated template.** Do NOT reuse an existing template (e.g., `customers`, `claim`) for a new page unless the user explicitly requests it.

**How templates work:** Each page's content `.metadata` block includes a `template` value (e.g., `template: family-registration`). The EDS `processPageMetadata()` function sets `<meta name="template">` from this, then `decorateTemplateAndTheme()` adds the slug as a body class and `loadCSS()` loads `templates/<slug>/<slug>.css`. No hardcoded mapping in JS is needed.

**Rules:**
1. When migrating a new page, create a new template directory at `templates/<page-slug>/` with its own CSS file.
2. Set the `template` value in the page's content `.metadata` block (in `.plain.html`) to match the slug. The EDS pipeline handles the rest automatically.
3. The template CSS should contain page-specific styling (e.g., navy H1 banner, section spacing, heading sizes) — copy the relevant rules from the closest existing template as a starting point, then adjust.
4. **Reuse an existing template ONLY if the user explicitly says** "use the X template" or "same template as Y page" or similar.
5. Each page template is a potential "template head" — future pages may eventually share it, but that decision belongs to the user, not to the assistant.
6. Template CSS class is the slug name applied to `<body>` (e.g., `body.family-registration`). Update all selectors accordingly.
7. **Do NOT hardcode template mappings in JavaScript.** The content metadata is the single source of truth.

**Example:** Migrating `/home/customers/family-registration` → create `templates/family-registration/family-registration.css` with `body.family-registration ...` selectors, and set `template: family-registration` in the page's `.metadata` block.

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

---

## Migration Learnings (americanhome.co.jp)

**INSTRUCTION: When a new lesson is learned during migration work on this project, append it to this section. Keep entries concise (1-3 sentences). These learnings persist across sessions and must always be followed.**

1. **Every page gets its own template.** Always create a dedicated `templates/<slug>/<slug>.css` for each migrated page. Never reuse an existing template unless the user explicitly asks to. Page-specific styling (spacing, colors, heading sizes) belongs in the template CSS, not in `styles/styles.css`.

2. **Always check images for mobile variants.** The original site serves different images for mobile vs desktop via server-side UA detection. Every page migration must dual-fetch (desktop + mobile UA), compare all `<img>` elements, and author two consecutive `<img>` tags (mobile first, desktop second) for any that differ. Missing this produces wrong images on one viewport.

3. **No broad CSS rules for linked images in styles.css.** Rules like `p > a > img { max-width: 85% }` affect ALL linked images (card icons, navigation images, illustrations) — not just CTA buttons. Always scope image sizing to specific templates or blocks, never globally.

4. **Measure vertical spacing per-section against the original.** Do not apply uniform margins (e.g., `margin: 60px 0`) to all sections with a shared class like `.narrow`. Measure each gap between sections on the original page using `getBoundingClientRect()` and override per-section in the template CSS with `nth-of-type` selectors.

5. **Verify section boundaries against the original's background colors.** Content that looks grouped may span separate containers with different backgrounds on the original (e.g., H1 on navy, description on white). Always inspect `computedStyle.backgroundColor` up the ancestor chain before grouping content into a single EDS section.

6. **Auto-convert hook is currently broken.** The hook at `.claude/skills/hooks/auto-convert-md.js` fails with `ERR_MODULE_NOT_FOUND` for `conversion-tools.js`. When creating or editing `.md` files, also manually create/update both `.plain.html` and `.html` until this dependency is fixed.

7. **Always verify Playwright viewport size before measuring.** Playwright's default viewport can be narrow (e.g., 780px). Before extracting computed widths from the original site, explicitly resize to 1280px with `browser_resize`. A content area that fills 100% at a small viewport is NOT a "fixed 780px max-width" — it's responsive. Never hardcode a pixel `max-width` from a single measurement; instead, inspect the CSS rules (`max-width`, `padding`, nesting) to understand the responsive formula and replicate it with `calc()`.

8. **The original site uses `.flexbox-container` for content width on ALL pages.** Every page on americanhome.co.jp uses a consistent `.flexbox-container` class with `max-width: 85%; margin: 0 auto; padding: 0 15px;` to constrain content width. Pages nest multiple levels of `.flexbox-container` to progressively narrow content. When analyzing any page, look for `.flexbox-container` elements in the DOM and count nesting levels — this determines the EDS layout approach.

   **How to implement in EDS:** The global `styles/styles.css` already replicates this with two-level nesting for `.section.narrow`:
   - Level 1: `main > .section.narrow` gets `max-width: 85%; margin: auto; padding: 0 15px;` (at `>1200px`)
   - Level 2: `main > .section.narrow > div` gets `max-width: 85%; padding: 0 15px;`
   - At `<=1200px`: both levels use `max-width: 100%` (matching the original's `@media (max-width: 1024px)` rule)

   **For full-width sections (e.g., navy H1 banners) that need content aligned with narrow sections below:** The section's inner div already gets `max-width: 85%` from the global `main > .section > div` rule (level 1). To simulate level 2, add `padding-left: calc(7.5% + 15px)` to the content element — the `7.5%` resolves against the div's content box and replicates the centering margin of the second `.flexbox-container`, and `15px` replicates its padding.

   **NEVER use hardcoded pixel max-widths or computed `calc()` approximations like `calc(72.25% - 56px)`.** Always use the same `85%` building blocks the original site uses. The original's responsive breakpoints handle the rest: `100%` at `<=1024px`, `99%` at `1025px–1200px`, `85%` at `>1200px`.

   **CSS shorthand caution:** When overriding section margins in template CSS (e.g., per-section spacing with `nth-of-type`), always use longhand `margin-top`/`margin-bottom` — never shorthand `margin: X 0` which resets `margin-left: auto; margin-right: auto` and breaks centering.
