import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOdlQc36JMeLo_2pYElMhlJ0MRf8gl-Ao",
  authDomain: "lusux-36a2e.firebaseapp.com",
  projectId: "lusux-36a2e",
  storageBucket: "lusux-36a2e.firebasestorage.app",
  messagingSenderId: "170782970810",
  appId: "1:170782970810:web:08fcc0505a179b4f798383",
  measurementId: "G-S0ZJQXYE4F"
};

const app = initializeApp(firebaseConfig);
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {});

const db = getFirestore(app);
const APPOINTMENTS_COLLECTION = "appointments";

function normalizeImagePath(path) {
  if (!path) return "";

  const isSubdir = window.location.pathname !== "/" && !window.location.pathname.endsWith("/index.html");

  if (isSubdir && path.startsWith("./images/")) {
    return path.replace("./images/", "../images/");
  }

  if (!isSubdir && path.startsWith("../images/")) {
    return path.replace("../images/", "./images/");
  }

  return path;
}

function absoluteUrl(url) {
  if (!url || url === "#") return window.location.href;

  try {
    return new URL(url, window.location.origin).href;
  } catch (error) {
    return window.location.href;
  }
}

function getProjectValue(project, keys, fallback) {
  for (const key of keys) {
    if (project[key]) return project[key];
  }

  return fallback || "";
}

function updateCardContent(card, project) {
  if (!card || !project) return;

  const image = card.querySelector("img");
  const titleNode = card.querySelector("h2, h3");
  const categoryNode = card.querySelector(".fan-card-info p, .card-category");

  const title = getProjectValue(project, ["title", "name"], titleNode ? titleNode.textContent : "Project");
  const category = getProjectValue(project, ["category", "type"], categoryNode ? categoryNode.textContent : "");
  const link = getProjectValue(project, ["link", "url", "href"], card.getAttribute("href") || "#");
  const imagePath = normalizeImagePath(getProjectValue(project, ["image", "imageUrl", "thumbnail"], image ? image.getAttribute("src") : ""));

  card.setAttribute("href", link);
  card.setAttribute("aria-label", title + (category ? " - " + category : ""));

  if (link.startsWith("http")) {
    card.setAttribute("target", "_blank");
    card.setAttribute("rel", "noopener noreferrer");
  } else {
    card.removeAttribute("target");
    card.removeAttribute("rel");
  }

  if (image && imagePath) {
    image.src = imagePath;
    image.alt = getProjectValue(project, ["alt", "altText", "imageAlt"], image.alt || title);
    image.loading = "lazy";
    image.decoding = "async";
  }

  if (titleNode) titleNode.textContent = title;
  if (categoryNode && category) categoryNode.textContent = category;
}

function resetProjectCardAnimation(card) {
  card.classList.remove("visible");
  card.style.transitionDelay = "";
}

function projectFromCard(card) {
  const image = card.querySelector("img");
  const titleNode = card.querySelector("h2, h3");
  const categoryNode = card.querySelector(".fan-card-info p, .card-category");

  return {
    title: titleNode ? titleNode.textContent.trim() : "",
    category: categoryNode ? categoryNode.textContent.trim() : "",
    link: card.getAttribute("href") || "#",
    image: image ? image.getAttribute("src") || "" : ""
  };
}

function getProjectKey(project) {
  const link = getProjectValue(project, ["link", "url", "href"], "").trim().toLowerCase();
  const title = getProjectValue(project, ["title", "name"], "").trim().toLowerCase();
  return link && link !== "#" ? "link:" + link : "title:" + title;
}

function mergeProjects(baseProjects, firebaseProjects) {
  const merged = [];
  const seen = new Set();

  [...baseProjects, ...firebaseProjects].forEach((project) => {
    const key = getProjectKey(project);
    if (!key || seen.has(key)) return;

    seen.add(key);
    merged.push(project);
  });

  return merged;
}

function updateProjectItemListSchema(projects) {
  if (!document.getElementById("projectGrid")) return;

  const schemaId = "firebase-project-itemlist-schema";
  let script = document.getElementById(schemaId);

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = schemaId;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Lusux Web Projects",
    "url": absoluteUrl("/projects/"),
    "itemListElement": projects.map((project, index) => {
      const title = getProjectValue(project, ["title", "name"], "Project");
      const link = getProjectValue(project, ["link", "url", "href"], "/projects/");
      const image = normalizeImagePath(getProjectValue(project, ["image", "imageUrl", "thumbnail"], ""));

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": title,
          "url": absoluteUrl(link),
          "image": image ? absoluteUrl(image) : undefined
        }
      };
    })
  });
}

function renderProjectGrid(projectGrid, projects) {
  const template = projectGrid.querySelector(".project-card");
  if (!template) return;

  const fragment = document.createDocumentFragment();
  const existingProjects = Array.from(projectGrid.querySelectorAll(".project-card")).map(projectFromCard);
  const allProjects = mergeProjects(existingProjects, projects);
  const sortedProjects = allProjects.sort((a, b) => {
    const aTitle = getProjectValue(a, ["title", "name"], "");
    const bTitle = getProjectValue(b, ["title", "name"], "");
    return aTitle.localeCompare(bTitle, undefined, { sensitivity: "base" });
  });

  sortedProjects.forEach((project) => {
    const card = template.cloneNode(true);
    resetProjectCardAnimation(card);
    updateCardContent(card, project);
    fragment.appendChild(card);
  });

  projectGrid.replaceChildren(fragment);
  updateProjectItemListSchema(sortedProjects);

  const loadMoreButton = document.getElementById("loadMoreBtn");
  if (loadMoreButton) {
    loadMoreButton.classList.add("hidden");
  }

  requestAnimationFrame(() => {
    if (typeof window.initPortfolioGrid === "function") {
      window.initPortfolioGrid();
    }
  });
}

