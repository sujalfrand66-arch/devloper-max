function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCount(element) {
  const target = parseInt(element.dataset.target, 10);
  const duration = target <= 9 ? 900 : 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = Math.floor(easeOutQuart(progress) * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

function revealAboutHeadline(headline) {
  headline.querySelectorAll(".as-word").forEach(function (word, index) {
    setTimeout(function () {
      word.classList.add("visible");
    }, index * 110);
  });
}

function initAboutStatement() {
  const headline = document.getElementById("asHeadline");
  const body = document.getElementById("asBody");
  let hasPlayed = false;

  if (!headline) return;

  new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || hasPlayed) return;

      hasPlayed = true;
      revealAboutHeadline(headline);

      const wordCount = headline.querySelectorAll(".as-word").length;
      setTimeout(function () {
        if (body) body.classList.add("visible");
      }, wordCount * 110 + 150);

      observer.disconnect();
    });
  }, { threshold: 0.2 }).observe(headline);
}

function initStats() {
  const statsRow = document.getElementById("statsRow");
  let hasPlayed = false;

  if (!statsRow) return;

  new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || hasPlayed) return;

      hasPlayed = true;
      statsRow.classList.add("visible");
      setTimeout(function () {
        document.querySelectorAll(".count").forEach(animateCount);
      }, 300);

      observer.disconnect();
    });
  }, { threshold: 0.2 }).observe(statsRow);
}

function initFadeReveals(root) {
  const items = Array.from((root || document).querySelectorAll(".anim-fade"));
  if (!items.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  items.forEach(function (item) {
    if (item.classList.contains("visible")) return;
    observer.observe(item);
  });
}

function initFinalCta() {
  const headline = document.getElementById("ctaHeadline");
  const formWrap = document.getElementById("ctaFormWrap");
  let hasPlayed = false;

  if (!headline) return;

  const words = Array.from(headline.querySelectorAll(".cta-word"));
  const left = headline.closest(".cta-left");
  const sub = left ? left.querySelector(".cta-sub") : null;
  const phones = left ? left.querySelector(".cta-phones") : null;
  const actions = left ? left.querySelector(".cta-actions") : null;

  new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || hasPlayed) return;

      hasPlayed = true;
      words.forEach(function (word, index) {
        setTimeout(function () {
          word.classList.add("visible");
        }, index * 120);
      });

      const delay = words.length * 120 + 200;
      if (sub) setTimeout(function () { sub.classList.add("visible"); }, delay);
      if (phones) setTimeout(function () { phones.classList.add("visible"); }, delay + 200);
      if (actions) setTimeout(function () { actions.classList.add("visible"); }, delay + 400);
      if (formWrap) setTimeout(function () { formWrap.classList.add("visible"); }, delay + 300);

      observer.disconnect();
    });
  }, { threshold: 0.2 }).observe(headline);
}

function clearFanCardState(cards) {
  cards.forEach(function (card, index) {
    card.dataset.index = String(index);
    card.style.transform = "";
    card.style.zIndex = "";
    card.style.opacity = "";
    card.onmouseenter = null;
    card.onmouseleave = null;
  });
}

function initFanDeck() {
  if (window._fanRaf) {
    cancelAnimationFrame(window._fanRaf);
    window._fanRaf = null;
  }

  const stage = document.getElementById("fanStage");
  const deck = document.getElementById("fanDeck");
  const cards = deck ? Array.from(deck.querySelectorAll(".fan-card")) : [];

  if (!stage || !deck || !cards.length) return;

  clearFanCardState(cards);

  if (window.innerWidth <= 768) return;

  const total = cards.length;
  const middle = (total - 1) / 2;
  let currentProgress = getProgress();
  let targetProgress = currentProgress;
  let hoveredIndex = -1;
  const lerpSpeed = 0.08;

  function getProgress() {
    const rect = stage.getBoundingClientRect();
    const runway = stage.offsetHeight - window.innerHeight;
    if (runway <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / runway));
  }

  function applyFan(progress) {
    cards.forEach(function (card, index) {
      const offset = index - middle;
      const distance = Math.abs(offset);
      const fanRotation = offset * 7;
      const fanX = offset * 12;
      const fanY = distance * -6;
      const fanScale = 1 - distance * 0.035;
      const fanZ = total - distance;
      const spreadGap = Math.min(200, window.innerWidth / (total + 1));
      const spreadX = offset * spreadGap;
      const spreadScale = index === Math.round(middle) ? 1.06 : 0.92;
      const eased = 1 - Math.pow(1 - progress, 3);
      const x = fanX + (spreadX - fanX) * eased;
      const y = fanY + (0 - fanY) * eased;
      const rotation = fanRotation + (0 - fanRotation) * eased;
      const scale = fanScale + (spreadScale - fanScale) * eased;
      const z = Math.round(fanZ + (10 - fanZ) * eased);
      const opacityBase = middle === 0 ? 1 : 1 - distance / middle * (1 - eased * 0.7);
      const opacity = 0.5 + 0.5 * opacityBase;

      card.style.transform = "translateX(" + x + "px) translateY(" + y + "px) rotate(" + rotation + "deg) scale(" + scale + ")";
      card.style.zIndex = z;
      card.style.opacity = Math.max(0.35, Math.min(1, opacity));
    });
  }

  cards.forEach(function (card, index) {
    card.onmouseenter = function () {
      hoveredIndex = index;
    };
    card.onmouseleave = function () {
      hoveredIndex = -1;
    };
  });

  function tick() {
    targetProgress = getProgress();
    currentProgress += (targetProgress - currentProgress) * lerpSpeed;
    if (Math.abs(currentProgress - targetProgress) < 0.001) {
      currentProgress = targetProgress;
    }

    applyFan(currentProgress);

    if (hoveredIndex >= 0 && cards[hoveredIndex]) {
      const hovered = cards[hoveredIndex];
      hovered.style.zIndex = "100";
      hovered.style.opacity = "1";
      hovered.style.transform = hovered.style.transform.replace(/scale\([^)]+\)/, "scale(1.1)");
    }

    window._fanRaf = requestAnimationFrame(tick);
  }

  applyFan(currentProgress);
  window._fanRaf = requestAnimationFrame(tick);
}

function initNavigation() {
  function closeAllDropdowns() {
    document.querySelectorAll(".nav-dropdown.open").forEach(function (dropdown) {
      dropdown.classList.remove("open");
      const button = dropdown.querySelector(".nav-dropdown-btn");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".nav-dropdown-btn").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();

      const dropdown = button.closest(".nav-dropdown");
      const isOpen = dropdown.classList.contains("open");

      closeAllDropdowns();

      if (!isOpen) {
        dropdown.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", closeAllDropdowns);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeAllDropdowns();
  });

  const menuButton = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      navLinks.classList.toggle("mobile-open");
    });
  }
}

function debounce(fn, wait) {
  let timer = null;

  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  window.initFanDeck = initFanDeck;
  window.initFadeReveals = initFadeReveals;

  initAboutStatement();
  initStats();
  initFadeReveals(document);
  initFinalCta();
  initFanDeck();
  initNavigation();

  window.addEventListener("resize", debounce(initFanDeck, 160), { passive: true });
});
