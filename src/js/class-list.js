/**
 * BHS '86 Master Directory, Search & Gatekeeper Logic
 */

const CONFIG = {
  SHEET_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xDkTv8aIauGKKuiqZrHiC2RgOw0A4Nw3HnJkYQ3ES5kmbzxXM7mUker_v-WX1rt6rnnBwI6wQvcO/pub?gid=1741366949&single=true&output=csv",
  SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbzTgofUfnPz6tfIAys_trzbn56jesstiFIoCv3qJYLiwKw61O4vkXC9L6N2_UtV7T7h/exec",
  STORAGE_KEY: "bhs86_checked_in",
  ADMIN_FLAG: "checkin",
};

let classmates = [];
let selectedIndex = -1;

const placeholderHTML = `
    <div id="search-placeholder-text" class="py-6 px-2 text-left">
        <div class="max-w-2xl">
            <h5 class="text-gray-400 font-bold mb-3 uppercase tracking-wider text-xs">A Note on our Data</h5>
            <p class="text-gray-500 text-base leading-relaxed">
                We are working hard to track everyone down, but we aren't 100% certain about all our data.
                Most of this has been <span class="italic">crowd-sourced</span> from classmates like you.
            </p>
        </div>
    </div>`;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  initGatekeeper();
  await loadDirectoryData();
  if (document.getElementById("directorySearch")) initSearchLogic();
});

// --- GATEKEEPER & FORM HANDLER ---
function initGatekeeper() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get(CONFIG.ADMIN_FLAG) === "true") {
    setCheckInStatus(true);
  }
  if (getCheckInStatus()) {
    revealRSVPList(false);
  }
}

async function handleCheckIn(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector("button");

  submitBtn.innerText = "Unlocking...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.result === "success" || result.result === "redirect") {
      setCheckInStatus(true);
      revealRSVPList(true);

      if (result.result === "redirect") {
        setTimeout(() => window.open(result.url, "_blank"), 1000);
      }
    }
  } catch (error) {
    console.error("Submission failed", error);
    alert("Something went wrong. Please try again!");
    submitBtn.innerText = "Check In to See the List";
    submitBtn.disabled = false;
  }
}

function revealRSVPList(animate = true) {
  const blurOverlay = document.getElementById("checkin-form");
  const rsvpList = document.getElementById("rsvp-list-container");
  const rsvpListMask = document.getElementById("rsvp-list-mask");
  const rsvpListFader = document.getElementById("rsvp-list-fader");
  const subHeading = document.getElementById("whosComingSubheading");

  if (!rsvpList) return;

  if (subHeading) {
    subHeading.innerText =
      "Here is the current list of Yes, No, and Maybe responses.";
  }

  if (blurOverlay) {
    if (animate) {
      blurOverlay.style.transition = "opacity 0.5s ease";
      blurOverlay.style.opacity = "0";
      setTimeout(() => (blurOverlay.style.display = "none"), 500);
    } else {
      blurOverlay.style.display = "none";
    }
  }

  if (rsvpListFader) rsvpListFader.remove();

  rsvpList.style.filter = "none";
  rsvpList.classList.remove("h-full", "opacity-60", "select-none");
  rsvpList.classList.add("h-auto", "opacity-100");

  if (rsvpListMask) rsvpListMask.className = "relative";
}

// --- DATA PROCESSING ---
async function loadDirectoryData() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    ["list-yes", "list-maybe", "list-no"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    let countYes = 0,
      countMaybe = 0,
      countNo = 0;

    classmates = rows.map((row) => {
      const cols = row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());
      const fullName = `${cols[1] || ""} ${cols[2] || ""}`.trim();
      const rawStatus = (cols[12] || "not responded").toLowerCase().trim();

      let status = "not_responded";
      if (rawStatus === "yes") status = "yes";
      else if (rawStatus === "maybe") status = "maybe";
      else if (rawStatus === "no") status = "no";
      else if (rawStatus === "private") status = "private";

      if (fullName && status !== "not_responded" && status !== "private") {
        const listEl = document.getElementById(`list-${status}`);
        if (listEl) {
          const ele = document.createElement("div");
          ele.className =
            status === "yes"
              ? "inline-block bg-green-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm m-1"
              : "py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700 font-medium";
          ele.textContent = fullName;
          listEl.appendChild(ele);

          if (status === "yes") countYes++;
          if (status === "maybe") countMaybe++;
          if (status === "no") countNo++;
        }
      }

      return {
        name: fullName,
        status: status,
        hometown:
          cols[10] && cols[11] ? `${cols[10]}, ${cols[11]}` : cols[10] || null,
        photo: `/grad-thumbnails/${cols[13] || "default.png"}`,
        isPrivate: status === "private",
      };
    });

    updateCountDisplay("count-yes", countYes);
    updateCountDisplay("count-maybe", countMaybe);
    updateCountDisplay("count-no", countNo);

    if (document.getElementById("searchResults"))
      document.getElementById("searchResults").innerHTML = placeholderHTML;
  } catch (e) {
    console.error("Data load failed", e);
  }
}

