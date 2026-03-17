/* eslint-disable */
/* global WebImporter */

/**
 * Parser for AEM accordion components on yakkan (policy terms) pages.
 * Converts AEM .cmp-accordion structure to EDS Accordion block table.
 *
 * Handles:
 * - Extracting accordion item titles from .cmp-accordion__title
 * - Extracting PDF download button images from accordion panels
 * - Art direction: pairing desktop (-pc) images with mobile (-sp) counterparts
 * - Revision notice links (icon + text)
 * - Footnotes (※ text)
 *
 * IMPORTANT: Content is extracted in DOM order (not grouped by type) to preserve
 * the original interleaved order of PDF buttons, revision links, and footnotes.
 *
 * @param {Element} element - The accordion container element
 * @param {Object} context - { document, url, params, artDirectionMap }
 */
export default function parse(element, { document, artDirectionMap }) {
  const accordion = element.querySelector('.cmp-accordion') || element;
  const items = accordion.querySelectorAll('.cmp-accordion__item');

  if (items.length === 0) return;

  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title');
    const panel = item.querySelector('.cmp-accordion__panel');
    if (!titleEl || !panel) return;

    const title = titleEl.textContent.trim();
    const contentDiv = document.createElement('div');

    // Walk the panel DOM in document order, extracting content as encountered.
    // This preserves the interleaved order of images, revision links, and footnotes.
    function walkAndExtract(el) {
      if (!el || !el.classList) {
        // Recurse into child elements for plain containers
        if (el && el.children) {
          for (const child of el.children) {
            walkAndExtract(child);
          }
        }
        return;
      }

      // Skip mobile-only containers (art direction is handled via artDirectionMap)
      if (el.classList.contains('hb_mobile__only') || el.classList.contains('hideinpc')) {
        return;
      }

      // --- PDF image link (.cmp-image) ---
      if (el.classList.contains('cmp-image')) {
        const link = el.querySelector('.cmp-image__link');
        const img = el.querySelector('.cmp-image__image');
        if (!img) return;

        const p = document.createElement('p');

        if (link) {
          const a = document.createElement('a');
          const pdfHref = link.getAttribute('href');
          a.href = pdfHref || link.href;

          // Art direction: add mobile image first if available
          if (artDirectionMap && pdfHref && artDirectionMap.has(pdfHref)) {
            const mobileImg = document.createElement('img');
            mobileImg.src = artDirectionMap.get(pdfHref);
            mobileImg.alt = img.getAttribute('alt') || '';
            a.appendChild(mobileImg);
          }

          // Desktop image (always present)
          const desktopImg = document.createElement('img');
          desktopImg.src = img.getAttribute('src');
          desktopImg.alt = img.getAttribute('alt') || '';
          a.appendChild(desktopImg);

          p.appendChild(a);
        } else {
          const desktopImg = document.createElement('img');
          desktopImg.src = img.getAttribute('src');
          desktopImg.alt = img.getAttribute('alt') || '';
          p.appendChild(desktopImg);
        }

        contentDiv.appendChild(p);
        return; // Don't recurse into .cmp-image children
      }

      // --- Teaser description: revision links and footnotes ---
      if (el.classList.contains('cmp-teaser__description')) {
        const ps = el.querySelectorAll('p');
        ps.forEach((origP) => {
          const hasIcon = origP.querySelector('img[src*="icon"]');
          const hasLink = origP.querySelector('a');
          if (hasIcon && hasLink) {
            // Revision notice link (icon + text)
            contentDiv.appendChild(origP.cloneNode(true));
          } else if (origP.textContent.trim().startsWith('※')) {
            // Footnote
            contentDiv.appendChild(origP.cloneNode(true));
          }
        });
        return; // Don't recurse into .cmp-teaser__description children
      }

      // --- Text component: footnotes ---
      if (el.classList.contains('cmp-text')) {
        const ps = el.querySelectorAll('p');
        ps.forEach((p) => {
          if (p.textContent.trim().startsWith('※')) {
            contentDiv.appendChild(p.cloneNode(true));
          }
        });
        return; // Don't recurse into .cmp-text children
      }

      // --- Default: recurse into children ---
      for (const child of el.children) {
        walkAndExtract(child);
      }
    }

    walkAndExtract(panel);

    cells.push([[title], [contentDiv]]);
  });

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Accordion',
      cells,
    });
    element.replaceWith(block);
  }
}
