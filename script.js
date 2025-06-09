document.addEventListener("DOMContentLoaded", () => {
  const h1 = document.getElementById("trigger");
  const overlay = document.getElementById("overlay");
  const layers = document.querySelectorAll(".layer");
  const video = document.getElementById("introVideo");
  const fondo = document.getElementById("imagenFondo");
  const poster = document.getElementById("posterOverlayTomato");
  const body = document.body;

  let enterPressCount = 0;
  let videoFinished = false;

  if (!h1 || !overlay || !video || !fondo || !poster) return;

  body.classList.add("initial-state");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    layers.forEach((layer, i) => {
      layer.style.transform = `translateY(${scrollY * [0.1, 0.2, 0.3, 0.4][i]}px)`;
    });
  });

  poster.style.opacity = "0";
  poster.style.pointerEvents = "none";
  poster.style.position = "absolute"; // importantísimo para mover y redimensionar
  poster.style.top = poster.style.top || "100px";
  poster.style.left = poster.style.left || "660px";
  poster.style.width = poster.style.width || "730px";
  poster.style.height = poster.style.height || "860px";
  poster.style.zIndex = "1000";
  poster.style.transition = "opacity 0.5s ease";

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      enterPressCount++;

      if (enterPressCount === 1) {
        body.classList.add("show-title");
        overlay.classList.add("stage-1");
        h1.style.display = "block";
      } else if (enterPressCount === 2) {
        body.classList.add("show-all");
        overlay.classList.add("hidden");
        overlay.classList.remove("stage-1");

        if (videoFinished) {
          mostrarPoster();
        }
      }
    }

    if (e.key === "ArrowDown") {
      video.play();
    }
  });

  video.addEventListener("ended", () => {
    videoFinished = true;

    video.style.transition = "opacity 1s ease";
    video.style.opacity = "0";

    setTimeout(() => {
      video.style.display = "none";
      fondo.classList.remove("hidden");
      fondo.classList.add("visible");

      if (enterPressCount >= 2) {
        mostrarPoster();
      }
    }, 1000);
  });

  function mostrarPoster() {
    poster.style.opacity = "1";
    poster.style.pointerEvents = "auto";
    enableDragAndResize();
  }

  // ==== Drag & Resize ====

  function enableDragAndResize() {
    let isDragging = false;
    let isResizing = false;
    let currentDir = "";
    let startX, startY, startWidth, startHeight, startTop, startLeft;

    // Mover poster
    poster.style.cursor = "move";

    poster.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("poster-resizer")) {
        // Si clicamos en un resizer, empezamos a redimensionar
        return;
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startTop = parseInt(window.getComputedStyle(poster).top, 10);
      startLeft = parseInt(window.getComputedStyle(poster).left, 10);
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        poster.style.top = startTop + dy + "px";
        poster.style.left = startLeft + dx + "px";
      } else if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (currentDir.includes("e")) {
          poster.style.width = startWidth + dx + "px";
        }
        if (currentDir.includes("s")) {
          poster.style.height = startHeight + dy + "px";
        }
        if (currentDir.includes("w")) {
          poster.style.width = startWidth - dx + "px";
          poster.style.left = startLeft + dx + "px";
        }
        if (currentDir.includes("n")) {
          poster.style.height = startHeight - dy + "px";
          poster.style.top = startTop + dy + "px";
        }
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      isResizing = false;
      poster.style.cursor = "move";
      document.body.style.userSelect = "auto";
    });

    // Crear y manejar resizers
    const directions = ["nw", "ne", "sw", "se", "n", "s", "e", "w"];
    directions.forEach((dir) => {
      let resizer = document.createElement("div");
      resizer.classList.add("poster-resizer");
      resizer.classList.add(dir.length === 1 ? "edge" : "corner");
      resizer.classList.add(dir);
      resizer.style.position = "absolute";

      // Estilos básicos para cada resizer (pequeños cuadrados visibles)
      resizer.style.width = "10px";
      resizer.style.height = "10px";
      resizer.style.background = "rgba(255,255,255,0.7)";
      resizer.style.border = "1px solid black";
      resizer.style.zIndex = "1010";

      // Posicionar según dirección
      switch (dir) {
        case "nw":
          resizer.style.top = "-5px";
          resizer.style.left = "-5px";
          resizer.style.cursor = "nwse-resize";
          break;
        case "ne":
          resizer.style.top = "-5px";
          resizer.style.right = "-5px";
          resizer.style.cursor = "nesw-resize";
          break;
        case "sw":
          resizer.style.bottom = "-5px";
          resizer.style.left = "-5px";
          resizer.style.cursor = "nesw-resize";
          break;
        case "se":
          resizer.style.bottom = "-5px";
          resizer.style.right = "-5px";
          resizer.style.cursor = "nwse-resize";
          break;
        case "n":
          resizer.style.top = "-5px";
          resizer.style.left = "50%";
          resizer.style.transform = "translateX(-50%)";
          resizer.style.cursor = "ns-resize";
          break;
        case "s":
          resizer.style.bottom = "-5px";
          resizer.style.left = "50%";
          resizer.style.transform = "translateX(-50%)";
          resizer.style.cursor = "ns-resize";
          break;
        case "e":
          resizer.style.top = "50%";
          resizer.style.right = "-5px";
          resizer.style.transform = "translateY(-50%)";
          resizer.style.cursor = "ew-resize";
          break;
        case "w":
          resizer.style.top = "50%";
          resizer.style.left = "-5px";
          resizer.style.transform = "translateY(-50%)";
          resizer.style.cursor = "ew-resize";
          break;
      }

      poster.appendChild(resizer);

      // Eventos para resize
      resizer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isResizing = true;
        currentDir = dir;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = poster.offsetWidth;
        startHeight = poster.offsetHeight;
        startTop = parseInt(window.getComputedStyle(poster).top, 10);
        startLeft = parseInt(window.getComputedStyle(poster).left, 10);
        document.body.style.userSelect = "none";
      });
    });
  }

  // Efecto neón al cargar
  h1.style.opacity = "1";
  h1.style.animation = "neonGlow 1s infinite alternate";
});

