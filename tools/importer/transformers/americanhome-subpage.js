/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for American Home Insurance subpage template
 * Purpose: Extract page structure specific to interior subpages
 * Applies to: americanhome-subpage template (customers, deduction, disability, family_registration, etc.)
 * Generated: 2026-03-06, Updated: 2026-03-10
 *
 * This transformer handles:
 * - Mobile-only content removal (hideinpc containers)
 * - Outer bordered container unwrapping (family_registration section 3)
 * - Halfwidth bordered card pairs → Columns (bordered)
 * - Full-width bordered boxes → Columns (bordered) or Columns (gray-box)
 * - Gray-header bordered boxes → Columns (gray-box)
 * - Halfwidth column pairs (text+CTA | image) → Columns
 * - Quarter+threequarter video sections → Columns
 * - Reference numbers → Columns
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

/**
 * Helper: extract meaningful content from a deeply nested card container.
 * Handles service cards (H3 text + paragraph + image) and
 * CTA cards (H3 image + body images).
 */
function extractCardContent(card, doc) {
  const frag = doc.createDocumentFragment();
  const els = card.querySelectorAll('h3, h4, p, img, a, hr');
  const seen = new Set();
  els.forEach((el) => {
    if (el.tagName === 'IMG' && (el.closest('h3') || el.closest('h4') || el.closest('p') || el.closest('a'))) return;
    if (el.tagName === 'A' && el.closest('p')) return;
    if (seen.has(el)) return;
    seen.add(el);
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

/**
 * Helper: extract content from a halfwidth column container (text+CTA | image).
 */
function extractHalfContent(container, doc) {
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

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const { document: doc } = payload;

    // Remove mobile-only containers (duplicate content for mobile rendering)
    WebImporter.DOMUtils.remove(element, [
      '.hideinpc',
    ]);

    // ── Phase 1: Unwrap outer bordered containers that wrap halfwidth cards ──
    // Family_registration section 3: a large paleblueborder.completeborder box
    // wraps scenario images + 4 halfwidth cards + footnotes.
    // We unwrap it so the images become default content and cards can be processed.
    const outerBorderedWrappers = Array.from(element.querySelectorAll(
      '.paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)'
    )).filter((box) => {
      if (box.parentElement.closest('.paleblueborder.completeborder')) return false;
      return box.querySelector('.halfwidth.paleblueborder.completeborder') !== null;
    });

    outerBorderedWrappers.forEach((wrapper) => {
      const allGrids = wrapper.querySelectorAll('.aem-Grid');
      let contentGrid = null;
      for (const grid of allGrids) {
        const children = Array.from(grid.children);
        const hasMeaningful = children.some((child) => (
          child.classList.contains('teaserflex')
          || child.classList.contains('flexbox-container')
          || child.querySelector('.halfwidth.paleblueborder')
        ));
        if (hasMeaningful) {
          contentGrid = grid;
          break;
        }
      }

      if (contentGrid) {
        const frag = doc.createDocumentFragment();
        while (contentGrid.firstChild) {
          frag.appendChild(contentGrid.firstChild);
        }
        wrapper.replaceWith(frag);
      }
    });

    // ── Phase 2: Halfwidth bordered card pairs → Columns (bordered) markers ──
    // Find all halfwidth bordered cards and group by their direct parent.
    // Each pair of siblings becomes one Columns (bordered) block.
    const allHalfwidthCards = Array.from(element.querySelectorAll(
      '.halfwidth.paleblueborder.completeborder'
    ));
    const processedCards = new Set();
    let cardPairIdx = 0;

    for (const card of allHalfwidthCards) {
      if (processedCards.has(card)) continue;

      const parent = card.parentElement;
      if (!parent) continue;

      const siblings = Array.from(parent.children).filter(
        (c) => c.classList.contains('halfwidth')
          && c.classList.contains('paleblueborder')
          && c.classList.contains('completeborder')
          && !processedCards.has(c)
      );

      if (siblings.length >= 2) {
        for (let i = 0; i < siblings.length - 1; i += 2) {
          const left = siblings[i];
          const right = siblings[i + 1];

          const leftMarker = doc.createElement('div');
          leftMarker.className = `card-pair-left-${cardPairIdx}`;
          leftMarker.appendChild(extractCardContent(left, doc));
          left.replaceWith(leftMarker);

          const rightMarker = doc.createElement('div');
          rightMarker.className = `card-pair-right-${cardPairIdx}`;
          rightMarker.appendChild(extractCardContent(right, doc));
          right.replaceWith(rightMarker);

          processedCards.add(left);
          processedCards.add(right);
          cardPairIdx += 1;
        }
      }
    }

    // Fallback: pair remaining unpaired cards in document order
    const remainingCards = Array.from(element.querySelectorAll(
      '.halfwidth.paleblueborder.completeborder'
    ));
    for (let i = 0; i < remainingCards.length - 1; i += 2) {
      const left = remainingCards[i];
      const right = remainingCards[i + 1];

      const leftMarker = doc.createElement('div');
      leftMarker.className = `card-pair-left-${cardPairIdx}`;
      leftMarker.appendChild(extractCardContent(left, doc));
      left.replaceWith(leftMarker);

      const rightMarker = doc.createElement('div');
      rightMarker.className = `card-pair-right-${cardPairIdx}`;
      rightMarker.appendChild(extractCardContent(right, doc));
      right.replaceWith(rightMarker);

      cardPairIdx += 1;
    }

    // ── Phase 2.5: Coreblue-header bordered boxes (confirmation page pattern) ──
    // These have: paleblueborder.completeborder outer → coreblue H2 header bar → topborder body
    // Unwrap them: extract H2 heading, promote body content as flat elements.
    // Thirdwidth image cards inside will be picked up later by the columns parser.
    const coreblueHeaderBoxes = Array.from(element.querySelectorAll(
      '.paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)'
    )).filter((box) => {
      if (box.parentElement.closest('.paleblueborder.completeborder')) return false;
      return box.querySelector('.coreblue h2') !== null;
    });

    coreblueHeaderBoxes.forEach((box) => {
      const frag = doc.createDocumentFragment();

      // Extract H2 from coreblue header bar (with inline icon image)
      const h2 = box.querySelector('.coreblue h2');
      if (h2) frag.appendChild(h2.cloneNode(true));

      // Process body section (paleblueborder.topborder)
      const bodySection = box.querySelector('.paleblueborder.topborder');
      if (bodySection) {
        const flexContainers = Array.from(bodySection.querySelectorAll('.flexbox-container'));
        flexContainers.forEach((fc) => {
          const innerGrid = fc.querySelector('.aem-Grid');
          if (!innerGrid) return;

          // Extract teaserflex descriptions as flat content first
          const teasers = Array.from(innerGrid.querySelectorAll(':scope > .teaserflex'));
          teasers.forEach((teaser) => {
            const h3s = teaser.querySelectorAll('h3');
            h3s.forEach((h3El) => frag.appendChild(h3El.cloneNode(true)));
            const ps = teaser.querySelectorAll('.cmp-teaser__description p');
            ps.forEach((p) => frag.appendChild(p.cloneNode(true)));
            teaser.remove();
          });

          // Check if container still has thirdwidth/halfwidth images for columns parser
          const hasColumnsImages = innerGrid.querySelector('.image.thirdwidth, .image.halfwidth');
          if (hasColumnsImages) {
            frag.appendChild(fc); // Move container for columns parser matching
          } else {
            // Extract remaining images as flat linked-image paragraphs
            const imgContainers = innerGrid.querySelectorAll('.cmp-image');
            imgContainers.forEach((ic) => {
              const link = ic.querySelector('.cmp-image__link');
              const img = ic.querySelector('.cmp-image__image');
              if (link && img) {
                const p = doc.createElement('p');
                const a = doc.createElement('a');
                a.href = link.href;
                a.appendChild(img.cloneNode(true));
                p.appendChild(a);
                frag.appendChild(p);
              } else if (img) {
                const p = doc.createElement('p');
                p.appendChild(img.cloneNode(true));
                frag.appendChild(p);
              }
            });
          }
        });
      }

      box.replaceWith(frag);
    });

    // ── Phase 3: Full-width bordered boxes ──
    const fullBorderedBoxes = Array.from(element.querySelectorAll(
      '.paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)'
    )).filter((box) => !box.parentElement.closest('.paleblueborder.completeborder'));
    let borderedBoxCount = 0;

    fullBorderedBoxes.forEach((box) => {
      const innerGrayHeader = box.querySelector('.aiglightgray');
      const innerHalfwidths = Array.from(box.querySelectorAll('.halfwidth:not(.paleblueborder)'));
      const h3 = box.querySelector('h3');

      if (innerGrayHeader && h3) {
        // Gray-header bordered box → Columns (gray-box)
        const frag = doc.createDocumentFragment();

        const h3Clone = doc.createElement('h3');
        h3Clone.textContent = h3.textContent.trim();
        frag.appendChild(h3Clone);

        const bodySection = box.querySelector('.paleblueborder.topborder');
        if (bodySection) {
          const textP = bodySection.querySelector('.cmp-teaser__description p');
          if (textP) frag.appendChild(textP.cloneNode(true));

          const link = bodySection.querySelector('.cmp-image__link');
          const img = bodySection.querySelector('.cmp-image__image');
          if (link && img) {
            const p = doc.createElement('p');
            const a = doc.createElement('a');
            a.href = link.href;
            a.appendChild(img.cloneNode(true));
            p.appendChild(a);
            frag.appendChild(p);
          } else if (img) {
            const p = doc.createElement('p');
            p.appendChild(img.cloneNode(true));
            frag.appendChild(p);
          }
        }

        const markerDiv = doc.createElement('div');
        markerDiv.className = `gray-box-marker-${borderedBoxCount}`;
        markerDiv.appendChild(frag);
        box.replaceWith(markerDiv);
      } else if (innerHalfwidths.length === 2 && h3) {
        // 2-column bordered box (relay service pattern)
        const leftFrag = doc.createDocumentFragment();
        const h3Clone = doc.createElement('h3');
        h3Clone.textContent = h3.textContent.trim();
        leftFrag.appendChild(h3Clone);
        const textP = innerHalfwidths[0].querySelector('.cmp-teaser__description p');
        if (textP) leftFrag.appendChild(textP.cloneNode(true));

        const rightFrag = doc.createDocumentFragment();
        const link = innerHalfwidths[1].querySelector('.cmp-image__link');
        const img = innerHalfwidths[1].querySelector('.cmp-image__image');
        if (link && img) {
          const a = doc.createElement('a');
          a.href = link.href;
          a.appendChild(img.cloneNode(true));
          rightFrag.appendChild(a);
        } else if (img) {
          rightFrag.appendChild(img.cloneNode(true));
        }

        const leftDiv = doc.createElement('div');
        leftDiv.className = `bordered-box-left-${borderedBoxCount}`;
        leftDiv.appendChild(leftFrag);
        const rightDiv = doc.createElement('div');
        rightDiv.className = `bordered-box-right-${borderedBoxCount}`;
        rightDiv.appendChild(rightFrag);
        box.replaceWith(leftDiv);
        leftDiv.after(rightDiv);
      } else {
        // Single-column bordered box (phone dial pattern)
        const frag = doc.createDocumentFragment();
        const elems = box.querySelectorAll('h3, p, img');
        const seen = new Set();
        elems.forEach((el) => {
          if (el.tagName === 'IMG' && (el.closest('p') || el.closest('a'))) return;
          if (seen.has(el)) return;
          seen.add(el);
          frag.appendChild(el.cloneNode(true));
        });
        const markerDiv = doc.createElement('div');
        markerDiv.className = `bordered-box-single-${borderedBoxCount}`;
        markerDiv.appendChild(frag);
        box.replaceWith(markerDiv);
      }
      borderedBoxCount += 1;
    });

    // ── Phase 4: Halfwidth column pairs (text+CTA | image) ──
    const allDttHeadings = element.querySelectorAll('.dttitlecoreblue.left-border-h2');
    let halfwidthPairCount = 0;

    for (const heading of allDttHeadings) {
      const parent = heading.parentElement;
      if (!parent) continue;
      const candidates = Array.from(parent.querySelectorAll(':scope > .halfwidth:not(.paleblueborder)'));
      if (candidates.length === 2) {
        candidates.forEach((hw, idx) => {
          const markerDiv = doc.createElement('div');
          markerDiv.className = idx === 0
            ? `halfwidth-col-left-${halfwidthPairCount}`
            : `halfwidth-col-right-${halfwidthPairCount}`;
          markerDiv.appendChild(extractHalfContent(hw, doc));
          hw.replaceWith(markerDiv);
        });
        halfwidthPairCount += 1;
      }
    }

    // ── Phase 5: Quarter+threequarter video sections ──
    const quarterEls = element.querySelectorAll('.quarterwidth');
    for (const quarterEl of quarterEls) {
      const parent = quarterEl.parentElement;
      if (!parent) continue;
      const threeQuarterEl = parent.querySelector(':scope > .threequarterwidth');
      if (!threeQuarterEl) continue;
      const hasHeading = parent.querySelector(':scope > .dttitlecoreblue');
      if (!hasHeading) continue;

      const leftMarker = doc.createElement('div');
      leftMarker.className = 'video-col-left';
      leftMarker.appendChild(extractHalfContent(quarterEl, doc));
      quarterEl.replaceWith(leftMarker);

      const rightMarker = doc.createElement('div');
      rightMarker.className = 'video-col-right';
      rightMarker.appendChild(extractHalfContent(threeQuarterEl, doc));
      threeQuarterEl.replaceWith(rightMarker);
      break;
    }
  }

  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;

    // 0. Merge adjacent Columns block tables into a single multi-row block
    const columnsTables = Array.from(element.querySelectorAll('table'));
    for (let i = 0; i < columnsTables.length - 1; i++) {
      const first = columnsTables[i];
      const second = columnsTables[i + 1];
      const firstTh = first.querySelector('th');
      const secondTh = second.querySelector('th');

      if (!firstTh || !secondTh) continue;
      if (firstTh.textContent.trim() !== 'Columns') continue;
      if (secondTh.textContent.trim() !== 'Columns') continue;
      if (first.nextElementSibling !== second) continue;

      const firstRows = Array.from(first.querySelectorAll('tr')).slice(1);
      const secondRows = Array.from(second.querySelectorAll('tr')).slice(1);
      let maxCols = 0;
      firstRows.forEach((r) => { maxCols = Math.max(maxCols, r.children.length); });

      const allCells = [...firstRows, ...secondRows].flatMap((r) => Array.from(r.children));
      const allImageOnly = allCells.every((td) => {
        const imgs = td.querySelectorAll('img');
        return imgs.length === 1 && td.textContent.trim() === '';
      });

      if (allImageOnly && firstRows.length === 1 && secondRows.length === 1) {
        const firstRow = firstRows[0];
        Array.from(secondRows[0].children).forEach((td) => firstRow.appendChild(td));
        const thCell = first.querySelector('th');
        if (thCell) thCell.colSpan = firstRow.children.length;
      } else {
        secondRows.forEach((row) => {
          while (row.children.length < maxCols) {
            row.appendChild(document.createElement('td'));
          }
          first.appendChild(row);
        });
      }

      second.remove();
      columnsTables.splice(i + 1, 1);
      i--;
    }

    // 1. Convert card pair markers → Columns (bordered) blocks
    for (let i = 0; ; i++) {
      const leftMarker = element.querySelector(`.card-pair-left-${i}`);
      const rightMarker = element.querySelector(`.card-pair-right-${i}`);
      if (!leftMarker || !rightMarker) break;

      const leftClone = leftMarker.cloneNode(true);
      const rightClone = rightMarker.cloneNode(true);
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'Columns (bordered)',
        cells: [[[leftClone], [rightClone]]],
      });
      leftMarker.before(block);
      leftMarker.remove();
      rightMarker.remove();
    }

    // 2. Convert gray-box markers → Columns (gray-box) blocks
    for (let i = 0; ; i++) {
      const marker = element.querySelector(`.gray-box-marker-${i}`);
      if (!marker) break;

      const clone = marker.cloneNode(true);
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'Columns (gray-box)',
        cells: [[[clone]]],
      });
      marker.before(block);
      marker.remove();
    }

    // 3. Convert video column markers → Columns blocks
    const vidLeft = element.querySelector('.video-col-left');
    const vidRight = element.querySelector('.video-col-right');
    if (vidLeft && vidRight) {
      const vidBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Columns',
        cells: [[[vidLeft.cloneNode(true)], [vidRight.cloneNode(true)]]],
      });
      vidLeft.before(vidBlock);
      vidLeft.remove();
      vidRight.remove();
    }

    // 4. Convert halfwidth column pair markers → Columns blocks
    for (let i = 0; ; i++) {
      const hwLeft = element.querySelector(`.halfwidth-col-left-${i}`);
      const hwRight = element.querySelector(`.halfwidth-col-right-${i}`);
      if (!hwLeft || !hwRight) break;
      const hwBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Columns',
        cells: [[[hwLeft.cloneNode(true)], [hwRight.cloneNode(true)]]],
      });
      hwLeft.before(hwBlock);
      hwLeft.remove();
      hwRight.remove();
    }

    // 5. Convert full-width bordered box markers → Columns (bordered) blocks
    for (let i = 0; ; i++) {
      const singleMarker = element.querySelector(`.bordered-box-single-${i}`);
      const leftMarker2 = element.querySelector(`.bordered-box-left-${i}`);
      const rightMarker2 = element.querySelector(`.bordered-box-right-${i}`);
      if (!singleMarker && !leftMarker2) break;

      if (singleMarker) {
        const clone = singleMarker.cloneNode(true);
        const block = WebImporter.Blocks.createBlock(document, {
          name: 'Columns (bordered)',
          cells: [[[clone]]],
        });
        singleMarker.before(block);
        singleMarker.remove();
      } else if (leftMarker2 && rightMarker2) {
        const lClone = leftMarker2.cloneNode(true);
        const rClone = rightMarker2.cloneNode(true);
        const block = WebImporter.Blocks.createBlock(document, {
          name: 'Columns (bordered)',
          cells: [[[lClone], [rClone]]],
        });
        leftMarker2.before(block);
        leftMarker2.remove();
        rightMarker2.remove();
      }
    }

    // 6. Reference numbers at the very end → Columns block
    const allParagraphs = element.querySelectorAll('p');
    let refCodeP = null;
    let pageNumP = null;

    allParagraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (/^(AHA|OM)\d{4}/.test(text)) refCodeP = p;
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
      const cells = [[
        [''],
        [pageNumP.cloneNode(true)],
      ]];
      refBlock = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      pageNumP.replaceWith(refBlock);
    }

    // 7. Section breaks between content sections
    const allH2 = Array.from(element.querySelectorAll('h2'));

    const allTables = Array.from(element.querySelectorAll('table'));
    const grayBoxTables = [];
    allTables.forEach((t) => {
      const th = t.querySelector('th');
      if (th && th.textContent.includes('gray-box')) grayBoxTables.push(t);
    });

    const breakPoints = [];

    for (let i = 1; i < allH2.length; i++) {
      breakPoints.push(allH2[i]);
    }

    grayBoxTables.forEach((gbt) => {
      const prevSibling = gbt.previousElementSibling;
      const isAfterH2 = prevSibling && prevSibling.tagName === 'HR';
      if (!isAfterH2) {
        breakPoints.push(gbt);
      }
    });

    if (refBlock) {
      breakPoints.push(refBlock);
    }

    breakPoints.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    breakPoints.forEach((bp) => {
      bp.before(createNarrowMeta(document));
      bp.before(document.createElement('hr'));
    });

    if (refBlock) {
      refBlock.after(createNarrowMeta(document));
    } else {
      element.appendChild(createNarrowMeta(document));
    }

    // 8. H1 section break — separates banner from content
    const firstH1 = element.querySelector('h1');
    if (firstH1) {
      const hr = document.createElement('hr');
      firstH1.after(hr);
    }
  }
}
