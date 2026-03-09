/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (gray-box) block variant
 *
 * Source: https://www.americanhome.co.jp/home/customers/deduction
 * Base Block: columns
 * Variant: gray-box
 *
 * Source HTML Pattern (actual DOM structure):
 * <div class="container aiglightgray ltgrayborder completeborder">
 *   <div class="cmp-container">
 *     <div class="aem-Grid">
 *       <div class="container norowspace">
 *         <div class="cmp-container">
 *           <div class="aem-Grid">
 *             <div class="teaser corebluetext">  <!-- heading -->
 *               <div class="cmp-teaser"><div class="cmp-teaser__content">
 *                 <div class="cmp-teaser__description"><h3>お問い合わせの前に</h3></div>
 *               </div></div>
 *             </div>
 *             <div class="teaser halfwidth">  <!-- paragraph text -->
 *               <div class="cmp-teaser"><div class="cmp-teaser__content">
 *                 <div class="cmp-teaser__description"><p>...</p></div>
 *               </div></div>
 *             </div>
 *             <div class="container halfwidth">  <!-- CTA image -->
 *               <div class="image"><a class="cmp-image__link"><img class="cmp-image__image"></a></div>
 *             </div>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Output: Columns (gray-box) block with 2 cells
 *
 * Generated: 2026-03-06
 */
export default function parse(element, { document }) {
  const cells = [];
  const row = [];

  // Left column: heading + text
  const leftCell = [];
  const heading = element.querySelector('h3');
  if (heading) {
    const h3 = document.createElement('h3');
    h3.textContent = heading.textContent.trim();
    leftCell.push(h3);
  }

  // Text is in a .teaser.halfwidth component (not .cmp-text)
  const teaserText = element.querySelector('.teaser.halfwidth .cmp-teaser__description p');
  if (teaserText) {
    leftCell.push(teaserText.cloneNode(true));
  }

  row.push(leftCell);

  // Right column: CTA image with link
  const rightCell = [];
  const link = element.querySelector('.cmp-image__link');
  const img = element.querySelector('.cmp-image__image');

  if (link && img) {
    const a = document.createElement('a');
    a.href = link.href;
    const imgClone = img.cloneNode(true);
    a.appendChild(imgClone);
    rightCell.push(a);
  } else if (img) {
    rightCell.push(img.cloneNode(true));
  }

  row.push(rightCell);
  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (gray-box)', cells });
  element.replaceWith(block);
}
