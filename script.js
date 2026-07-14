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
const fallbackEmail = "sebybanham@gmail.com";
const defaultFormNote = formNote ? formNote.innerHTML : "";

const setHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
if (header) {
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!header || !menuToggle) {
      return;
    }

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
  document.body.classList.add("dialog-open");

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
  document.body.classList.remove("dialog-open");
};

formDialogCloseButtons.forEach((button) => {
  button.addEventListener("click", closeFormDialog);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && formDialog && !formDialog.hidden) {
    closeFormDialog();
  }
});

if (quoteForm && submitButton) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    if (data.get("_honey")) {
      return;
    }

    const business = data.get("business").trim();
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
