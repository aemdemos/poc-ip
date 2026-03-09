/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block (subpage template)
 *
 * Source: https://www.americanhome.co.jp/home/customers/deduction
 * Base Block: columns
 *
 * Source HTML Patterns:
 *
 * Pattern 1 (thirdwidth images directly in grid):
 * <div class="container">
 *   <div class="cmp-container">
 *     <div class="aem-Grid">
 *       <div class="image thirdwidth">
 *         <div class="cmp-image"><a class="cmp-image__link"><img class="cmp-image__image"></a></div>
 *       </div>
 *       ...more thirdwidth images...
 *     </div>
 *   </div>
 * </div>
 *
 * Pattern 2 (halfwidth images in flexbox-container):
 * <div class="flexbox-container">
 *   ...
 *     <div class="image halfwidth">
 *       <div class="cmp-image"><a class="cmp-image__link"><img class="cmp-image__image"></a></div>
 *     </div>
 *   ...
 * </div>
 *
 * Generated: 2026-03-06
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: Direct thirdwidth images in a container
  const thirdwidthImages = element.querySelectorAll('.image.thirdwidth');

  // Pattern 2: Direct halfwidth images
  const halfwidthImages = element.querySelectorAll('.image.halfwidth');

  const items = thirdwidthImages.length > 0 ? thirdwidthImages : halfwidthImages;

  if (items.length >= 2) {
    const row = [];

    items.forEach((item) => {
      const cellContent = [];

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
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
  element.replaceWith(block);
}
