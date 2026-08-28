/* =========================================================
   BOOK.JS
   Kapitänin Kapita – Leitor Digital
========================================================= */


/* =========================================================
   CONFIGURAÇÃO GERAL
========================================================= */

const flipbook =
  document.getElementById("flipbook");

const bookId =
  document.body.dataset.bookId || "book";

const progressKey =
  `${bookId}-page`;

const pages =
  document.querySelectorAll(".page");


/* =========================================================
   PAGE FLIP
========================================================= */

const pageFlip =
  new St.PageFlip(
    flipbook,
    {
      width: 400,
      height: 600,

      size: "stretch",

      minWidth: 300,
      maxWidth: 700,

      minHeight: 420,
      maxHeight: 1000,

      showCover: true,

      mobileScrollSupport: false,

      flippingTime: 900,

      usePortrait: true,

      startPage: 0,

      autoSize: true,

      maxShadowOpacity: 0.4,

      drawShadow: true,

      showPageCorners: true
    }
  );


pageFlip.loadFromHTML(pages);


/* =========================================================
   ELEMENTOS PRINCIPAIS
========================================================= */

const pageCounter =
  document.getElementById("pageCounter");

const audioButton =
  document.getElementById("audioButton");

const readingModeButton =
  document.getElementById("readingModeButton");

const nextPageButton =
  document.getElementById("nextPage");

const prevPageButton =
  document.getElementById("prevPage");

const fullscreenButton =
  document.getElementById("fullscreenButton");

const exitBookButton =
  document.getElementById("exitBookButton");


/* =========================================================
   MENU DE PÁGINAS
========================================================= */

const pageMenuButton =
  document.getElementById("pageMenuButton");

const pageMenu =
  document.getElementById("pageMenu");

const pageList =
  document.getElementById("pageList");

const closePageMenu =
  document.getElementById("closePageMenu");


/* =========================================================
   ÁUDIO
========================================================= */

let currentAudio = null;
let audioEnabled = false;


/* =========================================================
   PARAR ÁUDIO
========================================================= */

function stopAudio() {

  if (!currentAudio) {
    return;
  }

  currentAudio.pause();

  currentAudio.currentTime = 0;

  currentAudio = null;

}


/* =========================================================
   TOCAR ÁUDIO DA PÁGINA
========================================================= */

function playPageAudio(pageNumber) {

  stopAudio();


  if (!audioEnabled) {
    return;
  }


  const currentPage =
    pages[pageNumber];


  if (!currentPage) {
    return;
  }


  const audioSource =
    currentPage.dataset.audio;


  if (!audioSource) {
    return;
  }


  currentAudio =
    new Audio(audioSource);


  currentAudio
    .play()
    .catch(() => {

      console.log(
        "Der Browser hat die automatische Wiedergabe blockiert."
      );

    });

}


/* =========================================================
   BOTÃO DE ÁUDIO
========================================================= */

audioButton?.addEventListener(
  "click",
  () => {

    audioEnabled =
      !audioEnabled;


    if (audioEnabled) {

      audioButton.textContent =
        "🔊 Vorlesen an";

      audioButton.classList.add(
        "active"
      );


      playPageAudio(
        pageFlip.getCurrentPageIndex()
      );

    }

    else {

      audioButton.textContent =
        "🔇 Vorlesen aus";

      audioButton.classList.remove(
        "active"
      );


      stopAudio();

    }

  }
);


/* =========================================================
   VÍDEOS
========================================================= */

function stopVideos() {

  document
    .querySelectorAll("video")
    .forEach(video => {

      video.pause();

    });

}


/* =========================================================
   CONTADOR DE PÁGINAS
========================================================= */

function updatePageCounter(pageNumber) {

  if (!pageCounter) {
    return;
  }


  const totalPages =
    Math.max(
      pages.length - 1,
      0
    );


  /* CAPA */

  if (pageNumber === 0) {

    pageCounter.textContent =
      "Cover";

    return;

  }


  /* PÁGINAS INTERNAS */

  pageCounter.textContent =
    `Seite ${pageNumber} / ${totalPages}`;

}


/* =========================================================
   SALVAR PROGRESSO
========================================================= */

function saveProgress(pageNumber) {

  localStorage.setItem(
    progressKey,
    String(pageNumber)
  );

}


/* =========================================================
   RECUPERAR PROGRESSO
========================================================= */

function getSavedPage() {

  const savedPage =
    localStorage.getItem(
      progressKey
    );


  if (savedPage === null) {
    return 0;
  }


  const pageNumber =
    Number(savedPage);


  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 0 ||
    pageNumber >= pages.length
  ) {

    return 0;

  }


  return pageNumber;

}


