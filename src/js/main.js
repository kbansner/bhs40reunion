import "./jquery-global.js";
import { loadPins } from "./map-logic.js";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz-4_TFUdayT9nobqg4RilTTZSSwAobRNa5HRhHO2PyeZIWcIvOfMXWEZe_hBWWKzXz/exec";

// --- 0. THE GOOGLE MAPS FIX ---
window.initMap = function () {
  console.log("Google Maps API is calling initMap...");
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.warn("Map element not found on this page.");
    return;
  }

  const map = new google.maps.Map(mapElement, {
    center: { lat: 37.8715, lng: -122.273 }, // Berkeley High
    zoom: 12,
    mapId: "BHS_REUNION_MAP",
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  loadPins(map);
};

window.addEventListener("DOMContentLoaded", function () {
  const currentUrl = encodeURIComponent(window.location.href);
  const shareMessage = encodeURIComponent(
    "Check out the Berkeley High Class of '86 40th Reunion! Help us make it happen: ",
  );

  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.href = `mailto:?subject=BHS Class of '86 Reunion&body=${shareMessage}${currentUrl}`;
  }

  const smsLink = document.querySelector('a[href^="sms:"]');
  if (smsLink) {
    smsLink.href = `sms:?&body=${shareMessage}${currentUrl}`;
  }

  const fbLink = document.querySelector('a[href*="facebook.com/sharer"]');
  if (fbLink) {
    fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
  }
});

