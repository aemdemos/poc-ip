/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel block
 *
 * Source: https://www.americanhome.co.jp/
 * Base Block: carousel
 *
 * Block Structure (from block library example):
 * - Row per slide: [image | text/link content]
 *
 * Source HTML Pattern:
 * <div class="cmp-carousel">
 *   <div class="cmp-carousel__content">
 *     <div class="cmp-carousel__item">
 *       <div class="image">
 *         <div class="cmp-image">
 *           <a class="cmp-image__link" href="...">
 *             <img class="cmp-image__image" src="..." alt="...">
 *           </a>
 *         </div>
 *       </div>
 *     </div>
 *     ...more items...
 *     <div class="cmp-carousel__actions">...</div>
 *     <ol class="cmp-carousel__indicators">...</ol>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-24
 */
export default function parse(element, { document }) {
  // Extract carousel slides (exclude actions/indicators)
  // VALIDATED: .cmp-carousel__item exists in source HTML (lines 541, 550, 559)
  const slides = element.querySelectorAll('.cmp-carousel__item');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image from slide
    // VALIDATED: .cmp-image__image exists in source HTML (lines 545, 554, 563)
    const img = slide.querySelector('.cmp-image__image');

    // Extract link from slide
    // VALIDATED: .cmp-image__link exists in source HTML (lines 544, 553, 562)
    const link = slide.querySelector('.cmp-image__link');

    if (img) {
      // Clone the image to avoid DOM mutation issues
      const imgClone = img.cloneNode(true);

      // Build second cell with link content
      const contentCell = [];
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        // Use alt text as link text (images have descriptive alt text baked in)
        a.textContent = img.alt || link.textContent || '';
        contentCell.push(a);
      }

      // Each row: [image, link/content]
      cells.push([imgClone, contentCell]);
    }
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
