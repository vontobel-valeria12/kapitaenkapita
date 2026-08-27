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


if (readingModeButton) {

  readingModeButton.addEventListener(
    "click",
    () => {

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


        if (marker) {

          marker.style.display =
            "none";

        }

      }

    }
  );

}



/* =========================================================
   MARCAR PARÁGRAFO
========================================================= */

document
  .querySelectorAll(".reading-text p")
  .forEach(paragraph => {

    paragraph.addEventListener(
      "click",
      event => {

        if (!readingMode) {
          return;
        }


        event.stopPropagation();


        document
          .querySelectorAll(
            ".reading-text p"
          )
          .forEach(p => {

            p.classList.remove(
              "reading-line"
            );

          });


        paragraph.classList.add(
          "reading-line"
        );

      }
    );

  });



/* =========================================================
   MARCADOR COM TOQUE
========================================================= */

document.addEventListener(
  "touchstart",
  event => {

    if (
      !readingMode ||
      !marker
    ) {
      return;
    }


    const target =
      event.target.closest(
        ".reading-text"
      );


    if (!target) {
      return;
    }


    const touch =
      event.touches[0];


    marker.style.display =
      "block";


    marker.style.top =
      `${touch.clientY - 18}px`;

  },
  {
    passive: true
  }
);



document.addEventListener(
  "touchmove",
  event => {

    if (
      !readingMode ||
      !marker
    ) {
      return;
    }


    if (
      marker.style.display !==
      "block"
    ) {
      return;
    }


    const touch =
      event.touches[0];


    marker.style.top =
      `${touch.clientY - 18}px`;

  },
  {
    passive: true
  }
);



document.addEventListener(
  "touchend",
  () => {

    if (!marker) {
      return;
    }


    marker.style.display =
      "none";

  }
);



/* =========================================================
   MARCADOR COM MOUSE
========================================================= */

document.addEventListener(
  "mousemove",
  event => {

    if (
      !readingMode ||
      !marker
    ) {
      return;
    }


    if (
      !event.target.closest(
        ".reading-text"
      )
    ) {

      marker.style.display =
        "none";

      return;

    }


    marker.style.display =
      "block";


    marker.style.top =
      `${event.clientY - 18}px`;

  }
);



/* =========================================================
   ROLAGEM DO TEXTO
========================================================= */

const readingAreas =
  document.querySelectorAll(
    ".auto-scroll"
  );


readingAreas.forEach(area => {

  let autoScrollTimer = null;

  let paused = false;

  let resumeTimer = null;



  function pauseAutoScroll() {

    paused = true;


    clearTimeout(
      resumeTimer
    );


    resumeTimer =
      setTimeout(
        () => {

          paused = false;

        },
        2500
      );

  }



  function startAutoScroll() {

    autoScrollTimer =
      setInterval(
        () => {

          if (paused) {
            return;
          }


          const reachedBottom =
            area.scrollTop +
            area.clientHeight >=
            area.scrollHeight - 2;


          if (reachedBottom) {

            clearInterval(
              autoScrollTimer
            );

            return;

          }


          area.scrollTop += 1;

        },
        80
      );

  }



  area.addEventListener(
    "touchstart",
    pauseAutoScroll,
    {
      passive: true
    }
  );


  area.addEventListener(
    "touchmove",
    pauseAutoScroll,
    {
      passive: true
    }
  );


  area.addEventListener(
    "wheel",
    pauseAutoScroll,
    {
      passive: true
    }
  );


  area.addEventListener(
    "pointerdown",
    pauseAutoScroll
  );


  startAutoScroll();

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