document.addEventListener("DOMContentLoaded", () => {
  const poster = document.getElementById('posterOverlayTomato');

  if (!poster) return;

  // Añadir resizers solo si no existen (para evitar duplicados si se ejecuta varias veces)
  if (poster.querySelectorAll('.poster-resizer').length === 0) {
    const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];

    directions.forEach(dir => {
      const resizer = document.createElement('div');
      resizer.classList.add('poster-resizer');
      resizer.classList.add(dir.length === 1 ? 'edge' : 'corner');
      resizer.classList.add(dir);
      poster.appendChild(resizer);
    });
  }

  // Drag
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  poster.addEventListener('mousedown', e => {
    if (e.target.classList.contains('poster-resizer')) return; // no drag si agarramos resizer
    isDragging = true;
    offsetX = e.clientX - poster.offsetLeft;
    offsetY = e.clientY - poster.offsetTop;
    poster.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    poster.style.left = e.clientX - offsetX + 'px';
    poster.style.top = e.clientY - offsetY + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    poster.style.cursor = 'move';
  });

  // Resize
  let isResizing = false;
  let currentDir = '';
  let startX, startY, startWidth, startHeight, startTop, startLeft;

  function startResize(e, dir) {
    e.preventDefault();
    isResizing = true;
    currentDir = dir;
    startX = e.clientX;
    startY = e.clientY;
    const rect = poster.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startTop = rect.top;
    startLeft = rect.left;
    document.body.style.userSelect = 'none';
  }

  function doResize(e) {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (currentDir.includes('e')) {
      poster.style.width = startWidth + dx + 'px';
    }
    if (currentDir.includes('s')) {
      poster.style.height = startHeight + dy + 'px';
    }
    if (currentDir.includes('w')) {
      poster.style.width = startWidth - dx + 'px';
      poster.style.left = startLeft + dx + 'px';
    }
    if (currentDir.includes('n')) {
      poster.style.height = startHeight - dy + 'px';
      poster.style.top = startTop + dy + 'px';
    }
  }

  function stopResize() {
    isResizing = false;
    document.body.style.userSelect = '';
  }

  poster.querySelectorAll('.poster-resizer').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      const dir = [...handle.classList].find(c => ['nw','ne','sw','se','n','s','e','w'].includes(c));
      startResize(e, dir);
    });
  });

  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);

  // Cursor pointer al entrar en poster
  poster.style.cursor = 'move';
});

