// ==========================
// SAFE SHIELD.JS (PRO VERSION)
// ==========================

// ✅ Detect mobile (disable protection)
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (!isMobile) {

  // ==========================
  // BASIC PROTECTION
  // ==========================

  // Disable right click
  document.addEventListener("contextmenu", e => e.preventDefault());

  // Disable text selection (except inputs)
  document.addEventListener("selectstart", function (e) {
    const t = e.target;
    if (t && !["INPUT", "TEXTAREA"].includes(t.tagName)) {
      e.preventDefault();
    }
  });

  // Block common shortcuts
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && ["u", "s", "c"].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
    }
  });

  // ==========================
  // LIGHT DEVTOOLS DETECTION (SAFE)
  // ==========================

  let devtoolsOpen = false;

  function detectDevTools() {
    const threshold = 200;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;

        console.clear();
        console.log("%c⛔ Protected Content - Unauthorized copying is prohibited", "color:red;font-size:14px;");
      }
    } else {
      devtoolsOpen = false;
    }
  }

  setInterval(detectDevTools, 1500);

  // ==========================
  // IMAGE PROTECTION
  // ==========================

  function protectImages() {
    document.querySelectorAll("img").forEach(img => {
      img.setAttribute("draggable", "false");

      img.addEventListener("dragstart", e => e.preventDefault());
      img.addEventListener("contextmenu", e => e.preventDefault());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectImages);
  } else {
    protectImages();
  }

  // ==========================
  // WATERMARK (LIGHT + SAFE)
  // ==========================

  function createWatermark() {
    const wm = document.createElement("div");
    wm.style.position = "fixed";
    wm.style.top = "0";
    wm.style.left = "0";
    wm.style.width = "100%";
    wm.style.height = "100%";
    wm.style.pointerEvents = "none";
    wm.style.zIndex = "9999";
    wm.style.opacity = "0.02";
    wm.style.fontSize = "20px";
    wm.style.fontWeight = "bold";
    wm.style.color = "#000";
    wm.style.display = "flex";
    wm.style.flexWrap = "wrap";
    wm.style.alignItems = "center";
    wm.style.justifyContent = "center";

    for (let i = 0; i < 50; i++) {
      const span = document.createElement("span");
      span.innerText = "RSTEX Solution";
      span.style.margin = "40px";
      span.style.transform = "rotate(-30deg)";
      wm.appendChild(span);
    }

    document.body.appendChild(wm);
  }

  window.addEventListener("load", createWatermark);

} else {
  console.log("Mobile detected - security disabled");
}