/* =========================================================
   RESETAR ROLAGEM DA LEITURA
========================================================= */

function resetReadingScroll() {

  document
    .querySelectorAll(
      ".auto-scroll"
    )
    .forEach(area => {

      area.scrollTop = 0;

    });

}


/* =========================================================
   ATUALIZAR PÁGINA ATUAL NO MENU
========================================================= */

function updateCurrentPageSelection(
  pageNumber
) {

  document
    .querySelectorAll(
      ".page-select-button"
    )
    .forEach(button => {

      const buttonPage =
        Number(
          button.dataset.page
        );


      button.classList.toggle(
        "current",
        buttonPage === pageNumber
      );

    });

}


/* =========================================================
   MUDANÇA DE PÁGINA
========================================================= */

pageFlip.on(
  "flip",
  event => {

    const currentPage =
      event.data;


    stopAudio();

    stopVideos();


    if (audioEnabled) {

      playPageAudio(
        currentPage
      );

    }


    updatePageCounter(
      currentPage
    );


    updateCurrentPageSelection(
      currentPage
    );


    saveProgress(
      currentPage
    );


    resetReadingScroll();

  }
);


/* =========================================================
   NAVEGAÇÃO
========================================================= */

nextPageButton?.addEventListener(
  "click",
  () => {

    pageFlip.flipNext();

  }
);


prevPageButton?.addEventListener(
  "click",
  () => {

    pageFlip.flipPrev();

  }
);


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Se o menu lateral estiver aberto,
      Escape fecha o menu.
    */

    if (
      event.key === "Escape" &&
      pageMenu?.classList.contains("open")
    ) {

      closePageSelection();

      return;

    }


    /*
      Não muda de página enquanto
      o menu lateral estiver aberto.
    */

    if (
      pageMenu?.classList.contains("open")
    ) {
      return;
    }


    if (event.key === "ArrowRight") {

      pageFlip.flipNext();

    }


    if (event.key === "ArrowLeft") {

      pageFlip.flipPrev();

    }

  }
);


/* =========================================================
   TELA CHEIA
========================================================= */

fullscreenButton?.addEventListener(
  "click",
  async () => {

    try {

      if (!document.fullscreenElement) {

        await document
          .documentElement
          .requestFullscreen();

      }

      else {

        await document
          .exitFullscreen();

      }

    }

    catch (error) {

      console.log(
        "Vollbild nicht verfügbar.",
        error
      );

    }

  }
);


/* =========================================================
   MODO DE LEITURA
========================================================= */

let readingMode = false;


/* =========================================================
   PREPARAR TEXTO PARA LEITURA
========================================================= */

function prepareReadingText() {

  document
    .querySelectorAll(
      ".reading-text p"
    )
    .forEach(paragraph => {

      if (
        paragraph.dataset.prepared ===
        "true"
      ) {
        return;
      }


      const text =
        paragraph.textContent.trim();


      if (!text) {
        return;
      }


      const sentences =
        text.match(
          /[^.!?]+[.!?]+|[^.!?]+$/g
        );


      if (!sentences) {
        return;
      }


      paragraph.innerHTML = "";


      sentences.forEach(sentenceText => {

        const sentence =
          document.createElement("span");


        sentence.className =
          "reading-sentence";


        sentence.textContent =
          `${sentenceText.trim()} `;


        paragraph.appendChild(
          sentence
        );

      });


      paragraph.dataset.prepared =
        "true";

    });

}


prepareReadingText();


/* =========================================================
   LIGAR / DESLIGAR LESEMODUS
========================================================= */

readingModeButton?.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    readingMode =
      !readingMode;


    document.body.classList.toggle(
      "reading-mode",
      readingMode
    );


    if (readingMode) {

      readingModeButton.textContent =
        "📖 Lesemodus an";

      readingModeButton.classList.add(
        "active"
      );

    }

    else {

      readingModeButton.textContent =
        "📖 Lesemodus";

      readingModeButton.classList.remove(
        "active"
      );


      document
        .querySelectorAll(
          ".reading-sentence.reading-line"
        )
        .forEach(sentence => {

          sentence.classList.remove(
            "reading-line"
          );

        });

    }

  }
);


/* =========================================================
   SELECIONAR FRASE
========================================================= */

