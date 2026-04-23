/**
 * BHS '86 Class List & Privacy Gate Logic
 */

const CONFIG = {
  SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbzTgofUfnPz6tfIAys_trzbn56jesstiFIoCv3qJYLiwKw61O4vkXC9L6N2_UtV7T7h/exec",
  STORAGE_KEY: "bhs86_checked_in",
  ADMIN_FLAG: "checkin",
};

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  initGatekeeper();
});

/**
 * Checks for previous check-ins, legacy cookies, or URL overrides
 */
function initGatekeeper() {
  const urlParams = new URLSearchParams(window.location.search);

  // 1. Check for ?checkin=true in URL (Admin/Testing Override)
  if (urlParams.get(CONFIG.ADMIN_FLAG) === "true") {
    setCheckInStatus(true);
  }

  // 2. Check for modern status OR legacy "visited" cookie
  if (getCheckInStatus()) {
    revealRSVPList(false); // Instant reveal for returning users
  }
}

/**
 * Handle the form submission
 */
async function handleCheckIn(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector("button");

  // UI Feedback
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
      revealRSVPList(true); // Animated reveal

      // Handle Zeffy/RSVP Redirect
      if (result.result === "redirect") {
        setTimeout(() => {
          window.open(result.url, "_blank");
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Submission failed", error);
    alert("Something went wrong. Please try again!");
    submitBtn.innerText = "Check In to See the List";
    submitBtn.disabled = false;
  }
}

/**
 * Removes blurs and layout constraints from the RSVP list
 */
function revealRSVPList(animate = true) {
  const blurOverlay = document.getElementById("checkin-form");
  const rsvpList = document.getElementById("rsvp-list-container");
  const rsvpListMask = document.getElementById("rsvp-list-mask");
  const rsvpListFader = document.getElementById("rsvp-list-fader");
  const subHeading = document.getElementById("whosComingSubheading");

  if (!rsvpList) return;

  // 1. Update Subheading
  if (subHeading) {
    subHeading.innerText =
      "Here is the current list of Yes, No, and Maybe responses.";
  }

  // 2. Clear Animations/Overlays
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

  // 3. Reset Layout Classes
  // "Nuclear" reset to ensure absolute/hidden constraints are gone
  rsvpList.style.filter = "none";
  rsvpList.classList.remove("h-full", "opacity-60", "select-none");
  rsvpList.classList.add("h-auto", "opacity-100");

  if (rsvpListMask) {
    rsvpListMask.className = "relative";
  }
}

/**
 * LocalStorage Helpers
 */
function setCheckInStatus(status) {
  localStorage.setItem(CONFIG.STORAGE_KEY, status ? "true" : "false");
}

/**
 * LocalStorage Helpers - Now checks legacy flag
 */
function getCheckInStatus() {
  const modernStatus = localStorage.getItem(CONFIG.STORAGE_KEY) === "true";
  const legacyStatus = localStorage.getItem("bhs86_visited") === "true";

  // If they have the legacy status but not the new one,
  // sync it up so we can eventually phase out the old key.
  if (legacyStatus && !modernStatus) {
    setCheckInStatus(true);
  }

  return modernStatus || legacyStatus;
}
