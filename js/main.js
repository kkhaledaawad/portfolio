/* ============ macOS-style portfolio — interactions ============ */
(function () {
  "use strict";

  /* ---- Live menu-bar clock (macOS style) ---- */
  const clock = document.getElementById("clock");
  function tick() {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let h = now.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, "0");
    clock.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}  ${h}:${m} ${ampm}`;
  }
  tick();
  setInterval(tick, 1000);

  /* ---- Window management ---- */
  let zTop = 10;
  const windows = Array.from(document.querySelectorAll(".window"));

  function focusWin(win) {
    zTop += 1;
    win.style.zIndex = zTop;
    windows.forEach((w) => w.classList.toggle("focused", w === win));
  }

  function openWin(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.remove("hidden");
    focusWin(win);
    updateDock();
  }

  function closeWin(win) {
    win.classList.add("hidden");
    win.classList.remove("maximized");
    updateDock();
  }

  /* ---- Traffic-light buttons ---- */
  windows.forEach((win) => {
    win.addEventListener("pointerdown", () => focusWin(win));

    win.querySelectorAll(".dot").forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = dot.dataset.action;
        if (action === "close" || action === "min") closeWin(win);
        if (action === "max") win.classList.toggle("maximized");
      });
    });

    /* ---- Dragging by the title bar ---- */
    const bar = win.querySelector(".titlebar");
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".dot") || win.classList.contains("maximized")) return;
      e.preventDefault();
      const rect = win.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;

      function move(ev) {
        let x = ev.clientX - offX;
        let y = ev.clientY - offY;
        x = Math.max(-rect.width + 120, Math.min(x, window.innerWidth - 80));
        y = Math.max(30, Math.min(y, window.innerHeight - 60));
        win.style.left = x + "px";
        win.style.top = y + "px";
      }
      function up() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  });

  /* ---- Dock ---- */
  const dockButtons = Array.from(document.querySelectorAll(".dock-item"));
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.open;
      const win = document.getElementById(id);
      if (win && !win.classList.contains("hidden")) {
        focusWin(win);
      } else {
        openWin(id);
      }
    });
  });

  function updateDock() {
    dockButtons.forEach((btn) => {
      const win = document.getElementById(btn.dataset.open);
      btn.classList.toggle("running", !!win && !win.classList.contains("hidden"));
    });
  }

  /* ---- Lazy embed loading (keeps phones fast: only visible post loads) ---- */
  function loadEmbed(slide) {
    if (!slide || slide.dataset.loaded) return;
    const type = slide.dataset.embed;
    const url = slide.dataset.url;
    const slot = slide.querySelector(".embed-slot");
    if (!type || !url || !slot) return;
    slide.dataset.loaded = "1";
    function whenReady(check, cb, tries) {
      if (check()) return cb();
      if ((tries || 0) >= 40) return;
      setTimeout(() => whenReady(check, cb, (tries || 0) + 1), 500);
    }
    if (type === "tt") {
      const id = (url.match(/video\/(\d+)/) || [])[1];
      slot.innerHTML =
        '<iframe src="https://www.tiktok.com/embed/v2/' + id +
        '" width="325" height="560" style="border:0;border-radius:8px;" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="TikTok video"></iframe>';
    } else if (type === "ig") {
      slot.innerHTML =
        '<div class="ig-embed"><blockquote class="instagram-media" data-instgrm-permalink="' + url + '" data-instgrm-version="14"></blockquote></div>';
      whenReady(
        () => window.instgrm && window.instgrm.embeds,
        () => window.instgrm.embeds.process(slot)
      );
    } else {
      const cls = type === "fb-video" ? "fb-video" : "fb-post";
      const st = type === "fb-video" ? "false" : "true";
      slot.innerHTML =
        '<div class="' + cls + '" data-href="' + url + '" data-width="350" data-show-text="' + st + '"></div>';
      whenReady(
        () => window.FB && window.FB.XFBML,
        () => window.FB.XFBML.parse(slot)
      );
    }
  }

  /* ---- Hide reach metrics (likes / views / counters) inside embeds ---- */
  const CROP = { "ig-embed": 118, "fb-post": 46, "fb-video": 0 };
  const cropObserver = new MutationObserver((muts) => {
    for (const m of muts) {
      const f = m.target;
      if (f.tagName !== "IFRAME" || !f.style.height) continue;
      const wrap = f.closest(".ig-embed, .fb-post, .fb-video");
      if (!wrap) continue;
      const cls = wrap.classList.contains("ig-embed") ? "ig-embed" : wrap.classList.contains("fb-post") ? "fb-post" : "fb-video";
      const cut = CROP[cls];
      if (!cut) continue;
      const h = parseInt(f.style.height, 10);
      if (!h || isNaN(h)) continue;
      if (!wrap.dataset.base) {
        if (h > cut + 200) {
          wrap.dataset.base = String(h - cut);
          wrap.style.overflow = "hidden";
          f.style.height = wrap.dataset.base + "px";
        }
      } else if (h !== parseInt(wrap.dataset.base, 10)) {
        f.style.height = wrap.dataset.base + "px";
      }
    }
  });
  cropObserver.observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });

  /* ---- Post carousels (one post at a time, arrows + dots) ---- */
  document.querySelectorAll(".carousel").forEach((car) => {
    const stage = car.querySelector(".car-stage");
    const slides = Array.from(stage.children);
    const dotsBox = car.querySelector(".car-dots");
    let idx = 0;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("active", n === idx));
      Array.from(dotsBox.children).forEach((d, n) => d.classList.toggle("active", n === idx));
      const panel = car.closest(".brand-panel");
      if (panel && !panel.classList.contains("hidden")) loadEmbed(slides[idx]);
    }
    car._show = () => show(idx);
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Go to post " + (i + 1));
      d.addEventListener("click", () => show(i));
      dotsBox.appendChild(d);
    });
    car.querySelector(".car-arrow.prev").addEventListener("click", () => show(idx - 1));
    car.querySelector(".car-arrow.next").addEventListener("click", () => show(idx + 1));
    show(0);
  });

  /* ---- Brand switching in Portfolio window ---- */
  const brandItems = Array.from(document.querySelectorAll("#brand-list li[data-brand]"));
  brandItems.forEach((item) => {
    item.addEventListener("click", () => {
      brandItems.forEach((li) => li.classList.toggle("active", li === item));
      const id = "panel-" + item.dataset.brand;
      document.querySelectorAll(".brand-panel").forEach((p) => p.classList.toggle("hidden", p.id !== id));
      document.querySelectorAll(".brand-panel:not(.hidden) .carousel").forEach((c) => c._show && c._show());
    });
  });

  /* ---- Sidebar "Connect" items open windows ---- */
  document.querySelectorAll("[data-open]").forEach((el) => {
    if (el.classList.contains("dock-item")) return;
    el.addEventListener("click", () => openWin(el.dataset.open));
  });

  /* ---- Initial state ---- */
  openWin("win-portfolio");
  focusWin(document.getElementById("win-about"));
  updateDock();
})();
