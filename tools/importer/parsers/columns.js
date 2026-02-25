/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block
 *
 * Source: https://www.americanhome.co.jp/
 * Base Block: columns
 *
 * Block Structure (from block library example):
 * - Single row with N cells (one per column)
 * - Each cell can contain images, text, links
 *
 * Source HTML Patterns:
 *
 * Pattern 1 (2-column, halfwidth):
 * <div class="flexbox-container">
 *   <div class="cmp-container">
 *     <div class="aem-Grid">
 *       <div class="image halfwidth">
 *         <div class="cmp-image"><a><img></a></div>
 *       </div>
 *       <div class="image halfwidth">
 *         <div class="cmp-image"><a><img></a></div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Pattern 2 (3-column, thirdwidth - element is parent .aem-Grid):
 * <div class="aem-Grid">
 *   <div class="flexbox-container thirdwidth">
 *     <div class="cmp-container">
 *       <div class="aem-Grid">
 *         <div class="image"><div class="cmp-image"><img></div></div>
 *         <div class="text"><div class="cmp-text"><p>...</p></div></div>
 *       </div>
 *     </div>
 *   </div>
 *   ...more thirdwidth columns...
 * </div>
 *
 * Generated: 2026-02-24
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect pattern: check for direct halfwidth children (Pattern 1)
  // VALIDATED: .image.halfwidth exists in source HTML (lines 871, 878)
  // Use scoped selector to only match direct grid children
  const halfwidthItems = element.querySelectorAll('.image.halfwidth');

  // Check for thirdwidth children (Pattern 2)
  // VALIDATED: .flexbox-container.thirdwidth exists in source HTML (lines 969, 994, 1021)
  const thirdwidthItems = element.querySelectorAll('.flexbox-container.thirdwidth');

  if (halfwidthItems.length >= 2) {
    // Pattern 1: Multi-column layout with linked images (require 2+ columns)
    const row = [];

    halfwidthItems.forEach((item) => {
      const cellContent = [];

      // Extract linked image
      // VALIDATED: .cmp-image__link and .cmp-image__image exist (lines 873-874, 880-881)
      const link = item.querySelector('.cmp-image__link');
      const img = item.querySelector('.cmp-image__image');

      if (link && img) {
        const a = document.createElement('a');
        a.href = link.href;
        const imgClone = img.cloneNode(true);
        a.appendChild(imgClone);
        cellContent.push(a);
      } else if (img) {
        cellContent.push(img.cloneNode(true));
      }

      row.push(cellContent);
    });

    cells.push(row);
  } else if (thirdwidthItems.length > 0) {
    // Pattern 2: 3-column layout with images and text
    const row = [];

    thirdwidthItems.forEach((item) => {
      const cellContent = [];

      // Extract image
      // VALIDATED: .cmp-image__image exists inside thirdwidth containers (lines 977, 1002, 1029)
      const img = item.querySelector('.cmp-image__image');
      if (img) {
        cellContent.push(img.cloneNode(true));
      }

      // Extract text content
      // VALIDATED: .cmp-text p exists inside thirdwidth containers (lines 984-988, 1009-1015, 1036-1040)
      const textEl = item.querySelector('.cmp-text');
      if (textEl) {
        const p = textEl.querySelector('p');
        if (p) {
          cellContent.push(p.cloneNode(true));
        }
      }

      row.push(cellContent);
    });

    cells.push(row);
  }

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
