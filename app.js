/* =====================================================
   VALERIA BOOKS — APP.JS
===================================================== */

const books = [
  {
    id: "olympia",
    title: "Die Olympischen Spiele",
    series: "Kapitän Kapita",
    genres: ["abenteuer"],
    status: "available",
    url: "olympiade.html"
  },
  {
    id: "enceladus",
    title: "In Enceladus",
    series: "Kapitän Kapita",
    genres: ["abenteuer"],
    status: "soon",
    preview: true
  },
  {
    id: "eisriesen",
    title: "Die Eisriesen",
    series: "Kapitän Kapita",
    genres: ["abenteuer"],
    status: "soon"
  },
  {
    id: "dunkle-zone",
    title: "Die Dunkle Zone",
    series: "Kapitän Kapita",
    genres: ["abenteuer"],
    status: "soon"
  },
  {
    id: "zurueck-erde",
    title: "Zurück zur Erde",
    series: "Kapitän Kapita",
    genres: ["abenteuer"],
    status: "soon"
  }
];

const categoryButtons = document.querySelectorAll(".category-card");
const bookCards = document.querySelectorAll(".book-card");
const bookSections = document.querySelectorAll("[data-section-category]");
const navItems = document.querySelectorAll(".nav-item");

/* =====================================================
   CARROSSEL AUTOMÁTICO DO BANNER
===================================================== */

function initBannerCarousel() {
  const carousel = document.querySelector("[data-banner-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-banner-slide]")];
  const indicators = [...carousel.querySelectorAll("[data-banner-to]")];
  const previousButton = carousel.querySelector("[data-banner-previous]");
  const nextButton = carousel.querySelector("[data-banner-next]");

  if (slides.length === 0) return;

  let activeIndex = 0;
  let timerId;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;

      slide.hidden = !isActive;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === activeIndex;

      indicator.classList.toggle("is-active", isActive);
      indicator.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function stopAutomaticChange() {
    window.clearInterval(timerId);
  }

  function startAutomaticChange() {
    stopAutomaticChange();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (slides.length > 1 && !reducedMotion) {
      timerId = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5000);
    }
  }

  previousButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutomaticChange();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutomaticChange();
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
      startAutomaticChange();
    });
  });

  carousel.addEventListener("mouseenter", stopAutomaticChange);
  carousel.addEventListener("mouseleave", startAutomaticChange);
  carousel.addEventListener("focusin", stopAutomaticChange);
  carousel.addEventListener("focusout", startAutomaticChange);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutomaticChange();
    } else {
      startAutomaticChange();
    }
  });

  showSlide(0);
  startAutomaticChange();
}

/* =====================================================
   MENSAGENS
===================================================== */

function showMessage(message) {
  document.querySelector(".app-message")?.remove();

  const toast = document.createElement("div");
  toast.className = "app-message";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* =====================================================
   PRÉVIA DE ENCÉLADO
===================================================== */

function openEnceladusPreview() {
  document.getElementById("previewOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "previewOverlay";

  overlay.innerHTML = `
    <div
      class="preview-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="previewTitle"
    >
      <div class="search-top">
        <h2 id="previewTitle">In Enceladus</h2>
        <button
          id="closePreview"
          type="button"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>

      <img
        class="preview-cover"
        src="img/file_000000001e9c8210babea2265572063b.png"
        alt="Kapitän Kapita – In Enceladus"
      >

      <p>Vorschau</p>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay
    .querySelector("#closePreview")
    .addEventListener("click", () => overlay.remove());

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  function closeOnEscape(event) {
    if (event.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeOnEscape);
    }
  }

  document.addEventListener("keydown", closeOnEscape);
}

document
  .querySelectorAll('[data-action="enceladus-preview"]')
  .forEach(button => {
    button.addEventListener("click", openEnceladusPreview);
  });

/* =====================================================
   CATEGORIAS
===================================================== */

function setActiveCategory(category) {
  categoryButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });
}

function showAllBooks() {
  bookSections.forEach(section => {
    section.hidden = false;
  });

  bookCards.forEach(card => {
    card.hidden = false;
  });

  setActiveCategory("alle");
}

function filterByCategory(category) {
  if (category === "alle") {
    showAllBooks();
    return;
  }

  bookSections.forEach(section => {
    section.hidden = section.dataset.sectionCategory !== category;
  });

  bookCards.forEach(card => {
    const genres = (card.dataset.genres || "").split(/\s+/);
    card.hidden = !genres.includes(category);
  });

  setActiveCategory(category);
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterByCategory(button.dataset.category);
  });
});

document
  .querySelector('[data-action="show-all-books"]')
  ?.addEventListener("click", showAllBooks);

/* =====================================================
   BUSCA E ABERTURA DOS LIVROS
===================================================== */

function openBook(book) {
  if (book.id === "enceladus" && book.preview) {
    openEnceladusPreview();
    return;
  }

  if (book.status === "available" && book.url) {
    window.location.href = book.url;
    return;
  }

  showMessage("Dieses Buch ist noch nicht verfügbar.");
}

function closeOverlay(overlay) {
  overlay?.remove();
}

function openSearch() {
  document.getElementById("searchOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "searchOverlay";

  overlay.innerHTML = `
    <div
      class="search-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="searchTitle"
    >
      <div class="search-top">
        <h2 id="searchTitle">Bücher suchen</h2>

        <button
          id="closeSearch"
          type="button"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>

      <input
        type="search"
        id="bookSearchInput"
        placeholder="Titel oder Kategorie suchen..."
        autocomplete="off"
      >

      <div id="searchResults"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = overlay.querySelector("#bookSearchInput");
  const results = overlay.querySelector("#searchResults");

  function renderResults(query = "") {
    const normalizedQuery = query.trim().toLowerCase();

    const matches = books.filter(book => {
      const searchableText = [
        book.title,
        book.series,
        ...book.genres
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    results.replaceChildren();

    if (matches.length === 0) {
      const message = document.createElement("p");
      message.className = "no-results";
      message.textContent = "Keine Bücher gefunden.";
      results.appendChild(message);
      return;
    }

    matches.forEach(book => {
      const item = document.createElement("button");
      item.className = "search-result-item";
      item.type = "button";

      const info = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = book.title;

      const series = document.createElement("span");
      series.textContent = book.series;

      info.append(title, series);

      const status = document.createElement("small");
      status.textContent =
        book.status === "available" ? "Kostenlos" : "Demnächst";

      item.append(info, status);

      item.addEventListener("click", () => {
        closeOverlay(overlay);
        openBook(book);
      });

      results.appendChild(item);
    });
  }

  input.addEventListener("input", () => {
    renderResults(input.value);
  });

  overlay
    .querySelector("#closeSearch")
    .addEventListener("click", () => closeOverlay(overlay));

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeOverlay(overlay);
    }
  });

  renderResults();
  input.focus();
}

document
  .querySelectorAll('[data-action="search"]')
  .forEach(button => {
    button.addEventListener("click", openSearch);
  });

/* =====================================================
   NAVEGAÇÃO INFERIOR
===================================================== */

navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(navItem => {
      navItem.classList.remove("active");
    });

    item.classList.add("active");
  });
});

/* Inicia o carrossel */
initBannerCarousel();
