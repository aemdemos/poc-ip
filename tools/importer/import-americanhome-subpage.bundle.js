var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-americanhome-subpage.js
  var import_americanhome_subpage_exports = {};
  __export(import_americanhome_subpage_exports, {
    default: () => import_americanhome_subpage_default
  });

  // tools/importer/parsers/subpage-columns.js
  function parse(element, { document }) {
    const cells = [];
    const thirdwidthImages = element.querySelectorAll(".image.thirdwidth");
    const halfwidthImages = element.querySelectorAll(".image.halfwidth");
    const items = thirdwidthImages.length > 0 ? thirdwidthImages : halfwidthImages;
    if (items.length >= 2) {
      const row = [];
      items.forEach((item) => {
        const cellContent = [];
        const link = item.querySelector(".cmp-image__link");
        const img = item.querySelector(".cmp-image__image");
        if (link && img) {
          const a = document.createElement("a");
          a.href = link.href;
          const imgClone = img.cloneNode(true);
          a.appendChild(imgClone);
          cellContent.push(a);
        } else if (img) {
          cellContent.push(img.cloneNode(true));
        }
        row.push(cellContent);
      });
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-gray-box.js
  function parse2(element, { document }) {
    const cells = [];
    const row = [];
    const leftCell = [];
    const heading = element.querySelector("h3");
    if (heading) {
      const h3 = document.createElement("h3");
      h3.textContent = heading.textContent.trim();
      leftCell.push(h3);
    }
    const teaserText = element.querySelector(".teaser.halfwidth .cmp-teaser__description p");
    if (teaserText) {
      leftCell.push(teaserText.cloneNode(true));
    }
    row.push(leftCell);
    const rightCell = [];
    const link = element.querySelector(".cmp-image__link");
    const img = element.querySelector(".cmp-image__image");
    if (link && img) {
      const a = document.createElement("a");
      a.href = link.href;
      const imgClone = img.cloneNode(true);
      a.appendChild(imgClone);
      rightCell.push(a);
    } else if (img) {
      rightCell.push(img.cloneNode(true));
    }
    row.push(rightCell);
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (gray-box)", cells });
    element.replaceWith(block);
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

  // tools/importer/transformers/americanhome-subpage.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function createNarrowMeta(document) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [[["style"], ["narrow"]]]
    });
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".hideinpc"
      ]);
      const cardContainers = element.querySelectorAll(".halfwidth.paleblueborder.completeborder");
      if (cardContainers.length === 2) {
        let extractCardContent = function(card) {
          const frag = doc.createDocumentFragment();
          const els = card.querySelectorAll("h3, h4, p, img, a, hr");
          const seen = /* @__PURE__ */ new Set();
          els.forEach((el) => {
            if (el.tagName === "IMG" && (el.closest("h3") || el.closest("h4") || el.closest("p") || el.closest("a"))) return;
            if (el.tagName === "A" && el.closest("p")) return;
            if (seen.has(el)) return;
            seen.add(el);
            if (el.tagName === "H3" || el.tagName === "H4") {
              const img = el.querySelector("img");
              if (img) {
                const p = doc.createElement("p");
                p.appendChild(img.cloneNode(true));
                frag.appendChild(p);
              }
            } else {
              frag.appendChild(el.cloneNode(true));
            }
          });
          return frag;
        };
        const { document: doc } = payload;
        cardContainers.forEach((card, idx) => {
          const markerDiv = doc.createElement("div");
          markerDiv.className = idx === 0 ? "reissue-card-left" : "reissue-card-right";
          markerDiv.appendChild(extractCardContent(card));
          card.replaceWith(markerDiv);
        });
      }
      const allDttHeadings = element.querySelectorAll(".dttitlecoreblue.left-border-h2");
      let halfwidths = [];
      let halfwidthParent = null;
      for (const heading of allDttHeadings) {
        const parent = heading.parentElement;
        if (!parent) continue;
        const candidates = Array.from(parent.querySelectorAll(":scope > .halfwidth:not(.paleblueborder)"));
        if (candidates.length === 2) {
          halfwidths = candidates;
          halfwidthParent = parent;
          break;
        }
      }
      if (halfwidths.length === 2) {
        let extractHalfContent = function(container) {
          const frag = doc.createDocumentFragment();
          const els = container.querySelectorAll("p, img, a");
          const seen = /* @__PURE__ */ new Set();
          els.forEach((el) => {
            if (el.tagName === "IMG" && (el.closest("p") || el.closest("a"))) return;
            if (el.tagName === "A" && el.closest("p")) return;
            if (seen.has(el)) return;
            seen.add(el);
            frag.appendChild(el.cloneNode(true));
          });
          return frag;
        };
        const { document: doc } = payload;
        halfwidths.forEach((hw, idx) => {
          const markerDiv = doc.createElement("div");
          markerDiv.className = idx === 0 ? "accessibility-col-left" : "accessibility-col-right";
          markerDiv.appendChild(extractHalfContent(hw));
          hw.replaceWith(markerDiv);
        });
      }
      const quarterEls = element.querySelectorAll(".quarterwidth");
      for (const quarterEl of quarterEls) {
        let extractVideoContent = function(container) {
          const frag = doc.createDocumentFragment();
          const els = container.querySelectorAll("p, img, a");
          const seen = /* @__PURE__ */ new Set();
          els.forEach((el) => {
            if (el.tagName === "IMG" && (el.closest("p") || el.closest("a"))) return;
            if (el.tagName === "A" && el.closest("p")) return;
            if (seen.has(el)) return;
            seen.add(el);
            frag.appendChild(el.cloneNode(true));
          });
          return frag;
        };
        const parent = quarterEl.parentElement;
        if (!parent) continue;
        const threeQuarterEl = parent.querySelector(":scope > .threequarterwidth");
        if (!threeQuarterEl) continue;
        const hasHeading = parent.querySelector(":scope > .dttitlecoreblue");
        if (!hasHeading) continue;
        const { document: doc } = payload;
        const leftMarker = doc.createElement("div");
        leftMarker.className = "video-col-left";
        leftMarker.appendChild(extractVideoContent(quarterEl));
        quarterEl.replaceWith(leftMarker);
        const rightMarker = doc.createElement("div");
        rightMarker.className = "video-col-right";
        rightMarker.appendChild(extractVideoContent(threeQuarterEl));
        threeQuarterEl.replaceWith(rightMarker);
        break;
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const columnsTables = Array.from(element.querySelectorAll("table"));
      for (let i = 0; i < columnsTables.length - 1; i++) {
        const first = columnsTables[i];
        const second = columnsTables[i + 1];
        const firstTh = first.querySelector("th");
        const secondTh = second.querySelector("th");
        if (!firstTh || !secondTh) continue;
        if (firstTh.textContent.trim() !== "Columns") continue;
        if (secondTh.textContent.trim() !== "Columns") continue;
        if (first.nextElementSibling !== second) continue;
        const firstRows = Array.from(first.querySelectorAll("tr")).slice(1);
        const secondRows = Array.from(second.querySelectorAll("tr")).slice(1);
        let maxCols = 0;
        firstRows.forEach((r) => {
          maxCols = Math.max(maxCols, r.children.length);
        });
        secondRows.forEach((row) => {
          while (row.children.length < maxCols) {
            row.appendChild(document.createElement("td"));
          }
          first.appendChild(row);
        });
        second.remove();
        columnsTables.splice(i + 1, 1);
        i--;
      }
      const leftMarker = element.querySelector(".reissue-card-left");
      const rightMarker = element.querySelector(".reissue-card-right");
      if (leftMarker && rightMarker) {
        const leftClone = leftMarker.cloneNode(true);
        const rightClone = rightMarker.cloneNode(true);
        const borderedBlock = WebImporter.Blocks.createBlock(document, {
          name: "Columns (bordered)",
          cells: [[[leftClone], [rightClone]]]
        });
        leftMarker.before(borderedBlock);
        leftMarker.remove();
        rightMarker.remove();
      }
      const vidLeft = element.querySelector(".video-col-left");
      const vidRight = element.querySelector(".video-col-right");
      if (vidLeft && vidRight) {
        const vidLeftClone = vidLeft.cloneNode(true);
        const vidRightClone = vidRight.cloneNode(true);
        const vidBlock = WebImporter.Blocks.createBlock(document, {
          name: "Columns",
          cells: [[[vidLeftClone], [vidRightClone]]]
        });
        vidLeft.before(vidBlock);
        vidLeft.remove();
        vidRight.remove();
      }
      const accLeft = element.querySelector(".accessibility-col-left");
      const accRight = element.querySelector(".accessibility-col-right");
      if (accLeft && accRight) {
        const accLeftClone = accLeft.cloneNode(true);
        const accRightClone = accRight.cloneNode(true);
        const accBlock = WebImporter.Blocks.createBlock(document, {
          name: "Columns",
          cells: [[[accLeftClone], [accRightClone]]]
        });
        accLeft.before(accBlock);
        accLeft.remove();
        accRight.remove();
      }
      const allParagraphs = element.querySelectorAll("p");
      let refCodeP = null;
      let pageNumP = null;
      allParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (/^AHA\d{4}/.test(text)) refCodeP = p;
        if (/^ページ番号/.test(text)) pageNumP = p;
      });
      let refBlock = null;
      if (refCodeP && pageNumP) {
        const cells = [[
          [refCodeP.cloneNode(true)],
          [pageNumP.cloneNode(true)]
        ]];
        refBlock = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        refCodeP.replaceWith(refBlock);
        pageNumP.remove();
      } else if (pageNumP && !refCodeP) {
        const cells = [[
          [""],
          [pageNumP.cloneNode(true)]
        ]];
        refBlock = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        pageNumP.replaceWith(refBlock);
      }
      const allH2 = Array.from(element.querySelectorAll("h2"));
      const allTables = Array.from(element.querySelectorAll("table"));
      let grayBoxTable = null;
      allTables.forEach((t) => {
        const th = t.querySelector("th");
        if (th && th.textContent.includes("gray-box")) grayBoxTable = t;
      });
      const breakPoints = [];
      for (let i = 1; i < allH2.length; i++) {
        breakPoints.push(allH2[i]);
      }
      if (grayBoxTable) {
        const prevSibling = grayBoxTable.previousElementSibling;
        const isAfterH2 = prevSibling && prevSibling.tagName === "HR";
        if (!isAfterH2) {
          breakPoints.push(grayBoxTable);
        }
      }
      if (refBlock) {
        breakPoints.push(refBlock);
      }
      breakPoints.sort((a, b) => {
        const pos = a.compareDocumentPosition(b);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      breakPoints.forEach((bp) => {
        bp.before(createNarrowMeta(document));
        bp.before(document.createElement("hr"));
      });
      if (refBlock) {
        refBlock.after(createNarrowMeta(document));
      } else {
        element.appendChild(createNarrowMeta(document));
      }
      const firstH1 = element.querySelector("h1");
      if (firstH1) {
        const hr = document.createElement("hr");
        firstH1.after(hr);
      }
    }
  }

  // tools/importer/import-americanhome-subpage.js
  var parsers = {
    "columns": parse,
    "columns-gray-box": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "americanhome-subpage",
    description: "Interior subpage with blue H1 banner, service cards, columns blocks, and contact sections for policyholder information",
    urls: [
      "https://www.americanhome.co.jp/home/customers",
      "https://www.americanhome.co.jp/home/customers/deduction",
      "https://www.americanhome.co.jp/home/customers/claim"
    ],
    blocks: [
      {
        name: "columns",
        instances: [
          ".container:has(> .cmp-container > .aem-Grid > .image.thirdwidth)",
          ".container.halfwidth.nobottomspace.notopspace:has(.teaserflex + .image)",
          ".container.quarterwidth + .container.threequarterwidth"
        ]
      },
      {
        name: "columns-bordered",
        instances: [
          ".halfwidth.paleblueborder.completeborder"
        ]
      },
      {
        name: "columns-gray-box",
        instances: [
          ".container.aiglightgray.completeborder"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_americanhome_subpage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
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
          tdVal.textContent = "subpage";
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
  return __toCommonJS(import_americanhome_subpage_exports);
})();
