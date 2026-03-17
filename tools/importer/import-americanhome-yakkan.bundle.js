var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-americanhome-yakkan.js
  var import_americanhome_yakkan_exports = {};
  __export(import_americanhome_yakkan_exports, {
    default: () => import_americanhome_yakkan_default
  });

  // tools/importer/parsers/yakkan-accordion.js
  function parse(element, { document, artDirectionMap: artDirectionMap3 }) {
    const accordion = element.querySelector(".cmp-accordion") || element;
    const items = accordion.querySelectorAll(".cmp-accordion__item");
    if (items.length === 0) return;
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title");
      const panel = item.querySelector(".cmp-accordion__panel");
      if (!titleEl || !panel) return;
      const title = titleEl.textContent.trim();
      const contentDiv = document.createElement("div");
      function walkAndExtract(el) {
        if (!el || !el.classList) {
          if (el && el.children) {
            for (const child of el.children) {
              walkAndExtract(child);
            }
          }
          return;
        }
        if (el.classList.contains("hb_mobile__only") || el.classList.contains("hideinpc")) {
          return;
        }
        if (el.classList.contains("cmp-image")) {
          const link = el.querySelector(".cmp-image__link");
          const img = el.querySelector(".cmp-image__image");
          if (!img) return;
          const p = document.createElement("p");
          if (link) {
            const a = document.createElement("a");
            const pdfHref = link.getAttribute("href");
            a.href = pdfHref || link.href;
            if (artDirectionMap3 && pdfHref && artDirectionMap3.has(pdfHref)) {
              const mobileImg = document.createElement("img");
              mobileImg.src = artDirectionMap3.get(pdfHref);
              mobileImg.alt = img.getAttribute("alt") || "";
              a.appendChild(mobileImg);
            }
            const desktopImg = document.createElement("img");
            desktopImg.src = img.getAttribute("src");
            desktopImg.alt = img.getAttribute("alt") || "";
            a.appendChild(desktopImg);
            p.appendChild(a);
          } else {
            const desktopImg = document.createElement("img");
            desktopImg.src = img.getAttribute("src");
            desktopImg.alt = img.getAttribute("alt") || "";
            p.appendChild(desktopImg);
          }
          contentDiv.appendChild(p);
          return;
        }
        if (el.classList.contains("cmp-teaser__description")) {
          const ps = el.querySelectorAll("p");
          ps.forEach((origP) => {
            const hasIcon = origP.querySelector('img[src*="icon"]');
            const hasLink = origP.querySelector("a");
            if (hasIcon && hasLink) {
              contentDiv.appendChild(origP.cloneNode(true));
            } else if (origP.textContent.trim().startsWith("\u203B")) {
              contentDiv.appendChild(origP.cloneNode(true));
            }
          });
          return;
        }
        if (el.classList.contains("cmp-text")) {
          const ps = el.querySelectorAll("p");
          ps.forEach((p) => {
            if (p.textContent.trim().startsWith("\u203B")) {
              contentDiv.appendChild(p.cloneNode(true));
            }
          });
          return;
        }
        for (const child of el.children) {
          walkAndExtract(child);
        }
      }
      walkAndExtract(panel);
      cells.push([[title], [contentDiv]]);
    });
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, {
        name: "Accordion",
        cells
      });
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/americanhome-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--japan-aha-header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hb_mobile__only"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".button.back_to_top"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "input#lastmodifiedDate"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript"
      ]);
      const body = element.querySelector("body") || element;
      if (body.hasAttribute("data-cmp-data-layer-enabled")) {
        body.removeAttribute("data-cmp-data-layer-enabled");
      }
    }
  }

  // tools/importer/transformers/americanhome-yakkan.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var artDirectionMap = /* @__PURE__ */ new Map();
  function createNarrowMeta(document) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [[["style"], ["narrow"]]]
    });
  }
  function transform2(hookName, element, payload) {
    const { document: doc } = payload;
    if (hookName === TransformHook2.beforeTransform) {
      artDirectionMap.clear();
      const mobileContainers = element.querySelectorAll(
        '.hb_mobile__only, [class*="hb_mobile__only"]'
      );
      mobileContainers.forEach((container) => {
        const links = container.querySelectorAll('a[href*=".pdf"]');
        links.forEach((link) => {
          const img = link.querySelector("img");
          if (img) {
            const href = link.getAttribute("href");
            const src = img.getAttribute("src");
            if (href && src && !artDirectionMap.has(href)) {
              artDirectionMap.set(href, src);
            }
          }
        });
      });
      console.log(`[yakkan] Art direction map: ${artDirectionMap.size} entries`);
      WebImporter.DOMUtils.remove(element, [".hideinpc"]);
    }
    if (hookName === TransformHook2.afterTransform) {
      const subNavP = element.querySelector('p:has(img[src*="policynav"])');
      if (subNavP) {
        const subNavContainer = subNavP.closest(".flexbox-container") || subNavP.parentElement;
        if (subNavContainer && subNavContainer !== element) {
          subNavContainer.before(subNavP);
          if (subNavContainer.textContent.trim() === "") {
            subNavContainer.remove();
          }
        }
      }
      const h1 = element.querySelector("h1");
      if (h1) {
        const h1Container = h1.closest(".coreblue") || h1.closest(".flexbox-container");
        if (h1Container) {
          h1Container.replaceWith(h1);
        }
      }
      const descTeasers = element.querySelectorAll(".cmp-teaser__description");
      descTeasers.forEach((desc) => {
        const ps = desc.querySelectorAll("p");
        const teaser = desc.closest(".teaserflex");
        if (!teaser || ps.length === 0) return;
        if (teaser.classList.contains("dttitlecoreblue") || teaser.classList.contains("dttitlecoredgray") || teaser.matches(".bottom-border-h3") || teaser.querySelector(".cmp-teaser__title")) return;
        const frag = doc.createDocumentFragment();
        ps.forEach((p) => frag.appendChild(p.cloneNode(true)));
        teaser.replaceWith(frag);
      });
      const clickableImages = element.querySelectorAll(
        ".jp-imageclickable-2:not(.cmp-accordion__panel .jp-imageclickable-2)"
      );
      clickableImages.forEach((imgEl) => {
        if (imgEl.closest(".paleblueborder.completeborder")) return;
        const link = imgEl.querySelector(".cmp-image__link");
        const img = imgEl.querySelector(".cmp-image__image");
        if (link && img) {
          const p = doc.createElement("p");
          const a = doc.createElement("a");
          a.href = link.getAttribute("href") || link.href;
          a.appendChild(img.cloneNode(true));
          p.appendChild(a);
          imgEl.replaceWith(p);
        } else if (img) {
          const p = doc.createElement("p");
          p.appendChild(img.cloneNode(true));
          imgEl.replaceWith(p);
        }
      });
      const standaloneImages = element.querySelectorAll(
        ".cmp-image:not(.cmp-accordion__panel .cmp-image):not(.jp-imageclickable-2 .cmp-image)"
      );
      standaloneImages.forEach((imgEl) => {
        const img = imgEl.querySelector(".cmp-image__image");
        if (img) {
          const p = doc.createElement("p");
          p.appendChild(img.cloneNode(true));
          imgEl.replaceWith(p);
        }
      });
      const headingTeasers = element.querySelectorAll(
        ".dttitlecoreblue, .dttitlecoredgray, .bottom-border-h3"
      );
      headingTeasers.forEach((teaser) => {
        const frag = doc.createDocumentFragment();
        const titleEl = teaser.querySelector(".cmp-teaser__title");
        if (titleEl) {
          frag.appendChild(titleEl.cloneNode(true));
        }
        const innerDesc = teaser.querySelector(".cmp-teaser__description");
        if (innerDesc) {
          const children = Array.from(innerDesc.children);
          children.forEach((child) => frag.appendChild(child.cloneNode(true)));
        }
        teaser.replaceWith(frag);
      });
      const textComponents = element.querySelectorAll(".cmp-text");
      textComponents.forEach((textEl) => {
        const frag = doc.createDocumentFragment();
        const children = Array.from(textEl.children);
        children.forEach((child) => frag.appendChild(child.cloneNode(true)));
        const textContainer = textEl.closest(".text") || textEl;
        textContainer.replaceWith(frag);
      });
      const contactBoxes = element.querySelectorAll(".paleblueborder.completeborder:not(.topborder)");
      contactBoxes.forEach((box) => {
        const h2 = box.querySelector("h2");
        if (h2 && h2.textContent.includes("\u304A\u554F\u3044\u5408\u308F\u305B\u5148")) {
          const frag = doc.createDocumentFragment();
          frag.appendChild(h2.cloneNode(true));
          const descPs = box.querySelectorAll(".cmp-teaser__description p");
          descPs.forEach((p) => frag.appendChild(p.cloneNode(true)));
          const btnLink = box.querySelector(".cmp-image__link");
          const btnImg = box.querySelector(".cmp-image__image");
          if (btnLink && btnImg) {
            const p = doc.createElement("p");
            const a = doc.createElement("a");
            a.href = btnLink.getAttribute("href") || btnLink.href;
            a.appendChild(btnImg.cloneNode(true));
            p.appendChild(a);
            frag.appendChild(p);
          }
          box.replaceWith(frag);
        }
      });
      const adobeBoxes = element.querySelectorAll(".aiglightgray.ltgrayborder.completeborder");
      adobeBoxes.forEach((box) => {
        const frag = doc.createDocumentFragment();
        frag.appendChild(createNarrowMeta(doc));
        frag.appendChild(doc.createElement("hr"));
        const img = box.querySelector(".cmp-image__image");
        if (img) {
          const p = doc.createElement("p");
          p.appendChild(img.cloneNode(true));
          frag.appendChild(p);
        }
        const texts = box.querySelectorAll(".cmp-teaser__description p, .cmp-text p");
        texts.forEach((p) => frag.appendChild(p.cloneNode(true)));
        box.replaceWith(frag);
      });
      const unwrapSelectors = [
        ".flexbox-container",
        '.responsivegrid:not([class*="root"])',
        ".cmp-container",
        ".aem-Grid"
      ];
      for (let pass = 0; pass < 5; pass++) {
        unwrapSelectors.forEach((sel) => {
          const containers = element.querySelectorAll(sel);
          containers.forEach((container) => {
            if (container.closest("table")) return;
            if (container.classList.contains("accordion")) return;
            if (container.classList.contains("cmp-accordion")) return;
            const parent = container.parentElement;
            if (parent) {
              while (container.firstChild) {
                parent.insertBefore(container.firstChild, container);
              }
              container.remove();
            }
          });
        });
      }
      WebImporter.DOMUtils.remove(element, [
        ".cmp-accordion__icon",
        ".hideinmobile:empty",
        'div[class=""]:empty',
        "div:not([class]):empty"
      ]);
      {
        const accTables = Array.from(element.querySelectorAll("table")).filter((t) => {
          const th = t.querySelector("th");
          return th && th.textContent.trim() === "Accordion";
        });
        for (let idx = accTables.length - 1; idx > 0; idx--) {
          const curr = accTables[idx];
          const prev = accTables[idx - 1];
          if (curr.parentElement !== prev.parentElement) continue;
          let hasContent = false;
          let node = prev.nextSibling;
          while (node && node !== curr) {
            if (node.nodeType === 1 && node.textContent.trim() !== "") {
              hasContent = true;
              break;
            }
            if (node.nodeType === 3 && node.textContent.trim() !== "") {
              hasContent = true;
              break;
            }
            node = node.nextSibling;
          }
          if (!hasContent) {
            const rows = Array.from(curr.querySelectorAll("tr"));
            rows.forEach((row) => {
              if (row.querySelector("th")) return;
              prev.appendChild(row);
            });
            curr.remove();
          }
        }
      }
      const firstH1 = element.querySelector("h1");
      if (firstH1) {
        firstH1.before(createNarrowMeta(doc));
        firstH1.before(doc.createElement("hr"));
        firstH1.after(doc.createElement("hr"));
      }
      const allH2 = Array.from(element.querySelectorAll("h2"));
      allH2.forEach((h2) => {
        h2.before(createNarrowMeta(doc));
        h2.before(doc.createElement("hr"));
      });
      const accordionTables = Array.from(element.querySelectorAll("table"));
      accordionTables.forEach((table) => {
        const th = table.querySelector("th");
        if (th && th.textContent.trim() === "Accordion") {
          const prev = table.previousElementSibling;
          if (prev && prev.tagName !== "HR") {
            table.before(createNarrowMeta(doc));
            table.before(doc.createElement("hr"));
          }
        }
      });
      const allPs = element.querySelectorAll("p");
      let refCodeP = null;
      let pageNumP = null;
      allPs.forEach((p) => {
        const text = p.textContent.trim();
        if (/^PC\d{2}/.test(text) && !refCodeP) refCodeP = p;
        if (/^ページ番号/.test(text)) pageNumP = p;
      });
      if (refCodeP) {
        refCodeP.before(createNarrowMeta(doc));
        refCodeP.before(doc.createElement("hr"));
      }
      const metadataTable = Array.from(element.querySelectorAll("table")).find((t) => {
        const th = t.querySelector("th");
        return th && th.textContent.trim() === "Metadata";
      });
      if (metadataTable) {
        metadataTable.before(createNarrowMeta(doc));
        metadataTable.before(doc.createElement("hr"));
      } else {
        element.appendChild(createNarrowMeta(doc));
      }
    }
  }

  // tools/importer/import-americanhome-yakkan.js
  var parsers = {
    "accordion": parse
  };
  var transformers = [
    transform2,
    transform
  ];
  var artDirectionMap2 = /* @__PURE__ */ new Map();
  var PAGE_TEMPLATE = {
    name: "americanhome-yakkan",
    description: "Policy terms (yakkan) pages with sub-navigation, accordion blocks, and PDF download buttons",
    urls: [
      "https://www.americanhome.co.jp/home/policy/pa_yakkan",
      "https://www.americanhome.co.jp/home/policy/npp_no_yakkan"
    ],
    blocks: [
      {
        name: "accordion",
        instances: [
          ".accordion.panelcontainer.jp-accordion"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function buildArtDirectionMap(element) {
    artDirectionMap2.clear();
    const mobileContainers = element.querySelectorAll(
      '.hb_mobile__only, [class*="hb_mobile__only"]'
    );
    mobileContainers.forEach((container) => {
      const links = container.querySelectorAll('a[href*=".pdf"]');
      links.forEach((link) => {
        const img = link.querySelector("img");
        if (img) {
          const href = link.getAttribute("href");
          const src = img.getAttribute("src");
          if (href && src && !artDirectionMap2.has(href)) {
            artDirectionMap2.set(href, src);
          }
        }
      });
    });
    console.log(`[yakkan] Art direction map: ${artDirectionMap2.size} entries`);
  }
  var import_americanhome_yakkan_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      buildArtDirectionMap(main);
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params, artDirectionMap: artDirectionMap2 });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const allTables = main.querySelectorAll("table");
      for (const table of allTables) {
        const th = table.querySelector("th");
        if (th && th.textContent.trim() === "Metadata") {
          const tr = document.createElement("tr");
          const tdKey = document.createElement("td");
          tdKey.textContent = "template";
          const tdVal = document.createElement("td");
          tdVal.textContent = "yakkan";
          tr.appendChild(tdKey);
          tr.appendChild(tdVal);
          table.appendChild(tr);
          break;
        }
      }
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_americanhome_yakkan_exports);
})();
