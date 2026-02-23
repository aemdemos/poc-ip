/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-promo block
 *
 * Source: https://www.lowi.es/
 * Base Block: carousel
 *
 * Block Structure (from markdown example):
 * - Row per slide: [image | heading + subtitle + rate details + CTA]
 *
 * Source HTML Pattern:
 * <div class="lw-c-hero-banner-carousel">
 *   <ul class="lw-c-hero-banner-carousel__list">
 *     <li class="lw-c-hero-banner-carousel__item">
 *       <div class="lw-m-hero-banner">
 *         <div class="lw-c-titles">
 *           <p class="lw-c-titles__title"><strong>Heading</strong></p>
 *           <p class="lw-c-titles__sub-title"><span>Subtitle</span></p>
 *         </div>
 *         <button class="lw-c-button--primary">CTA</button>
 *         <picture><img class="lw-m-hero-banner__img" src="..."></picture>
 *         <div class="lw-c-rate-bolus">
 *           <div class="lw-c-rate-item"><p class="lw-c-rate-item__title">Rate info</p></div>
 *           <span class="lw-c-price"><span class="lw-c-price__amount">36</span>...</span>
 *         </div>
 *       </div>
 *     </li>
 *   </ul>
 * </div>
 *
 * Generated: 2026-02-18
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all carousel slides
  // VALIDATED: .lw-c-hero-banner-carousel__item found in captured DOM (line 458)
  const slides = element.querySelectorAll('.lw-c-hero-banner-carousel__item');

  slides.forEach((slide) => {
    // Extract image from slide
    // VALIDATED: .lw-m-hero-banner__img found in captured DOM (line 477)
    const img = slide.querySelector('.lw-m-hero-banner__img, picture img');

    // Extract heading
    // VALIDATED: .lw-c-titles__title found in captured DOM (line 461)
    const heading = slide.querySelector('.lw-c-titles__title');

    // Extract subtitle
    // VALIDATED: .lw-c-titles__sub-title found in captured DOM (line 464)
    const subtitle = slide.querySelector('.lw-c-titles__sub-title');

    // Extract rate details
    // VALIDATED: .lw-c-rate-item__title found in captured DOM (line 488)
    const rateItems = Array.from(slide.querySelectorAll('.lw-c-rate-item__title'));

    // Extract price
    // VALIDATED: .lw-c-price__amount, .lw-c-price__decimals, .lw-c-price__recurrence found (lines 502-504)
    const priceAmount = slide.querySelector('.lw-c-price__amount');
    const priceDecimals = slide.querySelector('.lw-c-price__decimals');
    const priceRecurrence = slide.querySelector('.lw-c-price__recurrence');

    // Extract CTA button
    // VALIDATED: .lw-c-button--primary found in captured DOM (line 471)
    const ctaButton = slide.querySelector('.lw-c-button--primary, button.lw-c-button');

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

    if (subtitle) {
      const p = document.createElement('p');
      p.textContent = subtitle.textContent.trim();
      contentCell.appendChild(p);
    }

    // Build rate line
    if (rateItems.length > 0 && priceAmount) {
      const rateLine = document.createElement('p');
      const rateText = rateItems.map((item) => item.textContent.trim()).join(' + ');
      const priceText = priceAmount.textContent.trim()
        + (priceDecimals ? priceDecimals.textContent.trim() : '')
        + ' '
        + (priceRecurrence ? priceRecurrence.textContent.trim() : '');
      rateLine.innerHTML = rateText + ' — <strong>' + priceText + '</strong>';
      contentCell.appendChild(rateLine);
    }

    if (ctaButton) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      // Try to find link wrapping the button or nearby link
      const link = slide.querySelector('a.lw-c-button, a[href]');
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = ctaButton.textContent.trim();
        strong.appendChild(a);
      } else {
        strong.textContent = ctaButton.textContent.trim();
      }
      p.appendChild(strong);
      contentCell.appendChild(p);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-Promo', cells });
  element.replaceWith(block);
}
