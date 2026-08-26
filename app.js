<script>
/* =====================================================
   VALERIA BOOKS - INDEX APP
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const categoryButtons = document.querySelectorAll(".category-card");
const bookCards = document.querySelectorAll(".book-card");
const navItems = document.querySelectorAll(".nav-item");

const searchButtons = document.querySelectorAll(
  '.icon-button, .nav-item:nth-child(3)'
);

const shopButtons = document.querySelectorAll(
  '.product-card button, .nav-item:nth-child(4)'
);

const premiumButtons = document.querySelectorAll(
  '.premium-main-button, .premium-button'
);


/* =====================================================
   DADOS DOS LIVROS
===================================================== */

const books = [
  {
    id: "olympia",
    title: "Die Olympischen Spiele",
    series: "Kapitän Kapita",
    category: "kinder",
    genres: ["kinder", "abenteuer"],
    status: "free",
    url: "flipbook.html"
  },

  {
    id: "enceladus",
    title: "In Enceladus",
    series: "Kapitän Kapita",
    category: "kinder",
    genres: ["kinder", "abenteuer"],
    status: "premium",
    url: "flipbuch2.html"
  },

  {
    id: "eisriesen",
    title: "Die Eisriesen",
    series: "Kapitän Kapita",
    category: "kinder",
    genres: ["kinder", "abenteuer"],
    status: "soon",
    url: ""
  },

  {
    id: "dunkle-zone",
    title: "Die Dunkle Zone",
    series: "Kapitän Kapita",
    category: "kinder",
    genres: ["kinder", "abenteuer"],
    status: "soon",
    url: ""
  },

  {
    id: "zurueck-erde",
    title: "Zurück zur Erde",
    series: "Kapitän Kapita",
    category: "kinder",
    genres: ["kinder", "abenteuer"],
    status: "soon",
    url: ""
  }
];


/* =====================================================
   PROGRESSO DE LEITURA
===================================================== */

const readingProgress = {
  olympia: {
    storageKey: "kapitaOlympiaPage"
  },

  enceladus: {
    storageKey: "kapitaEnceladusPage"
  }
};


/* =====================================================
   CONTINUE LENDO
===================================================== */

function loadContinueReading() {

  const continueSection =
    document.querySelector(".continue-section");

  if (!continueSection) return;


  const enceladusProgress =
    localStorage.getItem(
      readingProgress.enceladus.storageKey
    );


  const olympiaProgress =
    localStorage.getItem(
      readingProgress.olympia.storageKey
    );


  let selectedBook = null;
  let savedPage = 0;


  if (enceladusProgress !== null) {

    selectedBook =
      books.find(book => book.id === "enceladus");

    savedPage =
      Number(enceladusProgress);

  }

  else if (olympiaProgress !== null) {

    selectedBook =
      books.find(book => book.id === "olympia");

    savedPage =
      Number(olympiaProgress);

  }


  if (!selectedBook) {

    return;

  }


  const title =
    continueSection.querySelector("h3");

  const subtitle =
    continueSection.querySelector("p");

  const button =
    continueSection.querySelector(".continue-button");

  const progress =
    continueSection.querySelector(".progress");

  const progressText =
    continueSection.querySelector(".progress-text");


  if (title) {
    title.textContent =
      selectedBook.series;
  }


  if (subtitle) {
    subtitle.textContent =
      selectedBook.title;
  }


  if (button) {
    button.href =
      selectedBook.url;
  }


  /*
    Como ainda não sabemos exatamente
    quantas páginas cada livro terá,
    usamos uma estimativa.
  */

  const estimatedPages = 30;

  const percentage =
    Math.min(
      100,
      Math.round(
        ((savedPage + 1) / estimatedPages) * 100
      )
    );


  if (progress) {
    progress.style.width =
      `${percentage}%`;
  }


  if (progressText) {
    progressText.textContent =
      `Seite ${savedPage + 1}`;
  }

}



/* =====================================================
   FILTRO POR CATEGORIA
===================================================== */

