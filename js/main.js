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

  /* ---- Brand switching in Portfolio window ---- */
  const brandItems = Array.from(document.querySelectorAll("#brand-list li[data-brand]"));
  brandItems.forEach((item) => {
    item.addEventListener("click", () => {
      brandItems.forEach((li) => li.classList.toggle("active", li === item));
      const id = "panel-" + item.dataset.brand;
      document.querySelectorAll(".brand-panel").forEach((p) => p.classList.toggle("hidden", p.id !== id));
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
