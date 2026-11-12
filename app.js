/* VALERIA BOOKS — INTERAÇÕES */

const menuButton = document.querySelector('[data-action="toggle-menu"]');
const closeMenuButton = document.querySelector('[data-action="close-menu"]');
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");

function openMenu() {
  if (!sideMenu || !menuBackdrop) return;
  sideMenu.hidden = false;
  menuBackdrop.hidden = false;
  requestAnimationFrame(() => sideMenu.classList.add("is-open"));
  sideMenu.setAttribute("aria-hidden", "false");
  menuButton?.setAttribute("aria-expanded", "true");
  menuButton?.setAttribute("aria-label", "Menü schließen");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  if (!sideMenu || !menuBackdrop) return;
  sideMenu.classList.remove("is-open");
  sideMenu.setAttribute("aria-hidden", "true");
  menuBackdrop.hidden = true;
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Menü öffnen");
  document.body.classList.remove("menu-open");
  window.setTimeout(() => {
    if (!sideMenu.classList.contains("is-open")) sideMenu.hidden = true;
  }, 240);
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (isOpen) closeMenu();
  else openMenu();
});

closeMenuButton?.addEventListener("click", closeMenu);
menuBackdrop?.addEventListener("click", closeMenu);
sideMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

/* BANNER */
function initBannerCarousel() {
  const carousel = document.querySelector("[data-banner-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-banner-slide]")];
  const indicators = [...carousel.querySelectorAll("[data-banner-to]")];
  const previousButton = carousel.querySelector("[data-banner-previous]");
  const nextButton = carousel.querySelector("[data-banner-next]");
  if (slides.length < 2) return;

  let activeIndex = 0;
  let timerId;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === activeIndex;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    indicators.forEach((button, i) => {
      const active = i === activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function startTimer() {
    window.clearInterval(timerId);
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      timerId = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
  }

  previousButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startTimer();
  });
  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startTimer();
  });
  indicators.forEach((button, i) => button.addEventListener("click", () => {
    showSlide(i);
    startTimer();
  }));

  carousel.addEventListener("mouseenter", () => window.clearInterval(timerId));
  carousel.addEventListener("mouseleave", startTimer);
  carousel.addEventListener("focusin", () => window.clearInterval(timerId));
  carousel.addEventListener("focusout", startTimer);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearInterval(timerId);
    else startTimer();
  });

  showSlide(0);
  startTimer();
}

/* PRÉVIA DO LIVRO IN ENCELADUS */
function openEnceladusPreview() {
  document.getElementById("previewOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "previewOverlay";
  overlay.innerHTML = `
    <div class="preview-modal" role="dialog" aria-modal="true" aria-labelledby="previewTitle">
      <div class="search-top">
        <h2 id="previewTitle">In Enceladus</h2>
        <button type="button" data-close-preview aria-label="Schließen">✕</button>
      </div>
      <img class="preview-cover" src="img/file_000000001e9c8210babea2265572063b.png" alt="Kapitänin Kapita – In Enceladus">
      <p>Vorschau</p>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("[data-close-preview]").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.remove();
  });
}

document.querySelectorAll('[data-action="enceladus-preview"]').forEach(button => {
  button.addEventListener("click", openEnceladusPreview);
});

/* BUSCA */
function getBooksFromPage() {
  return [...document.querySelectorAll(".book-card")].map(card => ({
    id: card.dataset.book || "",
    title: card.querySelector("h3")?.textContent.trim() || card.querySelector("img")?.alt || "Buch",
    series: card.querySelector(".book-series")?.textContent.trim() || "",
    genres: card.dataset.genres || "",
    status: card.dataset.status || (card.querySelector(".book-badge.free") ? "available" : "soon"),
    url: card.querySelector("a.book-button[href]")?.getAttribute("href") || "",
    preview: card.dataset.book === "enceladus"
  }));
}

function showMessage(message) {
  document.querySelector(".app-message")?.remove();
  const toast = document.createElement("div");
  toast.className = "app-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function openBook(book) {
  if (book.preview) {
    openEnceladusPreview();
    return;
  }
  if (book.url) {
    window.location.href = book.url;
    return;
  }
  showMessage("Dieses Buch ist noch nicht verfügbar.");
}

function openSearch() {
  closeMenu();
  document.getElementById("searchOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "searchOverlay";
  overlay.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-labelledby="searchTitle">
      <div class="search-top">
        <h2 id="searchTitle">Bücher suchen</h2>
        <button type="button" data-close-search aria-label="Schließen">✕</button>
      </div>
      <input type="search" data-book-search placeholder="Titel oder Kategorie suchen..." autocomplete="off">
      <div data-search-results></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("[data-book-search]");
  const results = overlay.querySelector("[data-search-results]");
  const allBooks = getBooksFromPage();

  function renderResults(query = "") {
    const normalized = query.trim().toLocaleLowerCase("de");
    const matches = allBooks.filter(book =>
      `${book.title} ${book.series} ${book.genres}`.toLocaleLowerCase("de").includes(normalized)
    );
    results.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "no-results";
      empty.textContent = "Keine Bücher gefunden.";
      results.appendChild(empty);
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
      series.textContent = book.series || book.genres;
      info.append(title, series);
      const status = document.createElement("small");
      status.textContent = book.status === "available" ? "Kostenlos" : "Demnächst";
      item.append(info, status);
      item.addEventListener("click", () => {
        overlay.remove();
        openBook(book);
      });
      results.appendChild(item);
    });
  }

  input.addEventListener("input", () => renderResults(input.value));
  overlay.querySelector("[data-close-search]").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.remove();
  });
  renderResults();
  input.focus();
}

document.querySelectorAll('[data-action="search"]').forEach(button => {
  button.addEventListener("click", openSearch);
});

/* NAVEGAÇÃO INFERIOR */
const bottomNavItems = document.querySelectorAll(".bottom-nav .nav-item");
bottomNavItems.forEach(item => {
  item.addEventListener("click", () => {
    bottomNavItems.forEach(navItem => navItem.classList.remove("active"));
    item.classList.add("active");
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMenu();
    document.getElementById("searchOverlay")?.remove();
    document.getElementById("previewOverlay")?.remove();
  }
});

initBannerCarousel();