const root = document.documentElement;
const body = document.body;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const localNavLinks = navLinks.filter((link) => (link.getAttribute("href") || "").startsWith("#"));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const cinematic = getComputedStyle(root).getPropertyValue("--display").trim() !== "";

root.classList.add("js");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function closeMenu() {
  if (!header || !menuButton) return;
  header.classList.remove("is-open");
  body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}

function updatePageState() {
  if (header) header.classList.toggle("is-scrolled", scrollY > 16);

  const scrollable = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty("--scroll-progress", `${scrollable > 0 ? clamp(scrollY / scrollable * 100, 0, 100) : 0}%`);

  let activeId = "";
  const marker = scrollY + innerHeight * 0.33;
  localNavLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section && section.offsetTop <= marker) activeId = section.id;
  });
  localNavLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`));
}

function setupNavigation() {
  updatePageState();
  addEventListener("scroll", updatePageState, { passive: true });
  addEventListener("resize", () => {
    updatePageState();
    if (innerWidth > 1180) closeMenu();
  });

  if (header && menuButton) {
    menuButton.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      body.classList.toggle("menu-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
}

function setupExperience() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.prepend(progress);

  if (!reduceMotion) {
    const loader = document.createElement("div");
    loader.className = "site-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<div class="site-loader__inner"><span class="site-loader__brand">SebsWebs</span><span class="site-loader__count">0</span><span class="site-loader__line"></span></div>';
    body.prepend(loader);
    const count = loader.querySelector(".site-loader__count");
    const start = performance.now();
    const animate = (now) => {
      const elapsed = clamp((now - start) / 900, 0, 1);
      const value = Math.round((1 - Math.pow(1 - elapsed, 3)) * 100);
      count.textContent = String(value).padStart(2, "0");
      loader.style.setProperty("--loader-progress", `${value}%`);
      if (elapsed < 1) return requestAnimationFrame(animate);
      setTimeout(() => {
        loader.classList.add("is-done");
        setTimeout(() => loader.remove(), 760);
      }, 120);
    };
    requestAnimationFrame(animate);
  }

  const revealSelectors = [
    ".hero-copy", ".hero-media", ".proof-grid > div", ".section-heading", ".service-item",
    ".example-item", ".process-copy", ".process-list li", ".price-column", ".care-item",
    ".scope-item", ".contact-copy", ".quote-form"
  ];
  const revealItems = [...document.querySelectorAll(revealSelectors.join(","))];
  revealItems.forEach((item, index) => {
    item.classList.add("will-reveal");
    item.style.transitionDelay = `${Math.min(index % 5 * 70, 280)}ms`;
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  }

  if (finePointer && !reduceMotion) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    body.append(dot, ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (event) => {
      x = event.clientX; y = event.clientY; body.classList.add("cursor-ready");
    }, { passive: true });
    document.querySelectorAll("a,button,input,select,textarea,.service-item,.example-item,.price-column,.care-item,.scope-item").forEach((item) => {
      item.addEventListener("pointerenter", () => body.classList.add("cursor-hover"));
      item.addEventListener("pointerleave", () => body.classList.remove("cursor-hover"));
    });
    const draw = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    const hero = document.querySelector(".hero");
    const heroImage = document.querySelector(".hero-media img");
    if (hero && heroImage) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        heroImage.style.transform = `rotateY(${-5 + px * 7}deg) rotateX(${1 - py * 5}deg) translate3d(${px * 9}px,${py * 9}px,0)`;
      }, { passive: true });
      hero.addEventListener("pointerleave", () => heroImage.style.transform = "rotateY(-5deg) rotateX(1deg)");
    }
  }
}

function setupForm() {
  const form = document.querySelector("[data-quote-form]");
  const note = document.querySelector("[data-form-note]");
  const submit = document.querySelector("[data-submit-button]");
  const dialog = document.querySelector("[data-form-dialog]");
  const title = document.querySelector("[data-form-dialog-title]");
  const message = document.querySelector("[data-form-dialog-message]");
  const icon = document.querySelector("[data-form-dialog-icon]");
  const defaultNote = note ? note.innerHTML : "";
  const email = "sebybanham@gmail.com";

  const closeDialog = () => {
    if (!dialog) return;
    dialog.hidden = true;
    body.classList.remove("dialog-open");
  };
  document.querySelectorAll("[data-form-dialog-close]").forEach((button) => button.addEventListener("click", closeDialog));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (dialog && !dialog.hidden) closeDialog(); else closeMenu();
  });

  if (!form || !submit) return;
  const showDialog = (dialogTitle, dialogMessage, state) => {
    if (!dialog || !title || !message || !icon) return;
    title.textContent = dialogTitle;
    message.textContent = dialogMessage;
    dialog.dataset.state = state;
    icon.textContent = state === "success" ? "OK" : "!";
    dialog.hidden = false;
    body.classList.add("dialog-open");
    dialog.querySelector("button")?.focus();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get("_honey")) return;
    const business = String(data.get("business") || "").trim();
    data.set("_subject", `SebsWebs quote request - ${business}`);
    const fallbackBody = [
      `Name: ${String(data.get("name") || "").trim()}`,
      `Email: ${String(data.get("email") || "").trim()}`,
      `Business type: ${business}`,
      `Business town or area: ${String(data.get("location") || "").trim()}`,
      `Package: ${String(data.get("package") || "")}`,
      "", "Message:", String(data.get("message") || "").trim() || "I would like a quote for a website."
    ].join("\n");
    const fallback = `mailto:${email}?subject=${encodeURIComponent(`SebsWebs quote request - ${business}`)}&body=${encodeURIComponent(fallbackBody)}`;
    const originalButton = submit.innerHTML;

    try {
      submit.disabled = true;
      submit.textContent = "Sending request...";
      if (note) { note.textContent = "Sending your request..."; note.dataset.state = "pending"; }
      const response = await fetch(form.dataset.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: data });
      if (!response.ok) throw new Error("Form submission failed");
      form.reset();
      if (note) { note.innerHTML = defaultNote; delete note.dataset.state; }
      showDialog("Quote request sent", "Thanks - your request has been sent. I will reply by email as soon as possible.", "success");
    } catch (error) {
      console.error("SebsWebs form submission error", error);
      if (note) { note.innerHTML = defaultNote; delete note.dataset.state; }
      showDialog("Email draft opened", `The form could not send automatically, so an email draft has opened for ${email}. Send that email to make sure your request arrives.`, "error");
      location.href = fallback;
    } finally {
      submit.disabled = false;
      submit.innerHTML = originalButton;
    }
  });
}

if (cinematic) setupExperience();
setupNavigation();
setupForm();