document.addEventListener(
  "pointerup",
  event => {

    if (!readingMode) {
      return;
    }


    const sentence =
      event.target.closest(
        ".reading-sentence"
      );


    if (!sentence) {
      return;
    }


    event.preventDefault();


    document
      .querySelectorAll(
        ".reading-sentence.reading-line"
      )
      .forEach(item => {

        item.classList.remove(
          "reading-line"
        );

      });


    sentence.classList.add(
      "reading-line"
    );

  },
  true
);


/* =========================================================
   EVITAR QUE PAGEFLIP ROUBE O TOQUE
   DURANTE O LESEMODUS
========================================================= */

document.addEventListener(
  "pointerdown",
  event => {

    if (!readingMode) {
      return;
    }


    const sentence =
      event.target.closest(
        ".reading-sentence"
      );


    if (!sentence) {
      return;
    }


    event.stopPropagation();

  },
  true
);


/* =========================================================
   ROLAGEM DO TEXTO
========================================================= */

const readingAreas =
  document.querySelectorAll(
    ".auto-scroll"
  );


readingAreas.forEach(area => {

  const readingContainer =
    area.closest(
      ".reading-text"
    );


  const topButton =
    readingContainer?.querySelector(
      ".scroll-top"
    );


  const upButton =
    readingContainer?.querySelector(
      ".scroll-up"
    );


  const downButton =
    readingContainer?.querySelector(
      ".scroll-down"
    );


  const pauseButton =
    readingContainer?.querySelector(
      ".scroll-pause"
    );


  const playButton =
    readingContainer?.querySelector(
      ".scroll-play"
    );


  let autoScrollTimer = null;
  let autoScrollEnabled = false;


  /* =======================================================
     EVITAR QUE PAGEFLIP ROUBE A ROLAGEM
  ======================================================= */

  [
    "pointerdown",
    "pointermove",
    "pointerup",
    "touchstart",
    "touchmove",
    "touchend",
    "mousedown",
    "mousemove",
    "mouseup"
  ].forEach(eventName => {

    area.addEventListener(
      eventName,
      event => {

        event.stopPropagation();

      },
      {
        passive: true
      }
    );

  });


  /* =======================================================
     BOTÕES DE ROLAGEM
  ======================================================= */

  readingContainer
    ?.querySelectorAll(
      ".scroll-btn"
    )
    .forEach(button => {

      [
        "pointerdown",
        "touchstart",
        "mousedown",
        "click"
      ].forEach(eventName => {

        button.addEventListener(
          eventName,
          event => {

            event.stopPropagation();

          }
        );

      });

    });


  /* =======================================================
     PARAR AUTO SCROLL
  ======================================================= */

  function stopAutoScroll() {

    autoScrollEnabled = false;


    if (!autoScrollTimer) {
      return;
    }


    clearInterval(
      autoScrollTimer
    );


    autoScrollTimer = null;

  }


  /* =======================================================
     INICIAR AUTO SCROLL
  ======================================================= */

  function startAutoScroll() {

    stopAutoScroll();


    autoScrollEnabled = true;


    autoScrollTimer =
      setInterval(
        () => {

          if (!autoScrollEnabled) {
            return;
          }


          const reachedBottom =
            area.scrollTop +
            area.clientHeight >=
            area.scrollHeight - 2;


          if (reachedBottom) {

            stopAutoScroll();

            return;

          }


          area.scrollTop += 1;

        },
        80
      );

  }


  /* =======================================================
     VOLTAR AO TOPO
  ======================================================= */

  topButton?.addEventListener(
    "click",
    () => {

      stopAutoScroll();


      area.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  /* =======================================================
     SUBIR
  ======================================================= */

  upButton?.addEventListener(
    "click",
    () => {

      stopAutoScroll();


      area.scrollBy({
        top: -180,
        behavior: "smooth"
      });

    }
  );


  /* =======================================================
     DESCER
  ======================================================= */

  downButton?.addEventListener(
    "click",
    () => {

      stopAutoScroll();


      area.scrollBy({
        top: 180,
        behavior: "smooth"
      });

    }
  );


  /* =======================================================
     PAUSAR
  ======================================================= */

  pauseButton?.addEventListener(
    "click",
    () => {

      stopAutoScroll();

    }
  );


  /* =======================================================
     CONTINUAR
  ======================================================= */

  playButton?.addEventListener(
    "click",
    () => {

      startAutoScroll();

    }
  );


  /* =======================================================
     ROLAGEM MANUAL
  ======================================================= */

  area.addEventListener(
    "wheel",
    () => {

      stopAutoScroll();

    },
    {
      passive: true
    }
  );


  area.addEventListener(
    "touchstart",
    () => {

      stopAutoScroll();

    },
    {
      passive: true
    }
  );

});


/* =========================================================
   SAIR DO LIVRO
========================================================= */

exitBookButton?.addEventListener(
  "click",
  () => {

    const exitUrl =
      exitBookButton.dataset.exitUrl ||
      "index.html";


    window.location.href =
      exitUrl;

  }
);


/* =========================================================
   CRIAR MINIATURAS DAS PÁGINAS
========================================================= */

function createPageThumbnails() {

  if (!pageList) {
    return;
  }


  pageList.innerHTML = "";


  pages.forEach(
    (page, index) => {

      /* ===================================================
         BOTÃO DA PÁGINA
      =================================================== */

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "page-select-button";


      button.dataset.page =
        String(index);


      /* ===================================================
         ÁREA DA MINIATURA
      =================================================== */

      const thumbnail =
        document.createElement(
          "div"
        );


      thumbnail.className =
        "page-thumbnail";


      /*
        Procura a primeira imagem
        existente dentro da página.
      */

      const pageImage =
        page.querySelector("img");


      if (pageImage) {

        const image =
          document.createElement(
            "img"
          );


        image.src =
          pageImage.src;


        image.alt =
          index === 0
            ? "Cover"
            : `Seite ${index}`;


        image.loading =
          "lazy";


        thumbnail.appendChild(
          image
        );

      }

      else {

        /* ===============================================
           PÁGINA SEM IMAGEM
        =============================================== */

        const placeholder =
          document.createElement(
            "div"
          );


        placeholder.className =
          "page-thumbnail-placeholder";


        const pageTitle =
          page.querySelector(
            "h2"
          );


        if (pageTitle) {

          placeholder.textContent =
            pageTitle.textContent.trim();

        }

        else if (index === 0) {

          placeholder.textContent =
            "Cover";

        }

        else {

          placeholder.textContent =
            `Seite ${index}`;

        }


        thumbnail.appendChild(
          placeholder
        );

      }


      /* ===================================================
         NOME DA PÁGINA
      =================================================== */

      const label =
        document.createElement(
          "span"
        );


      label.className =
        "page-thumbnail-label";


      if (index === 0) {

        label.textContent =
          "Cover";

      }

      else {

        label.textContent =
          `Seite ${index}`;

      }


      /* ===================================================
         MONTAR CARTÃO
      =================================================== */

      button.appendChild(
        thumbnail
      );


      button.appendChild(
        label
      );


      /* ===================================================
         ABRIR PÁGINA
      =================================================== */

      button.addEventListener(
        "click",
        () => {

          pageFlip.turnToPage(
            index
          );


          closePageSelection();

        }
      );


      pageList.appendChild(
        button
      );

    }
  );


  updateCurrentPageSelection(
    pageFlip.getCurrentPageIndex()
  );

}


/* =========================================================
   ABRIR MENU DE PÁGINAS
========================================================= */

function openPageSelection() {

  if (!pageMenu) {
    return;
  }


  pageMenu.classList.add(
    "open"
  );


  pageMenu.setAttribute(
    "aria-hidden",
    "false"
  );


  updateCurrentPageSelection(
    pageFlip.getCurrentPageIndex()
  );

}


/* =========================================================
   FECHAR MENU DE PÁGINAS
========================================================= */

function closePageSelection() {

  if (!pageMenu) {
    return;
  }


  pageMenu.classList.remove(
    "open"
  );


  pageMenu.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   BOTÃO SEITEN
========================================================= */

pageMenuButton?.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    openPageSelection();

  }
);


/* =========================================================
   BOTÃO FECHAR MENU
========================================================= */

closePageMenu?.addEventListener(
  "click",
  closePageSelection
);


/* =========================================================
   FECHAR TOCANDO FORA DO PAINEL
========================================================= */

pageMenu?.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      pageMenu
    ) {

      closePageSelection();

    }

  }
);


/* =========================================================
   INICIALIZAÇÃO DO LIVRO
========================================================= */

window.addEventListener(
  "load",
  () => {

    /*
      Cria a galeria lateral
      das páginas.
    */

    createPageThumbnails();


    /*
      Recupera a última página
      lida pelo usuário.
    */

    const savedPage =
      getSavedPage();


    /*
      Agora o livro realmente
      volta para a página salva.
    */

    if (savedPage > 0) {

      pageFlip.turnToPage(
        savedPage
      );

    }


    updatePageCounter(
      savedPage
    );


    updateCurrentPageSelection(
      savedPage
    );

  }
);