categoryButtons.forEach(button => {

  button.addEventListener("click", () => {

    categoryButtons.forEach(btn => {
      btn.classList.remove("active");
    });


    button.classList.add("active");


    const category =
      button.textContent
        .trim()
        .toLowerCase();


    if (
      category.includes("alle")
    ) {

      showAllBooks();
      return;

    }


    if (
      category.includes("kinder")
    ) {

      filterBooks("kinder");
      return;

    }


    if (
      category.includes("fantasy")
    ) {

      filterBooks("fantasy");
      return;

    }


    if (
      category.includes("romantik")
    ) {

      filterBooks("romantik");
      return;

    }


    if (
      category.includes("abenteuer")
    ) {

      filterBooks("abenteuer");
      return;

    }

  });

});


function filterBooks(category) {

  bookCards.forEach((card, index) => {

    const book =
      books[index];


    if (!book) {
      return;
    }


    if (
      book.genres.includes(category)
    ) {

      card.style.display = "";

    }

    else {

      card.style.display = "none";

    }

  });

}


function showAllBooks() {

  bookCards.forEach(card => {

    card.style.display = "";

  });

}



/* =====================================================
   BUSCA
===================================================== */

function openSearch() {

  const existingOverlay =
    document.getElementById("searchOverlay");


  if (existingOverlay) {

    existingOverlay.remove();

  }


  const overlay =
    document.createElement("div");


  overlay.id =
    "searchOverlay";


  overlay.innerHTML = `
    <div class="search-modal">

      <div class="search-top">

        <h2>Bücher suchen</h2>

        <button
          id="closeSearch"
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


      <div id="searchResults">
      </div>

    </div>
  `;


  document.body.appendChild(overlay);


  const input =
    document.getElementById(
      "bookSearchInput"
    );


  const results =
    document.getElementById(
      "searchResults"
    );


  const closeButton =
    document.getElementById(
      "closeSearch"
    );


  input.focus();


  renderSearchResults(
    books,
    results
  );


  input.addEventListener(
    "input",
    () => {

      const query =
        input.value
          .trim()
          .toLowerCase();


      const filtered =
        books.filter(book => {

          return (

            book.title
              .toLowerCase()
              .includes(query)

            ||

            book.series
              .toLowerCase()
              .includes(query)

            ||

            book.genres
              .join(" ")
              .includes(query)

          );

        });


      renderSearchResults(
        filtered,
        results
      );

    }
  );


  closeButton.addEventListener(
    "click",
    () => {

      overlay.remove();

    }
  );


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target === overlay
      ) {

        overlay.remove();

      }

    }
  );

}



/* =====================================================
   RESULTADO DA BUSCA
===================================================== */

function renderSearchResults(
  list,
  container
) {

  container.innerHTML = "";


  if (
    list.length === 0
  ) {

    container.innerHTML = `
      <p class="no-results">
        Keine Bücher gefunden.
      </p>
    `;

    return;

  }


  list.forEach(book => {

    const item =
      document.createElement("button");


    item.className =
      "search-result-item";


    let badge = "";


    if (
      book.status === "free"
    ) {

      badge =
        "Kostenlos";

    }


    if (
      book.status === "premium"
    ) {

      badge =
        "👑 Premium";

    }


    if (
      book.status === "soon"
    ) {

      badge =
        "Demnächst";

    }


    item.innerHTML = `

      <div>

        <strong>
          ${book.title}
        </strong>

        <span>
          ${book.series}
        </span>

      </div>

      <small>
        ${badge}
      </small>
    `;


    item.addEventListener(
      "click",
      () => {

        handleBookOpen(book);

      }
    );


    container.appendChild(item);

  });

}



/* =====================================================
   ABRIR LIVRO
===================================================== */

function handleBookOpen(book) {

  if (
    book.status === "soon"
  ) {

    showMessage(
      "Dieses Buch ist noch nicht verfügbar."
    );

    return;

  }


  if (
    book.status === "premium"
  ) {

    const premium =
      localStorage.getItem(
        "valeriaBooksPremium"
      );


    if (
      premium !== "true"
    ) {

      openPremiumModal();

      return;

    }

  }


  window.location.href =
    book.url;

}



