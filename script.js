const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");
const formNote = document.querySelector("[data-form-note]");
const submitButton = document.querySelector("[data-submit-button]");
const formDialog = document.querySelector("[data-form-dialog]");
const formDialogTitle = document.querySelector("[data-form-dialog-title]");
const formDialogMessage = document.querySelector("[data-form-dialog-message]");
const formDialogIcon = document.querySelector("[data-form-dialog-icon]");
const formDialogCloseButtons = document.querySelectorAll("[data-form-dialog-close]");
const loader = document.querySelector("[data-loader]");
const loaderValue = document.querySelector("[data-loader-value]");
const loaderTrack = document.querySelector("[data-loader-track]");
const pageProgress = document.querySelector("[data-page-progress]");
const cursorOrb = document.querySelector("[data-cursor-orb]");
const canvas = document.querySelector("[data-signal-canvas]");
const fallbackEmail = "sebybanham@gmail.com";
const defaultFormNote = formNote ? formNote.innerHTML : "";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!prefersReducedMotion) document.body.classList.add("motion-ready");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const runLoader = () => {
  if (!loader || prefersReducedMotion) {
    loader?.remove();
    return;
  }

  document.body.classList.add("is-loading");
  let progress = 0;
  const startedAt = performance.now();
  const minimumDuration = 950;

  const tick = (now) => {
    const elapsed = now - startedAt;
    const target = Math.min(100, Math.round((elapsed / minimumDuration) * 100));
    progress += Math.max(1, Math.ceil((target - progress) * 0.16));
    progress = Math.min(progress, target);

    if (loaderValue) loaderValue.textContent = `${progress}%`;
    if (loaderTrack) loaderTrack.style.width = `${progress}%`;

    if (progress < 100 || elapsed < minimumDuration) {
      requestAnimationFrame(tick);
      return;
    }

    window.setTimeout(() => {
      loader.classList.add("is-complete");
      document.body.classList.remove("is-loading");
      window.setTimeout(() => loader.remove(), 750);
    }, 140);
  };

  requestAnimationFrame(tick);
};

runLoader();

const setHeaderState = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);

  if (pageProgress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    pageProgress.style.width = `${clamp(ratio, 0, 1) * 100}%`;
  }
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setHeaderState);

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!header || !menuToggle) return;
    header.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

const revealItems = document.querySelectorAll(".reveal-item");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement?.querySelectorAll(":scope > .reveal-item") || []);
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10%", threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = document.querySelectorAll("[data-section], #pricing, #payment");
if ("IntersectionObserver" in window && navLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const id = visible.target.id || visible.target.dataset.section;
    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("is-active", target === id);
    });
  }, { rootMargin: "-35% 0px -50%", threshold: [0.05, 0.2, 0.45] });

  sections.forEach((section) => sectionObserver.observe(section));
}

if (finePointer && cursorOrb && !prefersReducedMotion) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let orbX = pointerX;
  let orbY = pointerY;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }, { passive: true });

  const moveOrb = () => {
    orbX += (pointerX - orbX) * 0.18;
    orbY += (pointerY - orbY) * 0.18;
    cursorOrb.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(moveOrb);
  };
  moveOrb();

  document.querySelectorAll("a, button, input, select, textarea, [data-tilt]").forEach((element) => {
    element.addEventListener("pointerenter", () => cursorOrb.classList.add("is-active"));
    element.addEventListener("pointerleave", () => cursorOrb.classList.remove("is-active"));
  });
}

const tiltElements = document.querySelectorAll("[data-tilt]");
if (finePointer && !prefersReducedMotion) {
  tiltElements.forEach((element) => {
    const strength = Number(element.dataset.tiltStrength || 5);

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1400px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateZ(0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

const magneticElements = document.querySelectorAll(".magnetic");
if (finePointer && !prefersReducedMotion) {
  magneticElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.12}px, ${y * 0.16}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

const initSignalCanvas = () => {
  if (!canvas || prefersReducedMotion) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  const pointer = { x: -1000, y: -1000 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = clamp(Math.round((width * height) / 22000), 28, 90);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.4 + 0.4
    }));
  };

  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    points.forEach((point) => {
      const dxPointer = pointer.x - point.x;
      const dyPointer = pointer.y - point.y;
      const pointerDistance = Math.hypot(dxPointer, dyPointer);

      if (pointerDistance < 180) {
        point.vx -= (dxPointer / Math.max(pointerDistance, 1)) * 0.006;
        point.vy -= (dyPointer / Math.max(pointerDistance, 1)) * 0.006;
      }

      point.vx *= 0.995;
      point.vy *= 0.995;
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;
    });

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      for (let j = i + 1; j < points.length; j += 1) {
        const other = points[j];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance > 125) continue;
        const opacity = (1 - distance / 125) * 0.18;
        context.strokeStyle = `rgba(53, 222, 208, ${opacity})`;
        context.lineWidth = 0.7;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }

      context.fillStyle = i % 9 === 0 ? "rgba(255,194,15,.7)" : "rgba(53,222,208,.58)";
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    }

    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", updatePointer, { passive: true });
  canvas.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });
  draw();
};

initSignalCanvas();

const buildFallbackEmail = (data) => {
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const business = String(data.get("business") || "").trim();
  const location = String(data.get("location") || "").trim();
  const packageChoice = String(data.get("package") || "");
  const message = String(data.get("message") || "").trim();

  const subject = `SebsWebs quote request - ${business}`;
  const body = [
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

  return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const setFormState = (message, state, useHtml = false) => {
  if (!formNote) return;
  if (useHtml) formNote.innerHTML = message;
  else formNote.textContent = message;

  if (state) formNote.dataset.state = state;
  else delete formNote.dataset.state;
};

const resetFormState = () => setFormState(defaultFormNote, "", true);

const showFormDialog = ({ title, message, state }) => {
  if (!formDialog || !formDialogTitle || !formDialogMessage || !formDialogIcon) return;
  formDialogTitle.textContent = title;
  formDialogMessage.textContent = message;
  formDialog.dataset.state = state;
  formDialogIcon.textContent = state === "success" ? "OK" : "!";
  formDialog.hidden = false;
  document.body.classList.add("dialog-open");
  formDialog.querySelector("button")?.focus();
};

const closeFormDialog = () => {
  if (!formDialog) return;
  formDialog.hidden = true;
  document.body.classList.remove("dialog-open");
};

formDialogCloseButtons.forEach((button) => button.addEventListener("click", closeFormDialog));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && formDialog && !formDialog.hidden) closeFormDialog();
});

if (quoteForm && submitButton) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(quoteForm);
    if (data.get("_honey")) return;

    const business = String(data.get("business") || "").trim();
    data.set("_subject", `SebsWebs quote request - ${business}`);
    const fallbackUrl = buildFallbackEmail(data);
    const defaultButtonText = submitButton.innerHTML;

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = "<span>Sending request...</span>";
      setFormState("Sending your request...", "pending");

      const response = await fetch(quoteForm.dataset.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });

      if (!response.ok) throw new Error("Form submission failed");

      quoteForm.reset();
      resetFormState();
      showFormDialog({
        title: "Quote request sent",
        message: "Thanks - your request has been sent. I will reply by email as soon as possible.",
        state: "success"
      });
    } catch (error) {
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
}
