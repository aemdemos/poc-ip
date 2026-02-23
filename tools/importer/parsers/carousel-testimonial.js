/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-testimonial block
 *
 * Source: https://www.lowi.es/
 * Base Block: carousel
 *
 * Block Structure (from markdown example):
 * - Row per testimonial: [social icon image | quote text + author name]
 *
 * Source HTML Pattern:
 * <div class="lw-m-carousels">
 *   <div class="lw-c-carousel">
 *     <ul class="lw-c-carousel__list">
 *       <li class="lw-c-carousel__item">
 *         <div class="lw-c-card-opinions">
 *           <img src="data:image/svg+xml;base64,..."> (social media icon)
 *           <p class="lw-paragraph-1 lw-mt-3">"Quote text"</p>
 *           <p class="lw-paragraph-1 lw-mt-1 lw-color-typography-accent">
 *             <strong>@Author Name</strong>
 *           </p>
 *         </div>
 *       </li>
 *     </ul>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-18
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all testimonial card items
  // VALIDATED: .lw-c-card-opinions found in captured DOM (line 1853)
  const testimonials = element.querySelectorAll('.lw-c-card-opinions');

  testimonials.forEach((card) => {
    // Extract social media icon
    // VALIDATED: img (base64 SVG icon) found as first child in captured DOM (line 1854)
    const icon = card.querySelector('img');

    // Extract quote text
    // VALIDATED: p.lw-mt-3 found in captured DOM (line 1855)
    const quote = card.querySelector('p.lw-mt-3, p.lw-paragraph-1:first-of-type');

    // Extract author name
    // VALIDATED: p.lw-color-typography-accent found in captured DOM (line 1856)
    const author = card.querySelector('p.lw-color-typography-accent, p:last-of-type');

    // Build icon cell
    const iconCell = document.createElement('div');
    if (icon) {
      const clonedIcon = icon.cloneNode(true);
      iconCell.appendChild(clonedIcon);
    }

    // Build content cell
    const contentCell = document.createElement('div');

    if (quote) {
      const p = document.createElement('p');
      p.textContent = quote.textContent.trim();
      contentCell.appendChild(p);
    }

    if (author) {
      const p = document.createElement('p');
      p.innerHTML = '<strong>' + author.textContent.trim() + '</strong>';
      contentCell.appendChild(p);
    }

    cells.push([iconCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-Testimonial', cells });
  element.replaceWith(block);
}
