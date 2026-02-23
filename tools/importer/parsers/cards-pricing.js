/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-pricing block
 *
 * Source: https://www.lowi.es/
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Single-column table, one row per card
 * - Each row: title + subtitle + price + links + CTA
 *
 * Source HTML Pattern:
 * <div class="lw-m-cards-rate">
 *   <ul class="lw-m-cards-rate__block">
 *     <li class="lw-m-cards-rate__item">
 *       <div class="lw-c-card-rate">
 *         <span class="lw-c-label">Optional promotional label</span>
 *         <div class="lw-c-card-rate__card">
 *           <div class="lw-c-rate-item">
 *             <p class="lw-c-rate-item__title"><strong>Plan Name</strong></p>
 *             <p class="lw-c-rate-item__sub-title">Subtitle</p>
 *           </div>
 *           <span class="lw-c-price">
 *             <span class="lw-c-price__amount">30</span>
 *             <sup class="lw-c-price__decimals">'00</sup>
 *             <sub class="lw-c-price__recurrence">€/mes</sub>
 *             <p class="lw-c-price__text">Precio final</p>
 *           </span>
 *           <a class="lw-c-text-link" href="...">Más info</a>
 *           <button class="lw-c-button--secondary">Lo quiero</button>
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

  // Find all rate card items
  // VALIDATED: .lw-c-card-rate found in captured DOM (line 737)
  const cards = element.querySelectorAll('.lw-c-card-rate');

  cards.forEach((card) => {
    const cellContent = document.createElement('div');

    // Extract promotional label (optional)
    // VALIDATED: .lw-c-label found in captured DOM (line 768)
    const label = card.querySelector('.lw-c-label');

    // Extract plan title
    // VALIDATED: .lw-c-rate-item__title found in captured DOM (line 741)
    const title = card.querySelector('.lw-c-rate-item__title');

    // Extract subtitle
    // VALIDATED: .lw-c-rate-item__sub-title found in captured DOM (line 744)
    const subtitle = card.querySelector('.lw-c-rate-item__sub-title');

    // Extract price components
    // VALIDATED: .lw-c-price__amount, .lw-c-price__decimals, .lw-c-price__recurrence (lines 747-749)
    const priceAmount = card.querySelector('.lw-c-price__amount');
    const priceDecimals = card.querySelector('.lw-c-price__decimals');
    const priceRecurrence = card.querySelector('.lw-c-price__recurrence');
    const priceText = card.querySelector('.lw-c-price__text');

    // Extract links
    // VALIDATED: .lw-c-text-link found in captured DOM (line 755)
    const infoLink = card.querySelector('.lw-c-text-link, a[href]');

    // Extract CTA button
    // VALIDATED: .lw-c-button--secondary found in captured DOM (line 756)
    const ctaButton = card.querySelector('.lw-c-button--secondary, button.lw-c-button');

    // Build title with optional label
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      p.appendChild(strong);
      if (label) {
        const em = document.createElement('em');
        em.textContent = label.textContent.trim();
        p.appendChild(document.createTextNode(' — '));
        p.appendChild(em);
      }
      cellContent.appendChild(p);
    }

    // Add subtitle
    if (subtitle && subtitle.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = subtitle.textContent.trim();
      cellContent.appendChild(p);
    }

    // Add price line
    if (priceAmount) {
      const p = document.createElement('p');
      const priceStr = priceAmount.textContent.trim()
        + (priceDecimals ? priceDecimals.textContent.trim() : '')
        + ' '
        + (priceRecurrence ? priceRecurrence.textContent.trim() : '');
      p.innerHTML = '<strong>' + priceStr + '</strong>'
        + (priceText ? ' — ' + priceText.textContent.trim() : '');
      cellContent.appendChild(p);
    }

    // Add info link
    if (infoLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = infoLink.href;
      a.textContent = infoLink.textContent.trim();
      p.appendChild(a);
      cellContent.appendChild(p);
    }

    // Add CTA button
    if (ctaButton) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (infoLink) {
        const a = document.createElement('a');
        a.href = infoLink.href;
        a.textContent = ctaButton.textContent.trim();
        strong.appendChild(a);
      } else {
        strong.textContent = ctaButton.textContent.trim();
      }
      p.appendChild(strong);
      cellContent.appendChild(p);
    }

    cells.push([cellContent]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Pricing', cells });
  element.replaceWith(block);
}
