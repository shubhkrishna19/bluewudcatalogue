const PRODUCTS_PER_BOOK_PAGE = 4;
const PRODUCTS_PER_PRINT_PAGE = 7;

const state = {
  data: null,
  mode: "book",
  query: "",
  category: "all",
  pageIndex: 0,
  controlsOpen: false,
  loading: true,
  error: "",
};

const app = document.querySelector("#app");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const chunk = (items, size) => {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
};

const getCategoryKey = (category) => String(category || "").trim().toLowerCase();

const getFilteredProducts = () => {
  const { products } = state.data;
  const query = state.query.trim().toLowerCase();
  const category = state.category;

  return products.filter((product) => {
    const matchesCategory = category === "all" || getCategoryKey(product.category) === category;
    const matchesQuery = !query || product.searchText.includes(query);
    return matchesCategory && matchesQuery;
  });
};

const buildBookPages = (products) => {
  const productPages = chunk(products, PRODUCTS_PER_BOOK_PAGE).map((items, index) => ({
    type: "products",
    number: index + 1,
    items,
  }));

  return [
    { type: "cover" },
    ...productPages,
    { type: "back" },
  ];
};

const buildPrintPages = (products) => [
  { type: "cover" },
  ...chunk(products, PRODUCTS_PER_PRINT_PAGE).map((items, index) => ({
    type: "products",
    number: index + 1,
    items,
  })),
  { type: "back" },
];

const getVisibleBookPages = (pages) => {
  if (pages.length <= 1) return pages;
  const lastIndex = pages.length - 1;
  if (state.pageIndex === 0 || state.pageIndex === lastIndex) {
    return [pages[state.pageIndex]];
  }

  const first = state.pageIndex % 2 === 1 ? state.pageIndex : state.pageIndex - 1;
  return [pages[first], pages[first + 1]].filter(Boolean);
};

const setPage = (nextIndex, pagesLength) => {
  state.pageIndex = Math.max(0, Math.min(nextIndex, pagesLength - 1));
  render();
};

const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen request failed", error);
  }
};

const resetToFirstContentPage = () => {
  state.pageIndex = 1;
};

const renderProductCard = (product) => `
  <article class="product-card" data-product-id="${escapeHtml(product.id)}">
    <a class="product-image-link" href="${escapeHtml(product.websiteUrl)}" target="_blank" rel="noreferrer">
      ${
        product.imageUrl
          ? `<img class="product-image" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.itemName)}" loading="lazy" />`
          : `<span class="image-placeholder">No image</span>`
      }
    </a>
    <div class="product-copy">
      <div class="product-category">${escapeHtml(product.category)}</div>
      <h3>${escapeHtml(product.itemName)}</h3>
      <p class="product-sku">${escapeHtml(product.skuColors).replaceAll("\n", "<br />")}</p>
      <p class="product-dimensions">${escapeHtml(product.dimensionWeight).replaceAll("\n", "<br />")}</p>
    </div>
    <div class="price-stack" aria-label="Prices">
      <div><span>MRP</span><strong>${escapeHtml(product.mrp)}</strong></div>
      <div><span>CHP</span><strong>${escapeHtml(product.chp)}</strong></div>
    </div>
    <a class="qr-link" href="${escapeHtml(product.websiteUrl)}" target="_blank" rel="noreferrer" aria-label="Open product page">
      ${
        product.qrUrl
          ? `<img src="${escapeHtml(product.qrUrl)}" alt="QR for ${escapeHtml(product.itemName)}" loading="lazy" />`
          : ""
      }
    </a>
  </article>
