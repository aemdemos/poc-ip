/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-features block
 *
 * Source: https://www.lowi.es/
 * Base Block: carousel
 *
 * Block Structure (from markdown example):
 * - Row per slide: [image | heading + description]
 *
 * Source HTML Pattern:
 * <div class="lw-c-carousel">
 *   <ul class="lw-c-carousel__list">
 *     <li class="lw-c-carousel__item">
 *       <div class="lw-c-card lw-c-card-info">
 *         <h3 class="lw-paragraph-2"><strong>Heading</strong></h3>
 *         <p class="lw-paragraph-1">Description</p>
 *         <picture><img class="lw-c-card-info__image" src="..."></picture>
 *       </div>
 *     </li>
 *   </ul>
 * </div>
 *
 * Generated: 2026-02-18
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all feature card items
  // VALIDATED: .lw-c-carousel__item found in captured DOM (line 1722)
  const slides = element.querySelectorAll('.lw-c-carousel__item');

  slides.forEach((slide) => {
    // Extract image
    // VALIDATED: .lw-c-card-info__image found in captured DOM (line 1731)
    const img = slide.querySelector('.lw-c-card-info__image, picture img, img');

    // Extract heading
    // VALIDATED: h3 with .lw-paragraph-2 found in captured DOM (line 1724)
    const heading = slide.querySelector('h3, .lw-paragraph-2');

    // Extract description
    // VALIDATED: p.lw-paragraph-1 found in captured DOM (line 1727)
    const description = slide.querySelector('p.lw-paragraph-1, p:not(h3):not(.lw-paragraph-2)');

    // Extract optional link (e.g., "Calcula tu Roaming" on roaming card)
    const link = slide.querySelector('a[href]');

    // Build image cell
    const imageCell = document.createElement('div');
    if (img) {
      const clonedImg = img.cloneNode(true);
      imageCell.appendChild(clonedImg);
    }

    // Build content cell
    const contentCell = document.createElement('div');

    if (heading) {
      const h2 = document.createElement('h2');
      h2.innerHTML = heading.innerHTML;
      contentCell.appendChild(h2);
    }

    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.appendChild(p);
    }

    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      p.appendChild(a);
      contentCell.appendChild(p);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-Features', cells });
  element.replaceWith(block);
}