document.querySelectorAll('.grid-item').forEach(item => {
  item.addEventListener('click', () => {
    const isExpanded = item.classList.contains('expanded');
    // Primero, cerrar todas las celdas
    document.querySelectorAll('.grid-item').forEach(el => el.classList.remove('expanded'));
    // Si no estaba expandida, expandirla
    if (!isExpanded) {
      item.classList.add('expanded');
    }
  });
});

 document.addEventListener('keydown', function(event) {
    if (event.key === '1') {
      const popup = document.getElementById('popup');
      popup.style.display = 'block';

      // Ocultar automáticamente después de 3 segundos
      setTimeout(() => {
        popup.style.display = 'none';
      }, 9000);
    }
  });
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("big-music");
  let playCount = 0;

  function fadeIn(audioElement, targetVolume = 0.8, duration = 2000) {
    const stepTime = 50;
    const steps = duration / stepTime;
    let volume = audioElement.volume;
    const volumeStep = (targetVolume - volume) / steps;

    const fade = setInterval(() => {
      volume += volumeStep;
      if (volume >= targetVolume) {
        audioElement.volume = targetVolume;
        clearInterval(fade);
      } else {
        audioElement.volume = volume;
      }
    }, stepTime);
  }

  function fadeOut(audioElement, duration = 2000) {
    const stepTime = 50;
    const steps = duration / stepTime;
    let volume = audioElement.volume;
    const volumeStep = volume / steps;

    const fade = setInterval(() => {
      volume -= volumeStep;
      if (volume <= 0) {
        audioElement.volume = 0;
        audioElement.pause();
        clearInterval(fade);
      } else {
        audioElement.volume = volume;
      }
    }, stepTime);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "2") {
      playCount++;

      if (playCount === 1) {
        if (audio.readyState >= 2) {
          audio.volume = 0.5;
          audio.currentTime = 0;
          audio.play();
        } else {
          audio.addEventListener("canplaythrough", () => {
            audio.volume = 0.1;
            audio.currentTime = 0;
            audio.play();
          }, { once: true });
        }
      } else if (playCount === 2) {
        fadeOut(audio, 2000);
      } else if (playCount === 3) {
        audio.play();
        fadeIn(audio, 0.8, 2000);
        playCount = 0; // Reset count after third press
      }
    }
  });
});

  (function() {
  let isScrolling = false;

  const scrollSpeed = 1; // menor número = más lento
  const scrollStep = 10;  // cantidad de píxeles por paso
  const interval = 10;    // milisegundos entre pasos

  function smoothScroll(delta) {
    if (isScrolling) return;
    isScrolling = true;
    
    let scrolled = 0;

    const step = () => {
      if (scrolled < Math.abs(delta)) {
        const move = delta > 0 ? scrollStep : -scrollStep;
        window.scrollBy(0, move);
        scrolled += scrollStep;
        setTimeout(step, interval);
      } else {
        isScrolling = false;
      }
    };

    step();
  }

  function onScrollKey(e) {
    const keys = {
      ArrowDown: 100,
      ArrowUp: -100,
      PageDown: window.innerHeight,
      PageUp: -window.innerHeight,
      ' ': e.shiftKey ? -window.innerHeight : window.innerHeight,
    };

    if (keys[e.key] !== undefined) {
      e.preventDefault();
      smoothScroll(keys[e.key]);
    }
  }

  document.addEventListener('keydown', onScrollKey, { passive: false });
})();

    // Función para entrar en modo pantalla completa
    function activarPantallaCompleta() {
      const elem = document.documentElement; // toda la página
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
      }
    }

    // Escuchar el evento de teclado
    document.addEventListener('keydown', function(event) {
      if (event.key === '3') {
        activarPantallaCompleta();
      }
    });