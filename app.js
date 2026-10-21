(() => {
  "use strict";

  const HISTORY_KEY = "dial-simple-caller-history-v1";
  const MAX_HISTORY = 50;
  const input = document.getElementById("phoneNumber");
  const callBtn = document.getElementById("callBtn");
  const hint = document.getElementById("numberHint");
  const toast = document.getElementById("toast");
  const historyList = document.getElementById("historyList");
  const emptyHistory = document.getElementById("emptyHistory");
  const dialerView = document.getElementById("dialerView");
  const historyView = document.getElementById("historyView");
  const installBtn = document.getElementById("installBtn");
  let deferredInstallPrompt = null;
  let toastTimer = null;

  function digitsAndDialChars(value) {
    return value.replace(/[^\d+*#(),; -]/g, "").slice(0, 24);
  }

  function normalizedForTel(value) {
    return value.replace(/[^\d+*#]/g, "");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function getHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.number === "string") : [];
    } catch {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
      return true;
    } catch {
      showToast("Could not save history in this browser.");
      return false;
    }
  }

  function addToHistory(number) {
    const items = getHistory();
    items.unshift({ number, timestamp: Date.now() });
    saveHistory(items);
    renderHistory();
  }

  function updateCallButton() {
    const number = normalizedForTel(input.value.trim());
    const valid = number.length > 0 && /\d/.test(number);
    callBtn.href = valid ? `tel:${number}` : "#";
    callBtn.classList.toggle("disabled", !valid);
    callBtn.setAttribute("aria-disabled", String(!valid));
    hint.textContent = valid ? "Ready to open your phone app" : "Enter a number to get started";
  }

  function setNumber(value) {
    input.value = digitsAndDialChars(value);
    updateCallButton();
  }

  function callNumber(number) {
    const clean = normalizedForTel(number);
    if (!clean || !/\d/.test(clean)) {
      showToast("Enter a valid phone number first.");
      return;
    }
    setNumber(number);
    addToHistory(clean);
    // A user click on this tel: link hands the call to the device's configured phone app.
    window.location.href = `tel:${clean}`;
  }

  function formatDate(timestamp) {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  }

  function renderHistory() {
    const items = getHistory();
    historyList.replaceChildren();
    emptyHistory.hidden = items.length > 0;
    historyList.hidden = items.length === 0;

    for (const item of items) {
      const row = document.createElement("div");
      row.className = "history-item";

      const icon = document.createElement("div");
      icon.className = "history-icon";
      icon.textContent = "↗";
      icon.setAttribute("aria-hidden", "true");

      const info = document.createElement("div");
      info.className = "history-info";

      const number = document.createElement("div");
      number.className = "history-number";
      number.textContent = item.number;

      const date = document.createElement("div");
      date.className = "history-date";
      date.textContent = formatDate(Number(item.timestamp) || Date.now());

      info.append(number, date);

      const dialAgain = document.createElement("button");
      dialAgain.className = "history-call";
      dialAgain.type = "button";
      dialAgain.textContent = "☎";
      dialAgain.setAttribute("aria-label", `Call ${item.number}`);
      dialAgain.addEventListener("click", () => {
        switchView("dialer");
        callNumber(item.number);
      });

      row.append(icon, info, dialAgain);
      historyList.append(row);
    }
  }

  function switchView(view) {
    const isDialer = view === "dialer";
    dialerView.hidden = !isDialer;
    historyView.hidden = isDialer;
    document.querySelectorAll(".tab").forEach(tab => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    if (!isDialer) renderHistory();
  }

  document.querySelectorAll(".key").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const current = input.value;
      setNumber(current.slice(0, start) + key + current.slice(end));
      const caret = Math.min(start + key.length, input.value.length);
      input.focus();
      try { input.setSelectionRange(caret, caret); } catch {}
    });
  });

  input.addEventListener("input", () => {
    const original = input.value;
    const clean = digitsAndDialChars(original);
    if (original !== clean) input.value = clean;
    updateCallButton();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    setNumber("");
    input.focus();
  });

  document.getElementById("backspaceBtn").addEventListener("click", () => {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    if (start !== end) {
      setNumber(input.value.slice(0, start) + input.value.slice(end));
      input.focus();
      try { input.setSelectionRange(start, start); } catch {}
    } else if (start > 0) {
      setNumber(input.value.slice(0, start - 1) + input.value.slice(end));
      input.focus();
      try { input.setSelectionRange(start - 1, start - 1); } catch {}
    }
  });

  callBtn.addEventListener("click", event => {
    const number = normalizedForTel(input.value.trim());
    if (!number || !/\d/.test(number)) {
      event.preventDefault();
      showToast("Enter a valid phone number first.");
      return;
    }
    // Add the attempt before navigation; this is not proof that the call connected.
    addToHistory(number);
  });

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (!getHistory().length) return;
    if (window.confirm("Clear all recent numbers saved by this website?")) {
      try { localStorage.removeItem(HISTORY_KEY); } catch {}
      renderHistory();
      showToast("Recent numbers cleared.");
    }
  });

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast("Use your browser menu and choose Add to Home screen.");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installBtn.hidden = true;
    showToast("Dial has been installed.");
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {
        // The website remains usable even if offline installation is unavailable.
      });
    });
  }

  updateCallButton();
  renderHistory();
})();
