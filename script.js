const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

root.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const quoteForm = document.querySelector("[data-quote-form]");
const formNote = document.querySelector("[data-form-note]");
const submitButton = document.querySelector("[data-submit-button]");
const formDialog = document.querySelector("[data-form-dialog]");
const formDialogTitle = document.querySelector("[data-form-dialog-title]");
const formDialogMessage = document.querySelector("[data-form-dialog-message]");
const formDialogIcon = document.querySelector("[data-form-dialog-icon]");
const formDialogCloseButtons = document.querySelectorAll("[data-form-dialog-close]");
const fallbackEmail = "sebybanham@gmail.com";
const defaultFormNote = formNote ? formNote.innerHTML : "";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createExperienceUI = () => {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.prepend(progress);

  if (!reduceMotion) {
    const loader = document.createElement("div");
    loader.className = "site-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = `
      <div class="site-loader__inner">
        <span class="site-loader__brand">SebsWebs</span>
        <span class="site-loader__count">0</span>
        <span class="site-loader__line"></span>
      </div>
    `;
    body.prepend(loader);

    const count = loader.querySelector(".site-loader__count");
    const startedAt = performance.now();
    const duration = 900;

    const tick = (now) => {
      const progressValue = clamp((now - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      const displayed = Math.round(eased * 100);
      count.textContent = String(displayed).padStart(2, "0");
      loader.style.setProperty("--loader-progress", `${displayed}%`);

      if (progressValue < 1) {
        requestAnimationFrame(tick);
        return;
      }

      window.setTimeout(() => {
        loader.classList.add("is-done");
        body.classList.add("experience-ready");
        window.setTimeout(() => loader.remove(), 760);
      }, 120);
    };

    requestAnimationFrame(tick);
  } else {
    body.classList.add("experience-ready");
  }

  if (finePointer && !reduceMotion) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    body.append(dot, ring);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;

    const renderCursor = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      body.classList.add("cursor-ready");
    }, { passive: true });

    document.querySelectorAll("a, button, input, select, textarea, .service-item, .example-item, .price-column, .care-item, .scope-item").forEach((element) => {
      element.addEventListener("pointerenter", () => body.classList.add("cursor-hover"));
      element.addEventListener("pointerleave", () => body.classList.remove("cursor-hover"));
    });

    requestAnimationFrame(renderCursor);
  }
};

const setHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

const setScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  root.style.setProperty("--scroll-progress", `${clamp(progress, 0, 100)}%`);
};

const updateActiveNavigation = () => {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let activeId = "";
  const marker = window.scrollY + window.innerHeight * 0.33;

  sections.forEach((section) => {
    if (section.offsetTop <= marker) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
};

const closeMenu = () => {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.remove("is-open");
  body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
};

const initialiseNavigation = () => {
  setHeaderState();
  setScrollProgress();
  updateActiveNavigation();

  window.addEventListener("scroll", () => {
    setHeaderState();
    setScrollProgress();
    updateActiveNavigation();
  }, { passive: true });

  window.addEventListener("resize", () => {
    setScrollProgress();
    if (window.innerWidth > 1180) {
      closeMenu();
    }
  });

  if (menuToggle && header) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      body.classList.toggle("menu-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
  }

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
};

const initialiseRevealAnimations = () => {
  const revealGroups = [
    [".hero-copy", "reveal-left"],
    [".hero-media", "reveal-right"],
    [".proof-grid > div", ""],
    [".section-heading", ""],
    [".service-item", ""],
    [".example-item", ""],
    [".process-copy", "reveal-left"],
    [".process-list li", "reveal-right"],
    [".price-column", ""],
    [".care-item", ""],
    [".scope-item", ""],
    [".contact-copy", "reveal-left"],
    [".quote-form", "reveal-right"]
  ];

  const elements = [];
  revealGroups.forEach(([selector, extraClass]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("will-reveal");
      if (extraClass) {
        element.classList.add(extraClass);
      }
      element.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      elements.push(element);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px"
  });

  elements.forEach((element) => observer.observe(element));
};

const initialiseCardLighting = () => {
  const cards = document.querySelectorAll(".service-item, .price-column, .care-item, .scope-item");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    }, { passive: true });
  });
};

const initialiseHeroParallax = () => {
  if (!finePointer || reduceMotion) {
    return;
  }

  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero-media img");
  if (!hero || !heroImage) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = -5 + x * 7;
    const rotateX = 1 - y * 5;
    heroImage.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translate3d(${x * 9}px, ${y * 9}px, 0)`;
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    heroImage.style.transform = "rotateY(-5deg) rotateX(1deg)";
  });
};

