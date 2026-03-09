/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for American Home Insurance subpage template
 * Purpose: Extract page structure specific to interior subpages
 * Applies to: americanhome-subpage template (customers, deduction, etc.)
 * Generated: 2026-03-06
 *
 * This transformer handles:
 * - Mobile-only content removal (hideinpc containers)
 * - Reference numbers at page bottom (as 2-col Columns)
 * - Section breaks between major content sections
 * - Section Metadata (narrow) for each content section
 * - H1 banner section break
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Helper: create a Section Metadata block with style: narrow
 */
function createNarrowMeta(document) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [[['style'], ['narrow']]],
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove mobile-only containers (duplicate content for mobile rendering)
    WebImporter.DOMUtils.remove(element, [
      '.hideinpc',
    ]);

    // Reissue section: flatten each bordered card container in-place.
    // The original DOM has .halfwidth.paleblueborder.completeborder containers
    // with deeply nested AEM component markup. Replace each with a simple marker div
    // that afterTransform converts to Columns (bordered).
    const cardContainers = element.querySelectorAll('.halfwidth.paleblueborder.completeborder');
    if (cardContainers.length === 2) {
      const { document: doc } = payload;

      // Helper: extract meaningful content from a deeply nested card container
      function extractCardContent(card) {
        const frag = doc.createDocumentFragment();
        const els = card.querySelectorAll('h3, h4, p, img, a, hr');
        const seen = new Set();
        els.forEach((el) => {
          // Skip elements already inside a collected parent
          if (el.tagName === 'IMG' && (el.closest('h3') || el.closest('h4') || el.closest('p') || el.closest('a'))) return;
          if (el.tagName === 'A' && el.closest('p')) return;
          if (seen.has(el)) return;
          seen.add(el);
          // Convert h3/h4 header images to a simple <p><img></p>
          if (el.tagName === 'H3' || el.tagName === 'H4') {
            const img = el.querySelector('img');
            if (img) {
              const p = doc.createElement('p');
              p.appendChild(img.cloneNode(true));
              frag.appendChild(p);
            }
          } else {
            frag.appendChild(el.cloneNode(true));
          }
        });
        return frag;
      }

      // Replace each card container in-place with a flat marker div
      cardContainers.forEach((card, idx) => {
        const markerDiv = doc.createElement('div');
        markerDiv.className = idx === 0 ? 'reissue-card-left' : 'reissue-card-right';
        markerDiv.appendChild(extractCardContent(card));
        card.replaceWith(markerDiv);
      });
    }

    // Accessibility section: two .halfwidth containers (without .paleblueborder)
    // that sit side-by-side after a heading with .dttitlecoreblue.
    // Multiple elements match the heading selector; iterate to find the one
    // whose parent has halfwidth siblings.
    const allDttHeadings = element.querySelectorAll('.dttitlecoreblue.left-border-h2');
    let halfwidths = [];
    let halfwidthParent = null;
    for (const heading of allDttHeadings) {
      const parent = heading.parentElement;
      if (!parent) continue;
      const candidates = Array.from(parent.querySelectorAll(':scope > .halfwidth:not(.paleblueborder)'));
      if (candidates.length === 2) {
        halfwidths = candidates;
        halfwidthParent = parent;
        break;
      }
    }

    if (halfwidths.length === 2) {
      const { document: doc } = payload;

      function extractHalfContent(container) {
        const frag = doc.createDocumentFragment();
        const els = container.querySelectorAll('p, img, a');
        const seen = new Set();
        els.forEach((el) => {
          if (el.tagName === 'IMG' && (el.closest('p') || el.closest('a'))) return;
          if (el.tagName === 'A' && el.closest('p')) return;
          if (seen.has(el)) return;
          seen.add(el);
          frag.appendChild(el.cloneNode(true));
        });
        return frag;
      }

      halfwidths.forEach((hw, idx) => {
        const markerDiv = doc.createElement('div');
        markerDiv.className = idx === 0 ? 'accessibility-col-left' : 'accessibility-col-right';
        markerDiv.appendChild(extractHalfContent(hw));
        hw.replaceWith(markerDiv);
      });
    }

    // Video section: quarterwidth icon + threequarterwidth text+button layout
    // (claim page: 保険金請求書類の記入方法（動画）)
    // Only match when both are siblings in the same aem-Grid parent
    // and the parent also contains a dttitlecoreblue heading.
    const quarterEls = element.querySelectorAll('.quarterwidth');
    for (const quarterEl of quarterEls) {
      const parent = quarterEl.parentElement;
      if (!parent) continue;
      const threeQuarterEl = parent.querySelector(':scope > .threequarterwidth');
      if (!threeQuarterEl) continue;
      // Verify this is a subpage content section (has a dttitlecoreblue heading sibling)
      const hasHeading = parent.querySelector(':scope > .dttitlecoreblue');
      if (!hasHeading) continue;

      const { document: doc } = payload;

      function extractVideoContent(container) {
        const frag = doc.createDocumentFragment();
        const els = container.querySelectorAll('p, img, a');
        const seen = new Set();
        els.forEach((el) => {
          if (el.tagName === 'IMG' && (el.closest('p') || el.closest('a'))) return;
          if (el.tagName === 'A' && el.closest('p')) return;
          if (seen.has(el)) return;
          seen.add(el);
          frag.appendChild(el.cloneNode(true));
        });
        return frag;
      }

      const leftMarker = doc.createElement('div');
      leftMarker.className = 'video-col-left';
      leftMarker.appendChild(extractVideoContent(quarterEl));
      quarterEl.replaceWith(leftMarker);

      const rightMarker = doc.createElement('div');
      rightMarker.className = 'video-col-right';
      rightMarker.appendChild(extractVideoContent(threeQuarterEl));
      threeQuarterEl.replaceWith(rightMarker);
      break; // Only process first match
    }
  }

  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;

    // 0. Merge adjacent Columns block tables into a single multi-row block
    //    e.g. a 3-col grid followed by a 2-col grid → one block with 2 rows, 3 cols
    const columnsTables = Array.from(element.querySelectorAll('table'));
    for (let i = 0; i < columnsTables.length - 1; i++) {
      const first = columnsTables[i];
      const second = columnsTables[i + 1];
      const firstTh = first.querySelector('th');
      const secondTh = second.querySelector('th');

      // Only merge plain Columns blocks (not gray-box or other variants)
      if (!firstTh || !secondTh) continue;
      if (firstTh.textContent.trim() !== 'Columns') continue;
      if (secondTh.textContent.trim() !== 'Columns') continue;

      // Only merge if they are adjacent siblings (no content between them)
      if (first.nextElementSibling !== second) continue;

      // Determine max column count from the first table's data rows
      const firstRows = Array.from(first.querySelectorAll('tr')).slice(1);
      const secondRows = Array.from(second.querySelectorAll('tr')).slice(1);
      let maxCols = 0;
      firstRows.forEach((r) => { maxCols = Math.max(maxCols, r.children.length); });

      // Check if all cells in both tables are image-only (e.g. STEP grid)
      const allCells = [...firstRows, ...secondRows].flatMap((r) => Array.from(r.children));
      const allImageOnly = allCells.every((td) => {
        const imgs = td.querySelectorAll('img');
        return imgs.length === 1 && td.textContent.trim() === '';
      });

      if (allImageOnly && firstRows.length === 1 && secondRows.length === 1) {
        // Merge into single row with all columns (e.g. 3+3 → 6 cols)
        const firstRow = firstRows[0];
        Array.from(secondRows[0].children).forEach((td) => firstRow.appendChild(td));
        // Update header colspan to reflect new column count
        const thCell = first.querySelector('th');
        if (thCell) thCell.colSpan = firstRow.children.length;
      } else {
        // Multi-row merge: append second table's rows, padding to maxCols
        secondRows.forEach((row) => {
          while (row.children.length < maxCols) {
            row.appendChild(document.createElement('td'));
          }
          first.appendChild(row);
        });
      }

      // Remove the now-empty second table
      second.remove();
      // Adjust array so we don't skip next pair
      columnsTables.splice(i + 1, 1);
      i--;
    }

    // 0b. Reissue section: convert marker divs from beforeTransform into Columns (bordered)
    const leftMarker = element.querySelector('.reissue-card-left');
    const rightMarker = element.querySelector('.reissue-card-right');

    if (leftMarker && rightMarker) {
      // Clone content before createBlock moves the originals into the table
      const leftClone = leftMarker.cloneNode(true);
      const rightClone = rightMarker.cloneNode(true);
      const borderedBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Columns (bordered)',
        cells: [[[leftClone], [rightClone]]],
      });
      leftMarker.before(borderedBlock);
      leftMarker.remove();
      rightMarker.remove();
    }

    // 0c. Video section: convert marker divs into Columns (2-cols)
    const vidLeft = element.querySelector('.video-col-left');
    const vidRight = element.querySelector('.video-col-right');

    if (vidLeft && vidRight) {
      const vidLeftClone = vidLeft.cloneNode(true);
      const vidRightClone = vidRight.cloneNode(true);
      const vidBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Columns',
        cells: [[[vidLeftClone], [vidRightClone]]],
      });
      vidLeft.before(vidBlock);
      vidLeft.remove();
      vidRight.remove();
    }

    // 0d. Accessibility section: convert marker divs into Columns (2-cols)
    const accLeft = element.querySelector('.accessibility-col-left');
    const accRight = element.querySelector('.accessibility-col-right');

    if (accLeft && accRight) {
      const accLeftClone = accLeft.cloneNode(true);
      const accRightClone = accRight.cloneNode(true);
      const accBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Columns',
        cells: [[[accLeftClone], [accRightClone]]],
      });
      accLeft.before(accBlock);
      accLeft.remove();
      accRight.remove();
    }

    // 1. Reference numbers at the very end → Columns block
    const allParagraphs = element.querySelectorAll('p');
    let refCodeP = null;
    let pageNumP = null;

    allParagraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (/^AHA\d{4}/.test(text)) refCodeP = p;
      if (/^ページ番号/.test(text)) pageNumP = p;
    });

    let refBlock = null;
    if (refCodeP && pageNumP) {
      const cells = [[
        [refCodeP.cloneNode(true)],
        [pageNumP.cloneNode(true)],
      ]];
      refBlock = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      refCodeP.replaceWith(refBlock);
      pageNumP.remove();
    } else if (pageNumP && !refCodeP) {
      // Standalone page number (e.g., claim page) — wrap in 2-col Columns
      // with empty left cell for consistent layout
      const cells = [[
        [''],
        [pageNumP.cloneNode(true)],
      ]];
      refBlock = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      pageNumP.replaceWith(refBlock);
    }

    // 2. Section breaks between content sections
    // Find all H2 headings — each (except the first) starts a new section
    const allH2 = Array.from(element.querySelectorAll('h2'));

    // Find block tables for gray-box and reference columns
    const allTables = Array.from(element.querySelectorAll('table'));
    let grayBoxTable = null;
    allTables.forEach((t) => {
      const th = t.querySelector('th');
      if (th && th.textContent.includes('gray-box')) grayBoxTable = t;
    });

    // Collect break points in DOM order:
    // - Before each H2 except the first
    // - Before the gray-box columns table (if it exists and isn't right after an H2)
    // - Before the reference columns block
    const breakPoints = [];

    // Add breaks before H2s (skip the first which is in the first content section)
    for (let i = 1; i < allH2.length; i++) {
      breakPoints.push(allH2[i]);
    }

    // Add break before gray-box table if present
    if (grayBoxTable) {
      // Only add if gray-box isn't already right after a break point (an H2)
      const prevSibling = grayBoxTable.previousElementSibling;
      const isAfterH2 = prevSibling && prevSibling.tagName === 'HR';
      if (!isAfterH2) {
        breakPoints.push(grayBoxTable);
      }
    }

    // Add break before reference block if present
    if (refBlock) {
      breakPoints.push(refBlock);
    }

    // Sort break points by document order
    breakPoints.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    // Insert section-metadata (narrow) + hr before each break point
    breakPoints.forEach((bp) => {
      bp.before(createNarrowMeta(document));
      bp.before(document.createElement('hr'));
    });

    // Add narrow metadata to the LAST section (after reference block or last content)
    if (refBlock) {
      refBlock.after(createNarrowMeta(document));
    } else {
      // Fallback: append to end of element
      element.appendChild(createNarrowMeta(document));
    }

    // 3. H1 section break — separates banner from content
    const firstH1 = element.querySelector('h1');
    if (firstH1) {
      const hr = document.createElement('hr');
      firstH1.after(hr);
    }
  }
}