// --- SEARCH & NAVIGATION ---
function initSearchLogic() {
  const input = document.getElementById("directorySearch");
  const dropdown = document.getElementById("autocompleteDropdown");
  const results = document.getElementById("searchResults");

  input.addEventListener("keydown", function (e) {
    const items = dropdown.querySelectorAll(".dropdown-item");
    const isVisible = !dropdown.classList.contains("hidden");

    if (e.key === "Escape") {
      this.value = "";
      dropdown.classList.add("hidden");
      results.innerHTML = placeholderHTML;
      selectedIndex = -1;
    } else if ((e.key === "ArrowDown" || e.key === "Tab") && isVisible) {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === "ArrowUp" && isVisible) {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === "Enter" && isVisible) {
      e.preventDefault();
      if (selectedIndex > -1) items[selectedIndex].click();
      else if (items.length === 1) items[0].click();
    }
  });

  input.addEventListener("input", function () {
    selectedIndex = -1;
    const term = this.value.toLowerCase().trim();
    if (!term) {
      dropdown.classList.add("hidden");
      results.innerHTML = placeholderHTML;
      return;
    }
    const matches = classmates
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 8);
    if (matches.length > 0) {
      dropdown.innerHTML = matches
        .map(
          (p) => `
        <div class="dropdown-item px-6 py-3 text-gray-800 hover:bg-gray-100 cursor-pointer border-b last:border-0 font-medium text-left"
             onclick="selectPerson('${p.name.replace(/'/g, "\\'")}')">
          ${p.name}
        </div>`,
        )
        .join("");
      dropdown.classList.remove("hidden");
    } else {
      dropdown.classList.add("hidden");
    }
  });
}

function updateHighlight(items) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("bg-gray-700", "text-white");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("bg-gray-700", "text-white");
    }
  });
}

window.selectPerson = function (name) {
  const p = classmates.find((c) => c.name === name);
  if (!p) return;
  document.getElementById("directorySearch").value = name;
  document.getElementById("autocompleteDropdown").classList.add("hidden");

  const themes = {
    yes: { label: "Attending", colors: "bg-green-800 text-white" },
    maybe: {
      label: "Maybe",
      colors: "bg-amber-50 text-amber-700 border-amber-200",
    },
    no: {
      label: "Not Attending",
      colors: "bg-red-50 text-red-700 border-red-200",
    },
    private: {
      label: "Private",
      colors: "bg-purple-100 text-purple-700 border-purple-200",
    },
    not_responded: {
      label: "Not Responded",
      colors: "bg-slate-100 text-slate-600",
    },
  };
  const t = themes[p.status] || themes.not_responded;
  const hometownHTML =
    !p.isPrivate && p.hometown
      ? `<p class="mt-4 text-slate-600"><span class="font-bold text-slate-800">Hometown:</span> ${p.hometown}</p>`
      : "";

  document.getElementById("searchResults").innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto mt-6 text-left">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <img src="${p.photo}" class="w-40 h-40 rounded-xl object-cover shadow-md border-4 border-white">
          <div class="flex-1">
            <h4 class="text-3xl font-bold text-green-800 mb-4">${p.name}</h4>
            <span class="inline-flex px-4 py-1 rounded-full text-sm font-bold border ${t.colors}">${t.label}</span>
            ${hometownHTML}
          </div>
        </div>
      </div>`;
};

// --- STORAGE ---
function updateCountDisplay(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = `(${count})`;
}

function setCheckInStatus(status) {
  localStorage.setItem(CONFIG.STORAGE_KEY, status ? "true" : "false");
}

function getCheckInStatus() {
  const modernStatus = localStorage.getItem(CONFIG.STORAGE_KEY) === "true";
  const legacyStatus = localStorage.getItem("bhs86_visited") === "true";
  if (legacyStatus && !modernStatus) setCheckInStatus(true);
  return modernStatus || legacyStatus;
}