/* =====================================================
   LIVROS PREMIUM
===================================================== */

document
  .querySelectorAll(".premium-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        const premium =
          localStorage.getItem(
            "valeriaBooksPremium"
          );


        if (
          premium !== "true"
        ) {

          event.preventDefault();

          openPremiumModal();

        }

      }
    );

  });



/* =====================================================
   MODAL PREMIUM
===================================================== */

function openPremiumModal() {

  const existing =
    document.getElementById(
      "premiumOverlay"
    );


  if (existing) {
    existing.remove();
  }


  const overlay =
    document.createElement("div");


  overlay.id =
    "premiumOverlay";


  overlay.innerHTML = `

    <div class="premium-modal">

      <button
        class="modal-close"
        id="closePremium"
      >
        ✕
      </button>


      <div class="premium-modal-icon">
        👑
      </div>


      <span class="premium-small">
        VALERIA BOOKS PREMIUM
      </span>


      <h2>
        Alle Geschichten entdecken
      </h2>


      <p>
        Mit der Jahresmitgliedschaft erhältst du
        Zugang zu exklusiven Büchern,
        Hörgeschichten, Videos und neuen
        Veröffentlichungen.
      </p>


      <div class="premium-features">

        <div>
          ✓ Premium-Bücher lesen
        </div>

        <div>
          ✓ Hörgeschichten
        </div>

        <div>
          ✓ Videos und Extras
        </div>

        <div>
          ✓ Neue Geschichten
        </div>

      </div>


      <button
        class="premium-subscribe-button"
        id="subscribePremium"
      >
        Jahresabo entdecken
      </button>


      <small>
        Die Bezahlung wird später aktiviert.
      </small>

    </div>
  `;


  document.body.appendChild(overlay);


  document
    .getElementById(
      "closePremium"
    )
    .addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );


  document
    .getElementById(
      "subscribePremium"
    )
    .addEventListener(
      "click",
      () => {

        showMessage(
          "Die Premium-Mitgliedschaft wird bald verfügbar sein."
        );

      }
    );

}



/* =====================================================
   BOTÃO PREMIUM DA HOME
===================================================== */

document
  .querySelectorAll(
    ".premium-main-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openPremiumModal();

      }
    );

  });



/* =====================================================
   LOJA
===================================================== */

function openShop() {

  const shopSection =
    document.querySelector(
      ".shop-section"
    );


  if (!shopSection) {
    return;
  }


  shopSection.scrollIntoView({
    behavior: "smooth"
  });


  setActiveNavigation(
    "shop"
  );

}


shopButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      openShop();

    }
  );

});



/* =====================================================
   BUSCA - BOTÕES
===================================================== */

searchButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      openSearch();

    }
  );

});



/* =====================================================
   MENU INFERIOR
===================================================== */

navItems.forEach(item => {

  item.addEventListener(
    "click",
    () => {

      navItems.forEach(nav => {

        nav.classList.remove(
          "active"
        );

      });


      item.classList.add(
        "active"
      );

    }
  );

});


function setActiveNavigation(type) {

  navItems.forEach(item => {

    item.classList.remove(
      "active"
    );

  });


  if (
    type === "shop" &&
    navItems[3]
  ) {

    navItems[3]
      .classList
      .add("active");

  }

}



/* =====================================================
   MENSAGEM
===================================================== */

function showMessage(message) {

  const oldMessage =
    document.querySelector(
      ".app-message"
    );


  if (oldMessage) {
    oldMessage.remove();
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "app-message";


  toast.textContent =
    message;


  document.body.appendChild(
    toast
  );


  requestAnimationFrame(
    () => {

      toast.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );


      setTimeout(
        () => toast.remove(),
        300
      );

    },
    3000
  );

}



/* =====================================================
   INICIAR APP
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadContinueReading();

  }
);

</script>