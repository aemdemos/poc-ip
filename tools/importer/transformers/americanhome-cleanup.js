/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for American Home Insurance website cleanup
 * Purpose: Remove non-content elements (header, footer, mobile duplicates, tracking)
 * Applies to: www.americanhome.co.jp (all templates)
 * Generated: 2026-02-24
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 * - Page structure analysis from page migration workflow
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header experience fragment
    // EXTRACTED: Found <div class="cmp-experiencefragment cmp-experiencefragment--japan-aha-header">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--japan-aha-header',
    ]);

    // Remove footer experience fragment
    // EXTRACTED: Found <div class="cmp-experiencefragment cmp-experiencefragment--footer">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--footer',
    ]);

    // Remove mobile-only duplicate content (desktop content is primary)
    // EXTRACTED: Found 4 instances of .hb_mobile__only duplicating desktop carousel,
    // sections, and flexbox containers
    WebImporter.DOMUtils.remove(element, [
      '.hb_mobile__only',
    ]);

    // Remove back-to-top button
    // EXTRACTED: Found <div class="button aig_button back_to_top"> before footer
    WebImporter.DOMUtils.remove(element, [
      '.button.back_to_top',
    ]);

    // Remove hidden input (lastmodifiedDate)
    // EXTRACTED: Found <input id="lastmodifiedDate"> at end of body
    WebImporter.DOMUtils.remove(element, [
      'input#lastmodifiedDate',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining iframes (GTM remnants)
    // EXTRACTED: Found empty <iframe> from Google Tag Manager at end of body
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
    ]);

    // Clean up AEM data-layer attributes
    const body = element.querySelector('body') || element;
    if (body.hasAttribute('data-cmp-data-layer-enabled')) {
      body.removeAttribute('data-cmp-data-layer-enabled');
    }
  }
}