function applyProjectsToExistingCards(projects) {
  const fanDeck = document.getElementById("fanDeck");
  const projectGrid = document.getElementById("projectGrid");

  if (fanDeck) {
    const cards = Array.from(fanDeck.querySelectorAll(".fan-card"));
    cards.forEach((card, index) => updateCardContent(card, projects[index]));

    requestAnimationFrame(() => {
      if (typeof window.initFanDeck === "function") {
        window.initFanDeck();
      }
    });
  }

  if (projectGrid) {
    renderProjectGrid(projectGrid, projects);
  }
}

export async function renderDynamicProjects() {
  try {
    const snapshot = await getDocs(query(collection(db, "projects")));
    const projects = [];

    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    if (projects.length) {
      applyProjectsToExistingCards(projects);
    }
  } catch (error) {
    window.lusuxFirebaseProjectError = error;
  }
}

function getFormField(id) {
  return document.getElementById(id);
}

function setSubmitState(button, state) {
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  if (state === "loading") {
    button.disabled = true;
    button.textContent = "Sending...";
    return;
  }

  if (state === "success") {
    button.disabled = false;
    button.textContent = "Sent successfully";
    setTimeout(() => {
      button.textContent = button.dataset.originalText;
    }, 2500);
    return;
  }

  if (state === "error") {
    button.disabled = false;
    button.textContent = "Try again";
    setTimeout(() => {
      button.textContent = button.dataset.originalText;
    }, 2500);
    return;
  }

  button.disabled = false;
  button.textContent = button.dataset.originalText;
}

async function saveAppointment(data) {
  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    name: data.name,
    phone: data.phone,
    projectType: data.projectType || "Not specified",
    message: data.message || "",
    sourcePage: window.location.pathname,
    submittedAt: serverTimestamp()
  });

  return docRef.id;
}

function getFormFeedback(form, button) {
  let feedback = form.querySelector("[data-firebase-feedback]");
  if (feedback) return feedback;

  feedback = document.createElement("p");
  feedback.setAttribute("data-firebase-feedback", "true");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  feedback.style.cssText = [
    "margin-top:14px",
    "font-size:0.86rem",
    "font-weight:500",
    "line-height:1.55",
    "color:#166534",
    "opacity:0",
    "max-height:0",
    "overflow:hidden",
    "transform:translateY(6px)",
    "transition:opacity .35s ease,transform .35s ease,max-height .35s ease"
  ].join(";");

  if (button) {
    button.insertAdjacentElement("afterend", feedback);
  } else {
    form.appendChild(feedback);
  }

  return feedback;
}

function showFormFeedback(form, button, message, type) {
  const feedback = getFormFeedback(form, button);
  feedback.textContent = message;
  feedback.style.color = type === "error" ? "#991b1b" : "#166534";

  requestAnimationFrame(() => {
    feedback.style.opacity = "1";
    feedback.style.maxHeight = "80px";
    feedback.style.transform = "translateY(0)";
  });

  clearTimeout(form._firebaseFeedbackTimer);
  form._firebaseFeedbackTimer = setTimeout(() => {
    feedback.style.opacity = "0";
    feedback.style.maxHeight = "0";
    feedback.style.transform = "translateY(6px)";
  }, type === "error" ? 3600 : 5200);
}

function initFirebaseForm() {
  const form = document.getElementById("ctaForm");
  if (!form || form.dataset.firebaseBound === "true") return;

  form.dataset.firebaseBound = "true";

  const button = document.getElementById("ctaFormBtn") || form.querySelector("[type='submit']");
  if (button && !button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const name = (getFormField("ctaName")?.value || "").trim();
    const phone = (getFormField("ctaPhone")?.value || "").trim();
    const projectType = (getFormField("ctaType")?.value || "").trim();
    const message = (getFormField("ctaMsg")?.value || "").trim();

    if (!name || !phone) {
      setSubmitState(button, "error");
      return;
    }

    const appointment = { name, phone, projectType, message };

    if (form.dataset.firebaseSubmitting === "true") return;

    form.dataset.firebaseSubmitting = "true";
    setSubmitState(button, "loading");

    try {
      await saveAppointment(appointment);
      form.reset();
      setSubmitState(button, "success");
      showFormFeedback(
        form,
        button,
        "Your appointment has been submitted successfully. Our team will contact you within 2 hours.",
        "success"
      );
    } catch (error) {
      window.lusuxFirebaseFormError = error;
      setSubmitState(button, "error");
      showFormFeedback(form, button, "Something went wrong. Please try again.", "error");
    } finally {
      form.dataset.firebaseSubmitting = "false";
    }
  });
}

function initFirebaseBackground() {
  initFirebaseForm();
  renderDynamicProjects();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFirebaseBackground, { once: true });
} else {
  initFirebaseBackground();
}
