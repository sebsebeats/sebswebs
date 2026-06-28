const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");
const formNote = document.querySelector("[data-form-note]");
const submitButton = document.querySelector("[data-submit-button]");
const fallbackEmail = "sebybanham@gmail.com";

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

const buildFallbackEmail = (data) => {
  const name = data.get("name").trim();
  const email = data.get("email").trim();
  const business = data.get("business").trim();
  const location = data.get("location").trim();
  const packageChoice = data.get("package");
  const message = data.get("message").trim();

  const subject = `SebsWebs quote request - ${business}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Business type: ${business}`,
    `Location in Essex: ${location}`,
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

const setFormState = (message, state) => {
  formNote.textContent = message;
  formNote.dataset.state = state;
};

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(quoteForm);
  if (data.get("_honey")) {
    return;
  }

  const business = data.get("business").trim();
  data.set("_subject", `SebsWebs quote request - ${business}`);
  data.set("Source page", window.location.href);

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
    setFormState("Thanks - your request has been sent. I will reply by email as soon as possible.", "success");
  } catch (error) {
    setFormState(`The form could not send automatically. Opening an email draft to ${fallbackEmail} instead.`, "error");
    window.location.href = fallbackUrl;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = defaultButtonText;
  }
});
