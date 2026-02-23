/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Lowi website cleanup
 * Purpose: Remove non-content elements, modals, navigation, and fix HTML issues
 * Applies to: www.lowi.es (all templates)
 * Generated: 2026-02-18
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html from scrape-webpage)
 * - Page structure analysis from page migration workflow
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header/navigation (auto-populated in EDS)
    // EXTRACTED: Found <header class="lw-header"> in captured DOM (line 24)
    WebImporter.DOMUtils.remove(element, [
      'header.lw-header',
      '.lw-header',
    ]);

    // Remove footer (auto-populated in EDS)
    // EXTRACTED: Found <footer class="lw-footer"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'footer.lw-footer',
      '.lw-footer',
    ]);

    // Remove modal dialogs (cart delete, channel list, etc.)
    // EXTRACTED: Found <dialog class="lw-c-modal"> with IDs: modal-delete-cart, modal-simple, modal-simple-1500360476029
    WebImporter.DOMUtils.remove(element, [
      'dialog.lw-c-modal',
      '.lw-c-modal',
    ]);

    // Remove hidden forms inside rate cards
    // EXTRACTED: Found <form class="lw-hidden"> inside .lw-m-cards-rate__item (line 732)
    WebImporter.DOMUtils.remove(element, [
      'form.lw-hidden',
    ]);

    // Remove carousel navigation buttons (non-content UI elements)
    // EXTRACTED: Found <button class="lw-c-carousel__btn"> in carousel sections (line 1718)
    WebImporter.DOMUtils.remove(element, [
      '.lw-c-carousel__btn',
      '.lw-c-carousel__pagination',
    ]);

    // Remove hero banner carousel navigation dots
    // EXTRACTED: Found pagination/dot navigation in .lw-c-hero-banner-carousel
    WebImporter.DOMUtils.remove(element, [
      '.lw-c-hero-banner-carousel__pagination',
      '.lw-c-hero-banner-carousel__bullets',
    ]);

    // Remove skip-to-content links
    // EXTRACTED: Found <a class="lw-header__skip-link"> (line 25)
    WebImporter.DOMUtils.remove(element, [
      '.lw-header__skip-link',
    ]);

    // Remove inline SVG sprite definitions (non-content)
    // These are base64-encoded SVG icons used as inline sprites
    WebImporter.DOMUtils.remove(element, [
      'svg[style*="display: none"]',
      'svg[style*="display:none"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining non-content elements after block parsing
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'source',
    ]);

    // Clean up tracking/analytics attributes
    // EXTRACTED: Found data-* attributes on various elements in captured DOM
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
    });
  }
}