`;

const renderPrintRow = (product) => `
  <tr>
    <td class="print-image-cell">
      ${
        product.imageUrl
          ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.itemName)}" />`
          : ""
      }
    </td>
    <td>${escapeHtml(product.category)}</td>
    <td class="print-name">${escapeHtml(product.itemName)}</td>
    <td>${escapeHtml(product.skuColors).replaceAll("\n", "<br />")}</td>
    <td>${escapeHtml(product.dimensionWeight).replaceAll("\n", "<br />")}</td>
    <td>${escapeHtml(product.weight)}</td>
    <td>${escapeHtml(product.mrp)}</td>
    <td>${escapeHtml(product.chp)}</td>
    <td class="print-qr-cell">
      ${
        product.qrUrl
          ? `<img src="${escapeHtml(product.qrUrl)}" alt="QR for ${escapeHtml(product.itemName)}" />`
          : ""
      }
    </td>
  </tr>
`;

const renderCataloguePage = (page, meta, variant = "book") => {
  if (page.type === "cover") {
    return `
      <section class="catalogue-page image-page ${variant === "print" ? "print-page" : ""}">
        <img src="${escapeHtml(meta.coverImage)}" alt="Catalogue front page" />
      </section>
    `;
  }

  if (page.type === "back") {
    return `
      <section class="catalogue-page image-page ${variant === "print" ? "print-page" : ""}">
        <img src="${escapeHtml(meta.backImage)}" alt="Catalogue last page" />
      </section>
    `;
  }

  if (variant === "print") {
    return `
      <section class="print-page print-product-page">
        <header class="print-page-header">
          <img src="${escapeHtml(meta.logoImage)}" alt="Bluewud" />
          <div>
            <strong>CHP Price Catalogue</strong>
            <span>Page ${page.number}</span>
          </div>
        </header>
        <table class="print-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category</th>
              <th>Item Name</th>
              <th>SKUs | Colors</th>
              <th>Dimension (cm)<br />Weight (kgs)</th>
              <th>Weight<br />(Kgs)</th>
              <th>MRP</th>
              <th>CHP</th>
              <th>More Info</th>
            </tr>
          </thead>
          <tbody>${page.items.map(renderPrintRow).join("")}</tbody>
        </table>
      </section>
    `;
  }

  return `
    <section class="catalogue-page product-page">
      <header class="page-header">
        <img src="${escapeHtml(meta.logoImage)}" alt="Bluewud" />
        <div>
          <span>CHP Price Catalogue</span>
          <strong>Page ${page.number}</strong>
        </div>
      </header>
      <div class="product-grid">
        ${page.items.map(renderProductCard).join("")}
      </div>
    </section>
  `;
};

const renderToolbar = (products, pages) => {
  const { meta, categories } = state.data;
  const categoryOptions = [
    `<option value="all">All categories</option>`,
    ...categories.map(
      (category) =>
        `<option value="${escapeHtml(getCategoryKey(category.label))}" ${
          state.category === getCategoryKey(category.label) ? "selected" : ""
        }>${escapeHtml(category.label)} (${category.count})</option>`
    ),
  ].join("");

  const generatedDate = new Date(meta.generatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <header class="viewer-rail">
      <div class="mini-brand">
        <img src="${escapeHtml(meta.logoImage)}" alt="Bluewud" />
        <div>
          <strong>CHP Catalogue</strong>
          <span>${products.length}/${meta.productCount} products</span>
        </div>
      </div>
      <div class="rail-actions">
        <button class="chip-button" data-action="mode-book" aria-pressed="${state.mode === "book"}">Flipbook</button>
        <button class="chip-button" data-action="mode-pdf" aria-pressed="${state.mode === "pdf"}">PDF</button>
        <button class="round-button" data-action="prev" ${state.pageIndex === 0 ? "disabled" : ""} aria-label="Previous page">&lt;</button>
        <span class="page-count">${Math.min(state.pageIndex + 1, pages.length)} / ${pages.length}</span>
        <button class="round-button" data-action="next" ${state.pageIndex >= pages.length - 1 ? "disabled" : ""} aria-label="Next page">&gt;</button>
        <button class="chip-button" data-action="toggle-controls" aria-expanded="${state.controlsOpen}">Search</button>
        <button class="chip-button" data-action="fullscreen">Fullscreen</button>
        <button class="chip-button primary" data-action="print">Download</button>
      </div>
    </header>

    <section class="controls-tray ${state.controlsOpen ? "open" : ""}" aria-label="Catalogue controls">
      <div class="tray-title">
        <strong>Find products</strong>
        <span>Updated ${generatedDate}</span>
      </div>
      <label class="search-control">
        <span>Search</span>
        <input type="search" value="${escapeHtml(state.query)}" placeholder="Product, SKU, category" data-field="query" />
      </label>
      <label class="select-control">
        <span>Category</span>
        <select data-field="category">${categoryOptions}</select>
      </label>
      <button class="button primary" data-action="toggle-controls">Apply</button>
    </section>
  `;
};

