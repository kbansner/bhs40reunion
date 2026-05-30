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
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const stats = await response.json();
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
  } catch (error) {
    console.error("Dashboard Sync Failed:", error);
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

  let animationTriggered = false;

  const checkScrollVisibility = () => {
    if (animationTriggered) return;

    const rect = notesContainer.getBoundingClientRect();
    const isVisibleInViewport =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisibleInViewport && rect.top < window.innerHeight - 50) {
      animationTriggered = true;

      const notes = notesContainer.querySelectorAll(".absolute");

      notes.forEach((note, index) => {
        const staggerDelay = 200 + index * 100;
        note.style.transitionDelay = `${staggerDelay}ms`;
      });

      notesContainer.classList.add("is-visible");
      window.removeEventListener("scroll", checkScrollVisibility);
    }
  };

  window.addEventListener("scroll", checkScrollVisibility);

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

    liveNotes.forEach((note, index) => {
      const div = createNoteElement(note);
      if (!div) return;

      const goldenAngle = 2.39996;
      const baseScale = isMobile ? 80 : 140;
      const damping = isMobile ? 0.03 : 0.04;
      const spacingScale = baseScale / (1 + index * damping);

      const radius = Math.sqrt(index + 1) * spacingScale;
      const angle = index * goldenAngle;

      const aspectXFactor = isMobile ? 1.8 : 1.4;
      const aspectYFactor = isMobile ? 0.8 : 0.95;

      let left =
        50 + (Math.cos(angle) * radius * aspectXFactor) / (isMobile ? 6 : 7);
      let top =
        50 + (Math.sin(angle) * radius * aspectYFactor) / (isMobile ? 7 : 10);

      if (!isMobile) {
        left += Math.sin(index * 4.5) * 3;
        top += Math.cos(index * 7.2) * 3;
      }

      left = Math.max(isMobile ? 2 : 5, Math.min(isMobile ? 96 : 95, left));
      top = Math.max(isMobile ? 14 : 12, Math.min(isMobile ? 86 : 88, top));

      const rotation = Math.floor(Math.random() * 20) - 10;
      setupInitialStyles(div, top, left, rotation, index);

      notesContainer.appendChild(div);
      addDragLogic(div, wallCanvas, note);
    });

    // Append Blank Trigger Button
    const addMemoryTrigger = { type: "blank", text: "Add Your Request!" };
    const triggerDiv = createNoteElement(addMemoryTrigger);
    if (triggerDiv) {
      triggerDiv.id = "blankNote";
      setupInitialStyles(
        triggerDiv,
        78,
        isMobile ? 50 : 80,
        0,
        0, // Set index to 0 so it loads without delay multipliers
      );
      notesContainer.appendChild(triggerDiv);
      addDragLogic(triggerDiv, wallCanvas, addMemoryTrigger);
    }

    setTimeout(checkScrollVisibility, 50);
  } catch (error) {
    console.error("Failed to load notes:", error);
    const fallbackTrigger = { type: "blank", text: "Add Your Request!" };
    const div = createNoteElement(fallbackTrigger);
    if (div) {
      div.id = "blankNote";
      setupInitialStyles(div, 75, isMobile ? 50 : 50, 0, 0);
      notesContainer.appendChild(div);
      addDragLogic(div, wallCanvas, fallbackTrigger);
    }
    setTimeout(checkScrollVisibility, 50);
  }
});

function setupInitialStyles(el, top, left, rotation, index) {
  el.style.left = `${left}%`;
  el.style.top = `${top}%`;
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
        "note-resting bg-pink-400 w-42 h-39 text-white font-bold shadow-md hover:z-50"
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
        base + // FIXED: Concatenates "absolute" to register properly under layout triggers
        "note-permanent-top bg-slate-800 border-2 border-dashed border-white/30 w-48 h-28 items-center justify-center text-white/40 hover:border-white/60 hover:text-white/80 hover:bg-slate-700 transition-all z-50"
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
    startX = coords.pageX || coords.x + window.scrollX;
    startY = coords.pageY || coords.y + window.scrollY;

    initialLeft = div.offsetLeft;
    initialTop = div.offsetTop;

    if (typeof setNoteActive === "function") setNoteActive(div);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const coords = getEventCoords(e);
    const wallRect = wall.getBoundingClientRect();

    const currentX = coords.pageX || coords.x + window.scrollX;
    const currentY = coords.pageY || coords.y + window.scrollY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    let currentLeftPx = initialLeft + deltaX;
    let currentTopPx = initialTop + deltaY;

    let newLeftPct = (currentLeftPx / wallRect.width) * 100;
    let newTopPct = (currentTopPx / wallRect.height) * 100;

    newLeftPct = Math.max(0.5, Math.min(98.5, newLeftPct));
    newTopPct = Math.max(2, Math.min(94, newTopPct));

    div.style.left = `${newLeftPct}%`;
    div.style.top = `${newTopPct}%`;
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    div.style.cursor = "grab";
    div.style.transition =
      "transform 0.3s ease, box-shadow 0.3s ease, top 0.5s ease, left 0.5s ease";

    div.style.userSelect = "";
    div.style.webkitUserSelect = "";

    if (typeof setNoteResting === "function") setNoteResting(div);
  };

  div.addEventListener("mousedown", onStart);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);

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
  div.className = `${getNoteStyles(note)} group relative`;

  div.innerHTML = `
    ${
      note.type !== "blank"
        ? `
      <button class="dismiss-btn absolute top-4 -right-3 w-7 h-7 flex items-center justify-center bg-black/5 hover:bg-red-500 hover:text-white rounded-full text-xs font-sans transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 pointer-events-auto z-50" title="Dismiss note">✕</button>
    `
        : ""
    }
    <div class="h-full w-full flex flex-col p-1 overflow-y-auto scrollbar-hide select-none">
      <p class="text-lg leading-snug w-full font-handwriting whitespace-pre-wrap">${note.text}</p>
      ${note.author && note.author.trim() ? `<p class="text-sm mt-auto pt-4 text-right italic opacity-80 w-full font-handwriting">- ${note.author}&nbsp;&nbsp;</p>` : ""}
    </div>
  `;

  div.style.position = "absolute";

  div.addEventListener("mouseenter", () => setNoteActive(div));
  div.addEventListener("mouseleave", () => setNoteResting(div));

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

document.addEventListener("DOMContentLoaded", () => {
  const requestLine = document.getElementById("request-line");
  if (requestLine) {
    const middlePanelOffset = window.innerWidth;
    requestLine.scrollLeft = middlePanelOffset;
  }
});
