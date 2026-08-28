/* =========================================================
   BOOK.JS
   Configuração geral dos livros Kapitänin Kapita
========================================================= */


/* =========================================================
   CONFIGURAÇÃO DO LIVRO
========================================================= */

const flipbook = document.getElementById("flipbook");

const bookId =
  document.body.dataset.bookId || "book";

const progressKey =
  `${bookId}-page`;



/* =========================================================
   PAGE FLIP
========================================================= */

const pageFlip = new St.PageFlip(
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


const pages =
  document.querySelectorAll(".page");


pageFlip.loadFromHTML(pages);



/* =========================================================
   ELEMENTOS
========================================================= */

const pageCounter =
  document.getElementById("pageCounter");

const audioButton =
  document.getElementById("audioButton");

const readingModeButton =
  document.getElementById("readingModeButton");

const marker =
  document.getElementById("readingMarker");

const nextPageButton =
  document.getElementById("nextPage");

const prevPageButton =
  document.getElementById("prevPage");

const fullscreenButton =
  document.getElementById("fullscreenButton");



/* =========================================================
   ÁUDIO
========================================================= */

let currentAudio = null;
let audioEnabled = false;


function stopAudio() {

  if (!currentAudio) {
    return;
  }

  currentAudio.pause();
  currentAudio.currentTime = 0;

  currentAudio = null;

}


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

if (audioButton) {

  audioButton.addEventListener(
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

}



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


  pageCounter.textContent =
    `Seite ${pageNumber + 1} / ${pages.length}`;

}


updatePageCounter(0);



/* =========================================================
   SALVAR PROGRESSO
========================================================= */

function saveProgress(pageNumber) {

  localStorage.setItem(
    progressKey,
    pageNumber
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
    Number.isNaN(pageNumber) ||
    pageNumber < 0 ||
    pageNumber >= pages.length
  ) {

    return 0;

  }


  return pageNumber;

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


    saveProgress(
      currentPage
    );


    resetReadingScroll();

  }
);



/* =========================================================
   NAVEGAÇÃO
========================================================= */

if (nextPageButton) {

  nextPageButton.addEventListener(
    "click",
    () => {

      pageFlip.flipNext();

    }
  );

}


if (prevPageButton) {

  prevPageButton.addEventListener(
    "click",
    () => {

      pageFlip.flipPrev();

    }
  );

}



/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
  "keydown",
  event => {

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

if (fullscreenButton) {

  fullscreenButton.addEventListener(
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

}



/* =========================================================
   MODO DE LEITURA
========================================================= */

let readingMode = false;


/* =========================================================
   PREPARAR TEXTO
   Divide os parágrafos em frases
========================================================= */

function prepararTextoLeitura() {

  document
    .querySelectorAll(".reading-text p")
    .forEach(paragraph => {

      if (
        paragraph.dataset.prepared === "true"
      ) {
        return;
      }


      const texto =
        paragraph.textContent.trim();


      if (!texto) {
        return;
      }


      const frases =
        texto.match(
          /[^.!?]+[.!?]+|[^.!?]+$/g
        );


      if (!frases) {
        return;
      }


      paragraph.innerHTML = "";


      frases.forEach(frase => {

        const span =
          document.createElement("span");


        span.className =
          "reading-sentence";


        span.textContent =
          frase.trim() + " ";


        paragraph.appendChild(span);

      });


      paragraph.dataset.prepared =
        "true";

    });

}


prepararTextoLeitura();



/* =========================================================
   LIGAR / DESLIGAR LESEMODUS
========================================================= */

if (readingModeButton) {

  readingModeButton.addEventListener(
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
            ".reading-sentence"
          )
          .forEach(sentence => {

            sentence.classList.remove(
              "reading-line"
            );

          });


        if (marker) {

          marker.style.display =
            "none";

        }

      }

    }
  );

}


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


    /* Remove a frase anterior */

    document
      .querySelectorAll(
        ".reading-sentence.reading-line"
      )
      .forEach(item => {

        item.classList.remove(
          "reading-line"
        );

      });


    /* Marca somente a nova frase */

    sentence.classList.add(
      "reading-line"
    );

  },
  true
);


    