const initialiseMagneticButtons = () => {
  if (!finePointer || reduceMotion) {
    return;
  }

  document.querySelectorAll(".button, .header-cta").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.11}px, ${y * 0.16}px)`;
    }, { passive: true });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
};

const buildFallbackEmail = (data) => {
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const business = String(data.get("business") || "").trim();
  const location = String(data.get("location") || "").trim();
  const packageChoice = String(data.get("package") || "");
  const message = String(data.get("message") || "").trim();

  const subject = `SebsWebs quote request - ${business}`;
  const emailBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Business type: ${business}`,
    `Business town or area: ${location}`,
    `Package: ${packageChoice}`,
    "",
    "Message:",
    message || "I would like a quote for a website.",
    "",
    "Useful details if you have them:",
    "- Current website/domain:",
    "- Pages needed:",
    "- Photos/logo ready:",
    "- Ideal deadline:"
  ].join("\n");

  return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
};

const setFormState = (message, state, useHtml = false) => {
  if (!formNote) {
    return;
  }

  if (useHtml) {
    formNote.innerHTML = message;
  } else {
    formNote.textContent = message;
  }

  if (state) {
    formNote.dataset.state = state;
  } else {
    delete formNote.dataset.state;
  }
};

const resetFormState = () => {
  setFormState(defaultFormNote, "", true);
};

const showFormDialog = ({ title, message, state }) => {
  if (!formDialog || !formDialogTitle || !formDialogMessage || !formDialogIcon) {
    return;
  }

  formDialogTitle.textContent = title;
  formDialogMessage.textContent = message;
  formDialog.dataset.state = state;
  formDialogIcon.textContent = state === "success" ? "OK" : "!";
  formDialog.hidden = false;
  body.classList.add("dialog-open");

  const closeButton = formDialog.querySelector("button");
  if (closeButton) {
    closeButton.focus();
  }
};

const closeFormDialog = () => {
  if (!formDialog) {
    return;
  }

  formDialog.hidden = true;
  body.classList.remove("dialog-open");
};

const initialiseQuoteForm = () => {
  formDialogCloseButtons.forEach((button) => {
    button.addEventListener("click", closeFormDialog);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (formDialog && !formDialog.hidden) {
        closeFormDialog();
      } else {
        closeMenu();
      }
    }
  });

  if (!quoteForm || !submitButton) {
    return;
  }

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    if (data.get("_honey")) {
      return;
    }

    const business = String(data.get("business") || "").trim();
    data.set("_subject", `SebsWebs quote request - ${business}`);

    const fallbackUrl = buildFallbackEmail(data);
    const defaultButtonText = submitButton.innerHTML;

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = "Sending request...";
      setFormState("Sending your request...", "pending");

      const response = await fetch(quoteForm.dataset.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      quoteForm.reset();
      resetFormState();
      showFormDialog({
        title: "Quote request sent",
        message: "Thanks - your request has been sent. I will reply by email as soon as possible.",
        state: "success"
      });
    } catch (error) {
      console.error("SebsWebs form submission error", error);
      resetFormState();
      showFormDialog({
        title: "Email draft opened",
        message: `The form could not send automatically, so an email draft has opened for ${fallbackEmail}. Send that email to make sure your request arrives.`,
        state: "error"
      });
      window.location.href = fallbackUrl;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = defaultButtonText;
    }
  });
};

createExperienceUI();
initialiseNavigation();
initialiseRevealAnimations();
initialiseCardLighting();
initialiseHeroParallax();
initialiseMagneticButtons();
initialiseQuoteForm();
