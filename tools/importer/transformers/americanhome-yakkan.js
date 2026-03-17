/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for American Home Insurance yakkan (policy terms) template
 * Applies to: pa_yakkan, npp_no_yakkan (and ah_no_yakkan)
 *
 * Handles:
 * - Art direction mapping (build mobile→desktop image pairs before cleanup)
 * - Sub-navigation extraction (3 policy page tabs)
 * - H1 banner section break
 * - Intro text + contact CTA
 * - H2 content sections with explanatory text
 * - Accordion block conversion (AEM accordion → EDS accordion)
 * - Contact section styling
 * - Adobe Reader notice
 * - Reference codes
 * - Section breaks + Section Metadata (narrow)
 * - Template metadata (yakkan)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Module-level art direction map: PDF href → mobile image src
const artDirectionMap = new Map();

function createNarrowMeta(document) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [[['style'], ['narrow']]],
  });
}

export default function transform(hookName, element, payload) {
  const { document: doc } = payload;

  if (hookName === TransformHook.beforeTransform) {
    // ── Phase 0: Build art direction map BEFORE cleanup removes mobile containers ──
    artDirectionMap.clear();
    const mobileContainers = element.querySelectorAll(
      '.hb_mobile__only, [class*="hb_mobile__only"]'
    );
    mobileContainers.forEach((container) => {
      const links = container.querySelectorAll('a[href*=".pdf"]');
      links.forEach((link) => {
        const img = link.querySelector('img');
        if (img) {
          const href = link.getAttribute('href');
          const src = img.getAttribute('src');
          if (href && src && !artDirectionMap.has(href)) {
            artDirectionMap.set(href, src);
          }
        }
      });
    });
    console.log(`[yakkan] Art direction map: ${artDirectionMap.size} entries`);

    // Remove hideinpc-only containers (some pages may have these)
    WebImporter.DOMUtils.remove(element, ['.hideinpc']);
  }

  if (hookName === TransformHook.afterTransform) {
    // At this point, cleanup has removed header, footer, and hb_mobile__only containers.
    // The remaining DOM has desktop content (with hideinmobile class).

    // ── 1. Extract sub-navigation ──
    // Find the teaser containing policynav icons
    const subNavP = element.querySelector('p:has(img[src*="policynav"])');
    if (subNavP) {
      // The sub-nav is already clean text/links/images in a <p>, just needs section break after
      const subNavContainer = subNavP.closest('.flexbox-container') || subNavP.parentElement;
      // Move sub-nav paragraph to top level
      if (subNavContainer && subNavContainer !== element) {
        subNavContainer.before(subNavP);
        // Clean up empty container
        if (subNavContainer.textContent.trim() === '') {
          subNavContainer.remove();
        }
      }
    }

    // ── 2. H1 section break ──
    const h1 = element.querySelector('h1');
    if (h1) {
      // Move H1 out of its deeply nested container
      const h1Container = h1.closest('.coreblue') || h1.closest('.flexbox-container');
      if (h1Container) {
        h1Container.replaceWith(h1);
      }
    }

    // ── 3. Extract intro description text ──
    // Find teasers with description text (after cleanup, these are in the content area)
    // EXCLUDE teasers that have H2/H3 headings (.dttitlecoreblue, .bottom-border-h3)
    // — those are handled in phase 6 which preserves the heading
    const descTeasers = element.querySelectorAll('.cmp-teaser__description');
    descTeasers.forEach((desc) => {
      const ps = desc.querySelectorAll('p');
      const teaser = desc.closest('.teaserflex');
      if (!teaser || ps.length === 0) return;
      // Skip teasers that contain headings — handled in phase 6
      if (teaser.classList.contains('dttitlecoreblue')
        || teaser.classList.contains('dttitlecoredgray')
        || teaser.matches('.bottom-border-h3')
        || teaser.querySelector('.cmp-teaser__title')) return;
      const frag = doc.createDocumentFragment();
      ps.forEach((p) => frag.appendChild(p.cloneNode(true)));
      teaser.replaceWith(frag);
    });

    // ── 4. Extract clickable images (CTA buttons outside accordion AND contact box) ──
    const clickableImages = element.querySelectorAll(
      '.jp-imageclickable-2:not(.cmp-accordion__panel .jp-imageclickable-2)'
    );
    clickableImages.forEach((imgEl) => {
      // Skip images inside contact box — handled in phase 8
      if (imgEl.closest('.paleblueborder.completeborder')) return;
      const link = imgEl.querySelector('.cmp-image__link');
      const img = imgEl.querySelector('.cmp-image__image');
      if (link && img) {
        const p = doc.createElement('p');
        const a = doc.createElement('a');
        a.href = link.getAttribute('href') || link.href;
        a.appendChild(img.cloneNode(true));
        p.appendChild(a);
        imgEl.replaceWith(p);
      } else if (img) {
        const p = doc.createElement('p');
        p.appendChild(img.cloneNode(true));
        imgEl.replaceWith(p);
      }
    });

    // ── 5. Extract standalone images (Adobe Reader logo, etc.) ──
    const standaloneImages = element.querySelectorAll(
      '.cmp-image:not(.cmp-accordion__panel .cmp-image):not(.jp-imageclickable-2 .cmp-image)'
    );
    standaloneImages.forEach((imgEl) => {
      const img = imgEl.querySelector('.cmp-image__image');
      if (img) {
        const p = doc.createElement('p');
        p.appendChild(img.cloneNode(true));
        imgEl.replaceWith(p);
      }
    });

    // ── 6. Extract H2/H3 from teasers (preserve heading + description) ──
    const headingTeasers = element.querySelectorAll(
      '.dttitlecoreblue, .dttitlecoredgray, .bottom-border-h3'
    );
    headingTeasers.forEach((teaser) => {
      const frag = doc.createDocumentFragment();
      // Extract the heading (H2 or H3) from the teaser title
      const titleEl = teaser.querySelector('.cmp-teaser__title');
      if (titleEl) {
        frag.appendChild(titleEl.cloneNode(true));
      }
      // Extract description children
      const innerDesc = teaser.querySelector('.cmp-teaser__description');
      if (innerDesc) {
        const children = Array.from(innerDesc.children);
        children.forEach((child) => frag.appendChild(child.cloneNode(true)));
      }
      teaser.replaceWith(frag);
    });

    // ── 7. Extract text components ──
    const textComponents = element.querySelectorAll('.cmp-text');
    textComponents.forEach((textEl) => {
      const frag = doc.createDocumentFragment();
      const children = Array.from(textEl.children);
      children.forEach((child) => frag.appendChild(child.cloneNode(true)));
      const textContainer = textEl.closest('.text') || textEl;
      textContainer.replaceWith(frag);
    });

    // ── 8. Contact section ──
    // Find the paleblueborder box containing H2 "お問い合わせ先"
    const contactBoxes = element.querySelectorAll('.paleblueborder.completeborder:not(.topborder)');
    contactBoxes.forEach((box) => {
      const h2 = box.querySelector('h2');
      if (h2 && h2.textContent.includes('お問い合わせ先')) {
        const frag = doc.createDocumentFragment();
        frag.appendChild(h2.cloneNode(true));
        // Get description text
        const descPs = box.querySelectorAll('.cmp-teaser__description p');
        descPs.forEach((p) => frag.appendChild(p.cloneNode(true)));
        // Get CTA button image
        const btnLink = box.querySelector('.cmp-image__link');
        const btnImg = box.querySelector('.cmp-image__image');
        if (btnLink && btnImg) {
          const p = doc.createElement('p');
          const a = doc.createElement('a');
          a.href = btnLink.getAttribute('href') || btnLink.href;
          a.appendChild(btnImg.cloneNode(true));
          p.appendChild(a);
          frag.appendChild(p);
        }
        box.replaceWith(frag);
      }
    });

    // ── 9. Adobe Reader notice (separate section from contact) ──
    const adobeBoxes = element.querySelectorAll('.aiglightgray.ltgrayborder.completeborder');
    adobeBoxes.forEach((box) => {
      const frag = doc.createDocumentFragment();
      // Add section break before Adobe Reader (separates it from contact section)
      frag.appendChild(createNarrowMeta(doc));
      frag.appendChild(doc.createElement('hr'));
      const img = box.querySelector('.cmp-image__image');
      if (img) {
        const p = doc.createElement('p');
        p.appendChild(img.cloneNode(true));
        frag.appendChild(p);
      }
      const texts = box.querySelectorAll('.cmp-teaser__description p, .cmp-text p');
      texts.forEach((p) => frag.appendChild(p.cloneNode(true)));
      box.replaceWith(frag);
    });

    // ── 10. Clean up remaining AEM containers ──
    // Unwrap flexbox-container and responsivegrid wrappers
    const unwrapSelectors = [
      '.flexbox-container',
      '.responsivegrid:not([class*="root"])',
      '.cmp-container',
      '.aem-Grid',
    ];
    // Iteratively unwrap from innermost to outermost
    for (let pass = 0; pass < 5; pass++) {
      unwrapSelectors.forEach((sel) => {
        const containers = element.querySelectorAll(sel);
        containers.forEach((container) => {
          // Don't unwrap if it's a block table or accordion
          if (container.closest('table')) return;
          if (container.classList.contains('accordion')) return;
          if (container.classList.contains('cmp-accordion')) return;
          // Move children before container, then remove container
          const parent = container.parentElement;
          if (parent) {
            while (container.firstChild) {
              parent.insertBefore(container.firstChild, container);
            }
            container.remove();
          }
        });
      });
    }

    // ── 11. Remove remaining empty divs and AEM artifacts ──
    WebImporter.DOMUtils.remove(element, [
      '.cmp-accordion__icon',
      '.hideinmobile:empty',
      'div[class=""]:empty',
      'div:not([class]):empty',
    ]);

    // ── 12. Merge adjacent Accordion block tables ──
    // On pages like pa_yakkan, individual AEM accordion components produce
    // separate Accordion block tables. Merge consecutive ones with no
    // default content between them into a single Accordion block.
    {
      const accTables = Array.from(element.querySelectorAll('table')).filter((t) => {
        const th = t.querySelector('th');
        return th && th.textContent.trim() === 'Accordion';
      });
      // Iterate backwards so merging doesn't shift indices
      for (let idx = accTables.length - 1; idx > 0; idx--) {
        const curr = accTables[idx];
        const prev = accTables[idx - 1];
        // Only merge if they share the same parent
        if (curr.parentElement !== prev.parentElement) continue;
        // Check for meaningful content between them
        let hasContent = false;
        let node = prev.nextSibling;
        while (node && node !== curr) {
          if (node.nodeType === 1 /* ELEMENT */ && node.textContent.trim() !== '') {
            hasContent = true;
            break;
          }
          if (node.nodeType === 3 /* TEXT */ && node.textContent.trim() !== '') {
            hasContent = true;
            break;
          }
          node = node.nextSibling;
        }
        if (!hasContent) {
          // Move all data rows (skip header row) from curr into prev
          const rows = Array.from(curr.querySelectorAll('tr'));
          rows.forEach((row) => {
            if (row.querySelector('th')) return; // skip header
            prev.appendChild(row);
          });
          curr.remove();
        }
      }
    }

    // ── 13. Section breaks ──
    // Break before H1 (separates sub-nav from H1 banner)
    const firstH1 = element.querySelector('h1');
    if (firstH1) {
      // Add narrow meta + hr before H1
      firstH1.before(createNarrowMeta(doc));
      firstH1.before(doc.createElement('hr'));
      // Add hr after H1 (separates banner from intro)
      firstH1.after(doc.createElement('hr'));
    }

    // Break before each H2 (separates content sections)
    const allH2 = Array.from(element.querySelectorAll('h2'));
    allH2.forEach((h2) => {
      h2.before(createNarrowMeta(doc));
      h2.before(doc.createElement('hr'));
    });

    // Break before accordion tables
    const accordionTables = Array.from(element.querySelectorAll('table'));
    accordionTables.forEach((table) => {
      const th = table.querySelector('th');
      if (th && th.textContent.trim() === 'Accordion') {
        // Only add break if not immediately after an hr
        const prev = table.previousElementSibling;
        if (prev && prev.tagName !== 'HR') {
          table.before(createNarrowMeta(doc));
          table.before(doc.createElement('hr'));
        }
      }
    });

    // ── 14. Reference codes ──
    const allPs = element.querySelectorAll('p');
    let refCodeP = null;
    let pageNumP = null;
    allPs.forEach((p) => {
      const text = p.textContent.trim();
      if (/^PC\d{2}/.test(text) && !refCodeP) refCodeP = p;
      if (/^ページ番号/.test(text)) pageNumP = p;
    });
    if (refCodeP) {
      refCodeP.before(createNarrowMeta(doc));
      refCodeP.before(doc.createElement('hr'));
    }

    // ── 15. Add trailing narrow meta at the end (before metadata) ──
    // Find the last content element (not metadata table)
    const metadataTable = Array.from(element.querySelectorAll('table')).find((t) => {
      const th = t.querySelector('th');
      return th && th.textContent.trim() === 'Metadata';
    });
    if (metadataTable) {
      metadataTable.before(createNarrowMeta(doc));
      metadataTable.before(doc.createElement('hr'));
    } else {
      element.appendChild(createNarrowMeta(doc));
    }
  }
}
