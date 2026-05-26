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

} else {
  console.log("Mobile detected - security disabled");
}