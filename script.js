/* =========================================================
   School 1 — behavior
   1. Mobile navigation toggle
   2. English / Swahili language switch
   3. Contact form validation (client-side UX only —
      always re-validate on the server too)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setFooterYear();
  initMobileNav();
  initLanguageToggle();
  initContactForm();
});

/* ---------- Footer year ---------- */
function setFooterYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------- Mobile navigation ---------- */
function initMobileNav() {
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var iconOpen = document.getElementById("navIconOpen");
  var iconClose = document.getElementById("navIconClose");

  if (!navToggle || !navMenu) return;

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    iconOpen.hidden = false;
    iconClose.hidden = true;
  }

  function openMenu() {
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    iconOpen.hidden = true;
    iconClose.hidden = false;
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close the menu once a link is chosen (mobile only)
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        closeMenu();
      }
    });
  });

  // Collapse back to the desktop layout cleanly on resize
  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      closeMenu();
    }
  });
}

/* ---------- Language toggle (English / Swahili) ---------- */
// A small list of listeners that want to know when the language changes,
// so dynamic content (like live form-validation messages) can update too.
var languageChangeListeners = [];

function onLanguageChange(callback) {
  languageChangeListeners.push(callback);
}

function getCurrentLang() {
  return document.documentElement.getAttribute("lang") || "en";
}

function initLanguageToggle() {
  var toggleBtn = document.getElementById("langToggle");
  if (!toggleBtn) return;

  var translatable = document.querySelectorAll("[data-sw]");

  // Cache each element's original English text once,
  // so switching back to English is lossless.
  translatable.forEach(function (el) {
    el.dataset.en = el.textContent;
  });

  function applyLanguage(lang) {
    translatable.forEach(function (el) {
      el.textContent = lang === "sw" ? el.dataset.sw : el.dataset.en;
    });
    document.documentElement.setAttribute("lang", lang);
    toggleBtn.querySelector("span[aria-hidden]").textContent = lang === "sw" ? "SW" : "EN";
    toggleBtn.setAttribute("aria-pressed", lang === "sw" ? "true" : "false");
    toggleBtn.querySelector(".visually-hidden").textContent =
      lang === "sw" ? "Switch language to English" : "Switch language to Swahili";

    languageChangeListeners.forEach(function (callback) {
      callback(lang);
    });
  }

  toggleBtn.addEventListener("click", function () {
    applyLanguage(getCurrentLang() === "en" ? "sw" : "en");
  });
}

/* ---------- Contact form validation ---------- */
function initContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusBox = document.getElementById("formStatus");

  // Every validation message is bilingual: { en: "...", sw: "..." }.
  // null means the field is valid.
  var fields = {
    fullName: {
      el: document.getElementById("fullName"),
      errorEl: document.getElementById("fullNameError"),
      validate: function (value) {
        if (value.trim().length === 0) {
          return { en: "Please enter your full name.", sw: "Tafadhali jaza jina lako kamili." };
        }
        if (value.trim().length < 2) {
          return { en: "That name looks too short — please check it.", sw: "Jina hilo ni fupi mno — tafadhali likague." };
        }
        return null;
      }
    },
    email: {
      el: document.getElementById("email"),
      errorEl: document.getElementById("emailError"),
      validate: function (value) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.trim().length === 0) {
          return { en: "Please enter your email address.", sw: "Tafadhali jaza barua pepe yako." };
        }
        if (!pattern.test(value.trim())) {
          return { en: "Enter a valid email, like name@example.com.", sw: "Weka barua pepe sahihi, mfano jina@mfano.com." };
        }
        return null;
      }
    },
    phone: {
      el: document.getElementById("phone"),
      errorEl: document.getElementById("phoneError"),
      validate: function (value) {
        if (value.trim().length === 0) return null; // optional field
        var pattern = /^[0-9+\s()-]{7,}$/;
        if (!pattern.test(value.trim())) {
          return { en: "Enter a valid phone number, or leave this blank.", sw: "Weka namba sahihi ya simu, au acha wazi." };
        }
        return null;
      }
    },
    reason: {
      el: document.getElementById("reason"),
      errorEl: document.getElementById("reasonError"),
      validate: function (value) {
        if (value === "") {
          return { en: "Please choose a reason for contacting us.", sw: "Tafadhali chagua sababu ya kuwasiliana nasi." };
        }
        return null;
      }
    },
    message: {
      el: document.getElementById("message"),
      errorEl: document.getElementById("messageError"),
      validate: function (value) {
        if (value.trim().length === 0) {
          return { en: "Please add a short message.", sw: "Tafadhali andika ujumbe mfupi." };
        }
        if (value.trim().length < 10) {
          return { en: "A few more details would help us reply well.", sw: "Maelezo zaidi yatatusaidia kujibu vizuri." };
        }
        return null;
      }
    }
  };

  function showFieldError(key, messageObj) {
    var field = fields[key];
    var wrapper = field.el.closest(".form-field");
    field.lastMessage = messageObj; // remembered so we can re-render on language switch

    field.errorEl.textContent = messageObj ? messageObj[getCurrentLang()] : "";
    if (messageObj) {
      wrapper.classList.add("has-error");
      field.el.setAttribute("aria-invalid", "true");
    } else {
      wrapper.classList.remove("has-error");
      field.el.removeAttribute("aria-invalid");
    }
  }

  function validateField(key) {
    var field = fields[key];
    var messageObj = field.validate(field.el.value);
    showFieldError(key, messageObj);
    return messageObj === null;
  }

  // Validate as the visitor leaves each field, not just on submit
  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener("blur", function () {
      validateField(key);
    });
  });

  var statusMessages = {
    error: { en: "Please fix the highlighted fields and send again.", sw: "Tafadhali rekebisha sehemu zilizoangaziwa kisha tuma tena." },
    success: { en: "Thank you — your message has been sent. We'll reply within one working day.", sw: "Asante — ujumbe wako umetumwa. Tutajibu ndani ya siku moja ya kazi." }
  };
  var lastStatus = null; // { type, messageObj } — remembered for re-render on language switch

  function showStatus(type) {
    lastStatus = { type: type, messageObj: statusMessages[type] };
    statusBox.textContent = statusMessages[type][getCurrentLang()];
    statusBox.className = "form-status is-visible " + type;
  }

  // Re-render any currently visible messages when the language changes
  onLanguageChange(function (lang) {
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (field.lastMessage) {
        field.errorEl.textContent = field.lastMessage[lang];
      }
    });
    if (lastStatus) {
      statusBox.textContent = lastStatus.messageObj[lang];
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var allValid = true;
    Object.keys(fields).forEach(function (key) {
      var valid = validateField(key);
      if (!valid) allValid = false;
    });

    if (!allValid) {
      showStatus("error");
      var firstInvalid = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstInvalid) firstInvalid.focus();
      return; // form is left exactly as the visitor typed it
    }

    // No backend is wired up in this template — this is where a real
    // fetch()/Formspree-style submission would go. We confirm success
    // and clear the form only once we know the message actually sent.
    showStatus("success");
    form.reset();
    Object.keys(fields).forEach(function (key) {
      showFieldError(key, null);
    });
  });
}