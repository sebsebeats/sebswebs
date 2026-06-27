const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("[data-quote-form]");
const formNote = document.querySelector("[data-form-note]");

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

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(quoteForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim();
  const business = data.get("business").trim();
  const packageChoice = data.get("package");
  const message = data.get("message").trim();

  const subject = `SebsWebs quote request - ${business}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Business type: ${business}`,
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

  formNote.textContent = "Opening your email app with the quote details filled in. If nothing opens, email sebybanham@gmail.com directly.";
  window.location.href = `mailto:sebybanham@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
