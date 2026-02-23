/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo block
 *
 * Source: https://www.lowi.es/
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Single row with 2 columns: [text content | image]
 *
 * Source HTML Pattern:
 * <div class="lw-c-banner-promo lw-c-card lw-c-banner-promo--reverse lw-dark">
 *   <div class="lw-c-banner-promo__content">
 *     <p class="lw-subheading-2"><strong>Heading</strong></p>
 *     <p class="lw-paragraph-2">Description</p>
 *     <a class="lw-c-button--dark" href="...">CTA</a>
 *   </div>
 *   <picture class="lw-c-banner-promo__image">
 *     <img src="..." alt="...">
 *   </picture>
 * </div>
 *
 * Generated: 2026-02-18
 */
export default function parse(element, { document }) {
  // Extract text content column
  // VALIDATED: .lw-c-banner-promo__content found in captured DOM (line 973)
  const contentDiv = element.querySelector('.lw-c-banner-promo__content');

  // Extract image column
  // VALIDATED: .lw-c-banner-promo__image found in captured DOM, also picture > img
  const image = element.querySelector('.lw-c-banner-promo__image img, picture img');

  // Build left column (text content)
  const leftCol = document.createElement('div');

  if (contentDiv) {
    // Extract price/subtitle line
    // VALIDATED: element with class containing "lw-c-banner-promo__price" or preceding text
    const priceLabel = element.querySelector('.lw-c-banner-promo__label, [class*="price-label"]');

    // Extract heading
    // VALIDATED: .lw-subheading-2 found in captured DOM (line 974)
    const heading = contentDiv.querySelector('.lw-subheading-2, p > strong > strong, h2');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.innerHTML = '<strong>' + heading.textContent.trim() + '</strong>';
      leftCol.appendChild(h2);
    }

    // Extract description
    // VALIDATED: .lw-paragraph-2 found in captured DOM (line 979)
    const description = contentDiv.querySelector('.lw-paragraph-2, p:not(.lw-subheading-2)');
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      leftCol.appendChild(p);
    }

    // Extract CTA link
    // VALIDATED: a.lw-c-button found in captured DOM (line 981)
    const ctaLink = contentDiv.querySelector('a.lw-c-button, a[href]');
    if (ctaLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      p.appendChild(a);
      leftCol.appendChild(p);
    }
  }

  // Build right column (image)
  const rightCol = document.createElement('div');
  if (image) {
    const clonedImg = image.cloneNode(true);
    rightCol.appendChild(clonedImg);
  }

  const cells = [[leftCol, rightCol]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Promo', cells });
  element.replaceWith(block);
}