/* =========================================================
   NÃO DEIXAR O PAGEFLIP ROUBAR O TOQUE
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
  document.querySelectorAll(".auto-scroll");


readingAreas.forEach(area => {

  const readingContainer =
    area.closest(".reading-text");


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



  /* -----------------------------------------
     EVITAR QUE PAGEFLIP ROUBE O TOQUE
  ----------------------------------------- */

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



  /* -----------------------------------------
     BOTÕES TAMBÉM NÃO VIRAM A PÁGINA
  ----------------------------------------- */

  readingContainer
    ?.querySelectorAll(".scroll-btn")
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



  /* -----------------------------------------
     INICIAR AUTO SCROLL
  ----------------------------------------- */

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



  /* -----------------------------------------
     PARAR AUTO SCROLL
  ----------------------------------------- */

  function stopAutoScroll() {

    autoScrollEnabled = false;


    if (autoScrollTimer) {

      clearInterval(
        autoScrollTimer
      );

      autoScrollTimer = null;

    }

  }



  /* -----------------------------------------
     VOLTAR AO TOPO
  ----------------------------------------- */

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



  /* -----------------------------------------
     SUBIR
  ----------------------------------------- */

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



  /* -----------------------------------------
     DESCER
  ----------------------------------------- */

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



  /* -----------------------------------------
     PAUSAR
  ----------------------------------------- */

  pauseButton?.addEventListener(
    "click",
    () => {

      stopAutoScroll();

    }
  );



  /* -----------------------------------------
     CONTINUAR
  ----------------------------------------- */

  playButton?.addEventListener(
    "click",
    () => {

      startAutoScroll();

    }
  );



  /* -----------------------------------------
     ROLAGEM MANUAL
  ----------------------------------------- */

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
   RESETAR ROLAGEM AO TROCAR DE PÁGINA
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
   INICIAR LIVRO
========================================================= */

window.addEventListener(
  "load",
  () => {

    const savedPage =
      getSavedPage();


    updatePageCounter(
      savedPage
    );


    if (savedPage > 0) {

      console.log(
        `Zuletzt gelesen: Seite ${
          savedPage + 1
        }`
      );

    }

  }
);
/* =========================================================
   SAIR DO LIVRO
========================================================= */

const exitBookButton =
  document.getElementById("exitBookButton");

if (exitBookButton) {

  exitBookButton.addEventListener(
    "click",
    () => {

      const exitUrl =
        exitBookButton.dataset.exitUrl || "index.html";

      window.location.href = exitUrl;

    }
  );

}
/* =========================================================
   ESCOLHER PÁGINA
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
   CRIAR LISTA DE PÁGINAS
========================================================= */

if (
  pageMenuButton &&
  pageMenu &&
  pageList
) {

  pageList.innerHTML = "";


  pages.forEach((page, index) => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.classList.add(
      "page-select-button"
    );


    /* CAPA */

    if (index === 0) {

      button.textContent = "Cover";

    }

    /* OUTRAS PÁGINAS */

    else {

      button.textContent =
        `Seite ${index}`;

    }


    /* IR PARA A PÁGINA */

    button.addEventListener(
      "click",
      () => {

        pageFlip.turnToPage(index);

        closePageSelection();

      }
    );


    pageList.appendChild(button);

  });


  /* =======================================================
     ABRIR MENU
  ======================================================= */

  pageMenuButton.addEventListener(
    "click",
    () => {

      pageMenu.classList.add("open");

      pageMenu.setAttribute(
        "aria-hidden",
        "false"
      );

    }
  );

}


/* =========================================================
   FECHAR MENU
========================================================= */

function closePageSelection() {

  if (!pageMenu) {
    return;
  }

  pageMenu.classList.remove("open");

  pageMenu.setAttribute(
    "aria-hidden",
    "true"
  );

}


closePageMenu?.addEventListener(
  "click",
  closePageSelection
);


/* =========================================================
   FECHAR AO TOCAR FORA DA JANELA
========================================================= */

pageMenu?.addEventListener(
  "click",
  event => {

    if (event.target === pageMenu) {

      closePageSelection();

    }

  }
);