const renderBook = (products, pages) => `
  <main class="book-stage" aria-live="polite">
    <div class="book-spread ${getVisibleBookPages(pages).length === 1 ? "single" : ""}">
      ${getVisibleBookPages(pages).map((page) => renderCataloguePage(page, state.data.meta)).join("")}
    </div>
  </main>
`;

const renderPdfView = () => {
  const pages = buildPrintPages(state.data.products);
  return `
    <main class="pdf-stage">
      ${pages.map((page) => renderCataloguePage(page, state.data.meta, "print")).join("")}
    </main>
  `;
};

const renderPrintCatalogue = () => {
  const pages = buildPrintPages(state.data.products);
  return `
    <div class="print-catalogue">
      ${pages.map((page) => renderCataloguePage(page, state.data.meta, "print")).join("")}
    </div>
  `;
};

const render = () => {
  if (state.loading) {
    app.innerHTML = `<div class="boot-screen">Loading catalogue...</div>`;
    return;
  }

  if (state.error) {
    app.innerHTML = `<div class="boot-screen error">${escapeHtml(state.error)}</div>`;
    return;
  }

  const products = getFilteredProducts();
  const pages = buildBookPages(products);
  if (state.pageIndex >= pages.length) {
    state.pageIndex = Math.max(0, pages.length - 1);
  }

  app.innerHTML = `
    <div class="screen-shell ${state.controlsOpen ? "controls-open" : ""}">
      ${renderToolbar(products, pages)}
      ${state.mode === "book" ? renderBook(products, pages) : renderPdfView()}
    </div>
    ${renderPrintCatalogue()}
  `;

  bindEvents(pages);
};

const bindEvents = (pages) => {
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => {
      const action = node.getAttribute("data-action");
      if (action === "prev") setPage(state.pageIndex - 1, pages.length);
      if (action === "next") setPage(state.pageIndex + 1, pages.length);
      if (action === "mode-book") {
        state.mode = "book";
        render();
      }
      if (action === "mode-pdf") {
        state.mode = "pdf";
        render();
      }
      if (action === "toggle-controls") {
        state.controlsOpen = !state.controlsOpen;
        render();
      }
      if (action === "fullscreen") {
        toggleFullscreen();
      }
      if (action === "print") {
        window.print();
      }
    });
  });

  const queryInput = app.querySelector('[data-field="query"]');
  if (queryInput) {
    queryInput.addEventListener("input", (event) => {
      const cursorPosition = event.target.selectionStart;
      state.query = event.target.value;
      resetToFirstContentPage();
      render();
      requestAnimationFrame(() => {
        const freshInput = app.querySelector('[data-field="query"]');
        if (freshInput) {
          freshInput.focus();
          freshInput.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  const categorySelect = app.querySelector('[data-field="category"]');
  if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
      state.category = event.target.value;
      resetToFirstContentPage();
      render();
    });
  }

  document.onkeydown = (event) => {
    if (event.key === "ArrowLeft") setPage(state.pageIndex - 1, pages.length);
    if (event.key === "ArrowRight") setPage(state.pageIndex + 1, pages.length);
  };
};

fetch("data/catalogue.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`Could not load catalogue data (${response.status})`);
    return response.json();
  })
  .then((data) => {
    state.data = data;
    state.loading = false;
    render();
  })
  .catch((error) => {
    state.loading = false;
    state.error = error.message || "Could not load catalogue.";
    render();
  });