window.sendEmail = (name) => {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7";
  const subject = encodeURIComponent(
    "BHS Class of '86 Reunion - We're Looking for You!",
  );
  const body = encodeURIComponent(
    `Hi ${name.split(",")[1] ? name.split(",")[1].trim() : name},\n\n` +
      `The Berkeley High School Class of 1986 is planning our 40th reunion for October 2026!\n\n` +
      `We'd love to have you join us. Please check-in with this quick questionnaire so we can keep you in the loop:\n` +
      `  ${questionnaireUrl}\n\n` +
      `Hope to see you there!\n\n` +
      `- BHS Class of '86 Reunion Committee\n` +
      `  bhs40reunion.com`,
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

window.sendSMS = (name) => {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7";
  const firstName = name.split(",")[1] ? name.split(",")[1].trim() : name;
  const message = encodeURIComponent(
    `Hi ${firstName}! BHS Class of '86 here. We're planning our 40th reunion (Oct 2026) and would love to have you join! ` +
      `Fill out our quick questionnaire: ${questionnaireUrl} ` +
      `or visit our website: bhs40reunion.com/`,
  );

  window.location.href = `sms:?&body=${message}`;
};

window.submitInfo = function (name, uid) {
  const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeUCK2CHwM4sf2Y7YcxJh2EaqiuIWXf2DWIiUBRrGbYeEOxag/viewform?usp=pp_url&entry.1936296006=${name}&entry.1741703138=${uid}`;
  window.open(formUrl, "_blank");
};

window.fetchReunionStats = async function () {
  const chartCanvas = document.getElementById("momentumChart");
  if (!chartCanvas) return;

  const skeleton = document.getElementById("chart-skeleton");
  const syncTimestamp = document.getElementById("sync-timestamp");
  const chartTitle = document.querySelector("#momentum-section h2");
  const missingCountDisplay = document.querySelectorAll(
    ".missing-count-display",
  );

  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const stats = await response.json();

    const missingJacketsCount = stats.missingJackets || 351;
    if (missingCountDisplay) {
      missingCountDisplay.forEach((el) => {
        el.innerText = missingJacketsCount;
      });
    }

    document.getElementById("countdown-display").innerText =
      stats.daysRemaining;
    const rsvpCount = stats.rsvps;
    const goal = stats.goal;
    const pct = stats.percentage * 100;

    document.getElementById("rsvp-label").innerText = `${rsvpCount} RSVPs`;
    document.getElementById("goal-label").innerText = `Headcount Goal ${goal}`;
    document.getElementById("progress-bar-fill").style.width = `${pct}%`;

    const percentElements = document.querySelectorAll(".percent-reachable");
    percentElements.forEach((el) => {
      el.innerText = `${pct.toFixed(1)}%`;
    });

    if (syncTimestamp && stats.lastUpdated) {
      syncTimestamp.innerText = `Synced at ${stats.lastUpdated}`;
    }

    const trendData = stats.weeklyTrends;
    const latestCount = trendData[trendData.length - 1].count;
    const target = 25;

    if (latestCount >= target && chartTitle) {
      chartTitle.classList.remove("text-bhs-green");
      chartTitle.classList.add("text-green-600");
      if (!chartTitle.innerText.includes("🎉")) chartTitle.innerText += " 🎉";
    }

    if (typeof Chart !== "undefined") {
      const ctx = chartCanvas.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: trendData.map((t) => `Week ${t.week}`),
          datasets: [
            {
              label: "Actual Check-ins",
              data: trendData.map((t) => t.count),
              backgroundColor: trendData.map((t, i) => {
                if (i === trendData.length - 1) {
                  return t.count >= target ? "#16a34a" : "#2D5A27";
                }
                return "#741b47";
              }),
              borderRadius: 6,
              order: 2,
            },
            {
              label: "Weekly Target",
              data: new Array(trendData.length).fill(target),
              type: "line",
              borderColor: "#cbd5e1",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              borderWidth: 2,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f8fafc" },
              suggestedMax: 35,
            },
            x: { grid: { display: false } },
          },
        },
      });
    } else {
      console.warn("Chart.js not loaded yet. Retrying in 500ms...");
      if (typeof chartRetryCount === "undefined") window.chartRetryCount = 0;
      if (window.chartRetryCount < 3) {
        window.chartRetryCount++;
        setTimeout(window.fetchReunionStats, 1000);
      }
    }

    chartCanvas.classList.add("chart-loaded");
    if (skeleton) {
      skeleton.style.opacity = "0";
      setTimeout(() => {
        skeleton.style.display = "none";
      }, 100);
    }
  } catch (error) {
    console.error("Dashboard Sync Failed:", error);
    if (skeleton) {
      skeleton.innerHTML = `<div class="p-4 text-center">Sync Failed. <button onclick="location.reload()">Retry</button></div>`;
    }
  }
};

function handleScroll() {
  const stickyNav = document.getElementById("sticky-nav");
  if (stickyNav) {
    if (window.scrollY > 300) {
      stickyNav.classList.remove("-translate-y-full", "opacity-0");
      stickyNav.classList.add("translate-y-0", "opacity-100");
    } else {
      stickyNav.classList.add("-translate-y-full", "opacity-0");
      stickyNav.classList.remove("translate-y-0", "opacity-100");
    }
  }
}

(() => {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// --- REFACTORED REQUEST LINE INTERFACES ---
document.addEventListener("DOMContentLoaded", async () => {
  const wallCanvas = document.getElementById("wall-canvas");
  const notesContainer = document.getElementById("notes-container");
  if (!wallCanvas || !notesContainer) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".absolute").forEach((note) => {
            setTimeout(
              () => {
                note.style.top = `${note.dataset.targetTop}%`;
                note.style.opacity = "1";
                note.style.transform = `translate(-50%, -50%) rotate(${note.dataset.rotation}deg) scale(1)`;
              },
              parseInt(note.dataset.delay) || 0,
            );
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    const liveNotes = (data.notes || []).filter(
      (note) =>
        note.type === "neon-pink" ||
        note.type === "scrap" ||
        note.type === "post-it",
    );

    const isMobile = window.innerWidth < 768;

    // 1. Distribute active sheets cleanly via a Fermat Spiral pattern
    liveNotes.forEach((note, index) => {
      const div = createNoteElement(note);
      if (!div) return;

      const goldenAngle = 2.39996;

      // Scales tailored specifically to canvas width ratios
      const baseScale = isMobile ? 80 : 140;
      const damping = isMobile ? 0.03 : 0.04;
      const spacingScale = baseScale / (1 + index * damping);

      const radius = Math.sqrt(index + 1) * spacingScale;
      const angle = index * goldenAngle;

      const aspectXFactor = isMobile ? 1.8 : 1.4;
      const aspectYFactor = isMobile ? 0.8 : 0.95;

      // 16.66% centers the initial spiral point behind the jukebox player inside the first 100vw panel on mobile
      // FIX: Changed the mobile divisor from 2.2 to 1.0 to compress the horizontal spiral spread
      let left =
        45 + (Math.cos(angle) * radius * aspectXFactor) / (isMobile ? 6 : 7);
      let top =
        50 + (Math.sin(angle) * radius * aspectYFactor) / (isMobile ? 7 : 10);

      if (!isMobile) {
        left += Math.sin(index * 4.5) * 3;
        top += Math.cos(index * 7.2) * 3;
      }

      // Clamping limits adjusted to accommodate the full wider canvas panel
      left = Math.max(isMobile ? 2 : 5, Math.min(isMobile ? 96 : 95, left));
      top = Math.max(isMobile ? 14 : 12, Math.min(isMobile ? 86 : 88, top));

      const rotation = Math.floor(Math.random() * 20) - 10;
      setupInitialStyles(div, top, left, rotation, index);

      notesContainer.appendChild(div);
      addDragLogic(div, wallCanvas, note);
    });

    // 2. Append the Blank Trigger Button last to claim natural top paint ordering
    const addMemoryTrigger = { type: "blank", text: "Add Your Request!" };
    const triggerDiv = createNoteElement(addMemoryTrigger);
    if (triggerDiv) {
      triggerDiv.id = "blankNote";
      // Render the call-to-action note cleanly below the player view space on startup
      setupInitialStyles(
        triggerDiv,
        78,
        isMobile ? 50 : 80,
        0,
        liveNotes.length,
      );
      notesContainer.appendChild(triggerDiv);
      addDragLogic(triggerDiv, wallCanvas, addMemoryTrigger);
    }

    observer.observe(notesContainer);
  } catch (error) {
    console.error("Failed to load notes:", error);
    const fallbackTrigger = { type: "blank", text: "Add Your Request!" };
    const div = createNoteElement(fallbackTrigger);
    if (div) {
      div.id = "blankNote";
      setupInitialStyles(div, 75, window.innerWidth < 768 ? 16.66 : 50, 0, 0);
      notesContainer.appendChild(div);
      addDragLogic(div, wallCanvas, fallbackTrigger);
    }
  }
});

function setupInitialStyles(el, top, left, rotation, index) {
  el.style.left = `${left}%`;
  el.style.top = `${top}%`;

  // translate(-50%, -50%) aligns geometric positions exactly from the center coordinate paths
  el.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
  el.classList.add("note-resting");
}

function getNoteStyles(note) {
  const base =
    "absolute pointer-events-auto cursor-pointer transition-all duration-300 transform p-3 shadow-lg hover:shadow-2xl flex flex-col items-start ";

  switch (note.type) {
    case "post-it":
      return (
        base +
        "note-resting bg-yellow-200 w-48 h-48 text-slate-800 shadow-md hover:z-50"
      );

    case "neon-pink":
      return (
        base +
        "note-resting bg-pink-400 w-48 h-48 text-white font-bold shadow-md hover:z-50"
      );

    case "scrap":
      if (note.variant === "legal") {
        return (
          base +
          "note-resting bg-yellow-100 border-t-8 border-yellow-400 w-72 min-h-[350px] bg-[linear-gradient(#94d2ff_1px,transparent_1px)] bg-[size:100%_1.2rem] text-[15px] leading-[1.2rem] text-slate-800  hover:z-50"
        );
      }
      return (
        base +
        "note-resting bg-white border-l-4 border-red-400 w-64 min-h-[160px] shadow-sm text-slate-800 hover:z-50"
      );

    case "blank":
      return (
        base +
        "note-permanent-top bg-slate-800 border-2 border-dashed border-white/30 w-48 h-28 items-center justify-center text-white/40 hover:border-white/60 hover:text-white/80 hover:bg-slate-700 transition-all"
      );

    default:
      return base + "note-resting bg-white w-52 h-52 text-slate-800 hover:z-50";
  }
}

const modal = document.getElementById("note-modal");

function openNoteModal() {
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closeNoteModal() {
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
  document.getElementById("note-input").value = "";
  document.getElementById("author-input").value = "";
}

document
  .getElementById("close-modal")
  .addEventListener("click", closeNoteModal);

let selectedType = "song";

window.setNoteType = function (type) {
  selectedType = type;
  const songBtn = document.getElementById("btn-song");
  const suggBtn = document.getElementById("btn-suggestion");

  if (type === "song") {
    songBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-blue-400 bg-blue-50 text-blue-700 text-sm font-bold transition-all";
    suggBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-slate-300 text-slate-500 text-sm transition-all";
  } else {
    suggBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-sm font-bold transition-all";
    songBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-slate-300 text-slate-500 text-sm transition-all";
  }
};

const noteForm = document.getElementById("note-form");

if (noteForm) {
  noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("note-input").value.trim();
    const author = document.getElementById("author-input").value.trim();
    if (!text) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Pinning...";
    submitBtn.disabled = true;

    let noteType;
    let variant = null;

    if (selectedType === "song") {
      noteType = "neon-pink";
      variant = text.length > 110 ? "legal" : null;
    } else {
      if (text.length < 70) {
        noteType = "post-it";
      } else if (text.length >= 70 && text.length <= 110) {
        noteType = "scrap";
        variant = null;
      } else {
        noteType = "scrap";
        variant = "legal";
      }
    }

    const newNote = { text, author, type: noteType, variant };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(newNote),
      });

      spawnNewNote(newNote);
      submitBtn.innerText = "Pinned!";

      setTimeout(() => {
        closeNoteModal();
        submitBtn.innerText = "Pin it!";
        submitBtn.disabled = false;
        noteForm.reset();
      }, 1000);
    } catch (err) {
      console.error("Save failed:", err);
      submitBtn.disabled = false;
    }
  });
}

function spawnNewNote(noteData) {
  const container = document.getElementById("notes-container");
  const wallCanvas = document.getElementById("wall-canvas");
  if (!container || !wallCanvas) return;

  const div = createNoteElement(noteData);
  const isMobile = window.innerWidth < 768;

  // Spawns items nearby the active viewing sector matrix
  const left = isMobile
    ? Math.floor(Math.random() * 20) + 8
    : Math.floor(Math.random() * 30) + 35;
  const top = Math.floor(Math.random() * 30) + 25;
  const rotation = Math.floor(Math.random() * 20) - 10;

  setupInitialStyles(div, top, left, rotation, 0);
  div.style.zIndex = "100";

  container.appendChild(div);
  addDragLogic(div, wallCanvas, noteData);
}

function addDragLogic(div, wall, note) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const getEventCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onStart = (e) => {
    if (e.target.closest(".dismiss-btn")) return;
    if (note && note.type === "blank") {
      if (typeof openNoteModal === "function") openNoteModal();
      return;
    }

    if (window.getSelection) window.getSelection().removeAllRanges();
    div.style.userSelect = "none";
    div.style.webkitUserSelect = "none";

    isDragging = true;
    div.style.cursor = "grabbing";
    div.style.transition = "none";

    const coords = getEventCoords(e);

    // --- FIX 1: RECORD THE STABLE PAGE MOUSE COORDINATES ---
    startX = coords.pageX || coords.x + window.scrollX;
    startY = coords.pageY || coords.y + window.scrollY;

    // --- FIX 2: READ RE-RENDER PROFILES DIRECTLY FROM THE DOM COMPONENT ---
    // offsetLeft/Top look at the direct parent element context layout position,
    // which completely ignores sticky navbars, viewports, or window scrolling gaps.
    initialLeft = div.offsetLeft;
    initialTop = div.offsetTop;

    if (typeof setNoteActive === "function") setNoteActive(div);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const coords = getEventCoords(e);
    const wallRect = wall.getBoundingClientRect();

    // Track current mouse position on the document page
    const currentX = coords.pageX || coords.x + window.scrollX;
    const currentY = coords.pageY || coords.y + window.scrollY;

    // Calculate mouse travel distances
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // --- FIX 3: ADD TRAVEL DELTAS STRAIGHT TO THE STABLE LAYOUT ANCHORS ---
    let currentLeftPx = initialLeft + deltaX;
    let currentTopPx = initialTop + deltaY;

    // Convert pixel coordinates cleanly into stable wall percentages
    let newLeftPct = (currentLeftPx / wallRect.width) * 100;
    let newTopPct = (currentTopPx / wallRect.height) * 100;

    // Bound limits to keep notes safely inside your board fields
    newLeftPct = Math.max(0.5, Math.min(98.5, newLeftPct));
    newTopPct = Math.max(2, Math.min(94, newTopPct));

    div.style.left = `${newLeftPct}%`;
    div.style.top = `${newTopPct}%`;
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    div.style.cursor = "grab";

    // Re-enable smooth transition vectors on release
    div.style.transition =
      "transform 0.3s ease, box-shadow 0.3s ease, top 0.5s ease, left 0.5s ease";

    div.style.userSelect = "";
    div.style.webkitUserSelect = "";

    if (typeof setNoteResting === "function") setNoteResting(div);
  };

  // Desktop Mouse Triggers
  div.addEventListener("mousedown", onStart);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);

  // Mobile Touch Triggers
  div.addEventListener("touchstart", onStart, { passive: false });
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
}

function setNoteActive(el) {
  if (el.id === "blankNote") return;
  const blankNote = document.getElementById("blankNote");

  el.classList.remove("note-resting", "hover:z-50");
  el.classList.add("note-active");

  if (blankNote) {
    blankNote.style.zIndex = "1";
    blankNote.style.pointerEvents = "none";
  }
}

function setNoteResting(el) {
  if (el.id === "blankNote") return;
  const blankNote = document.getElementById("blankNote");

  el.classList.remove("note-active");
  el.classList.add("note-resting", "hover:z-50");

  if (blankNote) {
    blankNote.style.zIndex = "";
    blankNote.style.pointerEvents = "auto";
  }
}

function createNoteElement(note) {
  const storageId = `hid-note-${note.id || note.text.substring(0, 12)}`;
  if (localStorage.getItem(storageId)) return null;

  const div = document.createElement("div");
  // Restores your original theme engine switcher cleanly
  div.className = `${getNoteStyles(note)} group relative`;

  div.innerHTML = `
    ${
      note.type !== "blank"
        ? `
      <button class="dismiss-btn absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/5 hover:bg-red-500 hover:text-white rounded-full text-xs font-sans transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 pointer-events-auto z-50" title="Dismiss note">
        ✕
      </button>
    `
        : ""
    }
    <div class="h-full w-full flex flex-col p-1 overflow-y-auto scrollbar-hide select-none">
      <p class="text-lg leading-snug w-full font-handwriting whitespace-pre-wrap">${note.text}</p>
      ${note.author ? `<p class="text-sm mt-auto pt-4 text-right italic opacity-80 w-full font-handwriting">- ${note.author}&nbsp;&nbsp;</p>` : ""}
    </div>
  `;

  div.style.position = "absolute";

  div.addEventListener("mouseenter", () => setNoteActive(div));
  div.addEventListener("mouseleave", () => setNoteResting(div));

  // Dismiss Action Handler (Supports both Desktop Clicks and Mobile Taps)
  const handleDismiss = (e) => {
    e.stopPropagation();
    e.preventDefault();
    div.style.transform = "translate(-50%, -50%) scale(0) rotate(15deg)";
    div.style.opacity = "0";
    localStorage.setItem(storageId, "true");
    setTimeout(() => div.remove(), 300);
  };

  const closeBtn = div.querySelector(".dismiss-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", handleDismiss);
    closeBtn.addEventListener("touchstart", handleDismiss, { passive: false });
  }

  return div;
}

// Run as soon as the DOM layout is ready
document.addEventListener("DOMContentLoaded", () => {
  const requestLine = document.getElementById("request-line");

  if (requestLine) {
    // Calculate 1/3rd of the total 300vw width to find the middle pane
    const middlePanelOffset = window.innerWidth;

    // Smoothly glide or instantly snap the scroller to the center
    requestLine.scrollLeft = middlePanelOffset;
  }
});
