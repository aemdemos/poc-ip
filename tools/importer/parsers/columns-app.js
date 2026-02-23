/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-app block
 *
 * Source: https://www.lowi.es/
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Single row with 2 columns: [app screenshot image | heading + subtitle + feature list + CTA + store badges]
 *
 * Source HTML Pattern:
 * <div class="lw-m-product-description-card">
 *   <div class="lw-c-titles">
 *     <h2 class="lw-c-titles__title">Heading</h2>
 *     <p class="lw-c-titles__sub-title">Subtitle</p>
 *   </div>
 *   <picture>
 *     <img class="lw-m-product-description-card__image" src="...">
 *   </picture>
 *   <div> (feature list container)
 *     <ul>
 *       <li><p class="lw-paragraph-2">Feature text</p></li>
 *     </ul>
 *     <a class="lw-c-button">CTA</a>
 *     <p>Store badges heading</p>
 *     <a href="play.google.com"><img src="..."></a>
 *     <a href="itunes.apple.com"><img src="..."></a>
 *     <a href="appgallery.huawei.com"><img src="..."></a>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-18
 */
export default function parse(element, { document }) {
  // Extract app screenshot image
  // VALIDATED: .lw-m-product-description-card__image found in captured DOM (line 1921)
  const appImage = element.querySelector('.lw-m-product-description-card__image, picture img');

  // Extract heading
  // VALIDATED: .lw-c-titles__title found in captured DOM (line 1911)
  const heading = element.querySelector('.lw-c-titles__title, h2');

  // Extract subtitle
  // VALIDATED: .lw-c-titles__sub-title found in captured DOM (line 1914)
  const subtitle = element.querySelector('.lw-c-titles__sub-title');

  // Extract feature list items
  // VALIDATED: p.lw-paragraph-2 inside li found in captured DOM (line 1927)
  const featureItems = Array.from(element.querySelectorAll('ul li .lw-paragraph-2, ul li p'));

  // Extract CTA button/link
  // VALIDATED: a.lw-c-button found in captured DOM
  const ctaLink = element.querySelector('a.lw-c-button, a[href*="nuestra-app"]');

  // Extract app store badge links
  // VALIDATED: Links to Google Play, App Store, AppGallery found in captured DOM
  const storeBadges = Array.from(element.querySelectorAll('a[href*="play.google"], a[href*="itunes.apple"], a[href*="appgallery.huawei"]'));

  // Build left column (image)
  const leftCol = document.createElement('div');
  if (appImage) {
    const clonedImg = appImage.cloneNode(true);
    leftCol.appendChild(clonedImg);
  }

  // Build right column (content)
  const rightCol = document.createElement('div');

  if (heading) {
    const h2 = document.createElement('h2');
    h2.innerHTML = '<strong>' + heading.textContent.trim() + '</strong>';
    rightCol.appendChild(h2);
  }

  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle.textContent.trim();
    rightCol.appendChild(p);
  }

  // Add feature list
  if (featureItems.length > 0) {
    const ul = document.createElement('ul');
    featureItems.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.textContent.trim();
      ul.appendChild(li);
    });
    rightCol.appendChild(ul);
  }

  // Add CTA
  if (ctaLink) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent.trim();
    strong.appendChild(a);
    p.appendChild(strong);
    rightCol.appendChild(p);
  }

  // Add store badges heading and images
  if (storeBadges.length > 0) {
    const badgeHeading = document.createElement('p');
    badgeHeading.innerHTML = '<strong>Descarga de la App</strong>';
    rightCol.appendChild(badgeHeading);

    storeBadges.forEach((badge) => {
      const badgeImg = badge.querySelector('img');
      if (badgeImg) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = badge.href;
        const img = badgeImg.cloneNode(true);
        a.appendChild(img);
        p.appendChild(a);
        rightCol.appendChild(p);
      }
    });
  }

  const cells = [[leftCol, rightCol]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-App', cells });
  element.replaceWith(block);
}
