/* Cat 4 Consulting — main.js (no dependencies) */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * FORM DELIVERY CONFIG
   * ------------------------------------------------------------------
   * Set FORM_ENDPOINT to wire up the contact form (see README.md):
   *   - Formspree / Basin / similar:  "https://formspree.io/f/XXXXXXXX"
   *   - Netlify Forms (site deployed on Netlify):  "netlify"
   *   - Leave "" to fall back to a pre-filled email draft (no attachments).
   * ------------------------------------------------------------------ */
  var FORM_ENDPOINT = "https://formspree.io/f/mkjwygyn";

  document.documentElement.classList.add("js");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ---------- Sticky header state ---------- */
  var header = $(".site-header");
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = $(".nav-toggle");
  var nav = $("#site-nav");

  function setNav(open) {
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle.addEventListener("click", function () {
    setNav(!nav.classList.contains("open"));
  });
  $$("#site-nav a").forEach(function (a) {
    a.addEventListener("click", function () { setNav(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    // Anything already at or above the fold (page load mid-scroll, anchor
    // jump, scroll restoration) shows immediately; the rest animates in.
    var foldY = window.innerHeight * 0.95;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < foldY) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- File drop zone ---------- */
  var dropzone = $("#dropzone");
  var fileInput = $("#f-files");
  var fileList = $("#file-list");

  // Central store so drops and browses accumulate instead of replacing.
  var files = [];

  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
    return bytes + " B";
  }

  function syncInput() {
    if (typeof DataTransfer === "undefined") return; // very old browsers: input keeps its own files
    try {
      var dt = new DataTransfer();
      files.forEach(function (f) { dt.items.add(f); });
      fileInput.files = dt.files;
    } catch (e) { /* Safari <14 etc. — input's own selection still submits */ }
  }

  function renderFiles() {
    fileList.innerHTML = "";
    var total = 0;
    files.forEach(function (f, i) {
      total += f.size;
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "file-name";
      name.textContent = f.name;
      var size = document.createElement("span");
      size.className = "file-size";
      size.textContent = fmtSize(f.size);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-remove";
      btn.setAttribute("aria-label", "Remove " + f.name);
      btn.textContent = "×";
      btn.addEventListener("click", function () {
        files.splice(i, 1);
        syncInput();
        renderFiles();
      });
      li.appendChild(name);
      li.appendChild(size);
      li.appendChild(btn);
      fileList.appendChild(li);
    });
    if (files.length) {
      var note = document.createElement("li");
      note.className = "file-note";
      note.textContent =
        "Files travel by email (no size games): after you hit send, we'll " +
        "open a ready-made draft for the attachments.";
      fileList.appendChild(note);
    }
  }

  function addFiles(list) {
    Array.prototype.slice.call(list).forEach(function (f) {
      var dup = files.some(function (g) {
        return g.name === f.name && g.size === f.size;
      });
      if (!dup) files.push(f);
    });
    syncInput();
    renderFiles();
  }

  if (dropzone && fileInput) {
    fileInput.addEventListener("change", function () {
      addFiles(fileInput.files);
    });

    ["dragenter", "dragover"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });
    dropzone.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
    dropzone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  }

  /* ---------- Form submit ---------- */
  var form = $(".review-form");
  var statusEl = $("#form-status");
  var contactLink = $("[data-contact-email]");
  var contactEmail = contactLink
    ? contactLink.getAttribute("href").replace("mailto:", "")
    : "";
  var bookingEl = $("[data-booking-link]");
  var bookingUrl = bookingEl ? bookingEl.getAttribute("href") : "";

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }

  function validate() {
    var ok = true;
    ["f-name", "f-email", "f-help"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var valid = el.value.trim() !== "" && el.checkValidity();
      el.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid) ok = false;
    });
    return ok;
  }

  function showSuccess(filesToSend) {
    if (filesToSend) {
      // Lead is in; files ride along by email (form services charge for
      // uploads, and big claim files are better emailed anyway).
      var draft =
        "mailto:" + contactEmail +
        "?subject=" + encodeURIComponent("Files: " + subjectLine()) +
        "&body=" + encodeURIComponent(
          "Files for the request I just sent through cat4consulting.com.\n\n" +
          "Name: " + fieldVal("f-name") + "\n" +
          "Company: " + fieldVal("f-company") + "\n\n" +
          "(Attach the files to this email.)"
        );
      form.innerHTML =
        '<div class="form-success"><h3>Info received.</h3>' +
        "<p>One more step for the files: attach them to an email to <strong>" +
        contactEmail + "</strong> so nothing gets size-limited.</p>" +
        '<p><a class="btn btn-primary" href="' + draft + '">Email the files &rarr;</a></p>' +
        "<p>We'll take a look and get back to you — a human, not a sequence.</p></div>";
    } else {
      form.innerHTML =
        '<div class="form-success"><h3>Received.</h3>' +
        "<p>We'll take a look and get back to you — a human, not a sequence. " +
        "If it's urgent, email " +
        (contactEmail || "us") +
        " directly.</p>" +
        (bookingUrl
          ? '<p>Want to skip the wait? <a href="' + bookingUrl +
            '" target="_blank" rel="noopener">Book a 15-minute call &rarr;</a></p>'
          : "") +
        "</div>";
    }
  }

  // Selected option's visible label (falls back to raw value).
  function selText(id) {
    var el = document.getElementById(id);
    if (!el || !el.value) return "";
    var opt = el.options && el.options[el.selectedIndex];
    return opt ? opt.text : el.value;
  }

  function fieldVal(id) {
    return (document.getElementById(id) || {}).value || "";
  }

  function subjectLine() {
    var help = fieldVal("f-help");
    var lead =
      help === "office" ? "Missed-call revenue estimate" :
      help === "both" ? "Claims + office inquiry" :
      help === "claims" ? "Free file review" :
      "New inquiry";
    return lead + " — " + (fieldVal("f-company") || fieldVal("f-name"));
  }

  function mailtoFallback() {
    // No endpoint configured: open a pre-filled email draft instead.
    var v = fieldVal;
    var body =
      "Name: " + v("f-name") + "\n" +
      "Company: " + v("f-company") + "\n" +
      "Trade: " + (selText("f-trade") || "—") + "\n" +
      "Phone: " + v("f-phone") + "\n" +
      "Needs help with: " + (selText("f-help") || "—") + "\n\n" +
      "Details:\n" + v("f-message") + "\n\n" +
      (files.length
        ? "(Attaching " + files.length + " file(s) to this email.)"
        : "");
    var href =
      "mailto:" + contactEmail +
      "?subject=" + encodeURIComponent(subjectLine()) +
      "&body=" + encodeURIComponent(body);
    window.location.href = href;
    setStatus(
      "Opening your email app — attach the files there. Or send everything to " +
        contactEmail + ".",
      "ok"
    );
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: silently accept bot submissions.
      if ($("#f-website") && $("#f-website").value) { showSuccess(false); return; }

      if (!validate()) {
        setStatus("Add your name, a valid email, and what you need help with.", "err");
        return;
      }

      if (!FORM_ENDPOINT) { mailtoFallback(); return; }

      var submitBtn = $(".btn-submit", form);
      submitBtn.disabled = true;
      setStatus("Sending…");

      var data = new FormData(form);
      data.delete("company-website");
      // Files never ride the form POST: the text lead always goes through,
      // and the success screen hands the visitor a prefilled email draft
      // for the attachments (see showSuccess).
      var hadFiles = files.length > 0;
      data.delete("files");
      if (hadFiles) {
        data.append("attachments", files.length + " file(s) — visitor will email them to " + contactEmail);
      }
      var url = FORM_ENDPOINT;
      if (FORM_ENDPOINT === "netlify") {
        url = "/";
        data.append("form-name", form.getAttribute("name") || "contact");
      } else {
        data.append("_subject", subjectLine());
      }

      fetch(url, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) { showSuccess(hadFiles); return; }
          // Surface the service's own reason when it gives one (e.g. a
          // plan that doesn't accept file uploads).
          return res.json().then(
            function (j) {
              var msg = j && j.errors && j.errors.length
                ? j.errors.map(function (e) { return e.message || ""; }).join(" ").trim()
                : (j && j.error) || "";
              return Promise.reject(new Error(msg || "HTTP " + res.status));
            },
            function () { return Promise.reject(new Error("HTTP " + res.status)); }
          );
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          var detail = err && err.message ? err.message : "";
          if (!detail || detail.indexOf("HTTP") === 0 || /fetch/i.test(detail)) {
            detail = "Something broke in transit.";
          }
          setStatus(
            detail + " Email everything to " + (contactEmail || "us") +
              " and we're on it.",
            "err"
          );
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
