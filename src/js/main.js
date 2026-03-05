// Sticky Navigation - Show/Hide on Scroll
(function () {
  const stickyNav = document.getElementById("sticky-nav");
  let lastScrollY = window.scrollY;

  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Show sticky nav after scrolling 300px
    if (currentScrollY > 300) {
      stickyNav.classList.add("visible");
    } else {
      stickyNav.classList.remove("visible");
    }

    lastScrollY = currentScrollY;
  }

  // Throttle scroll event for performance
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// Update share links with current URL (runs after page load)
window.addEventListener("DOMContentLoaded", function () {
  const currentUrl = encodeURIComponent(window.location.href);
  const shareMessage = encodeURIComponent(
    "Check out the Berkeley High Class of '86 40th Reunion! Help us make it happen: ",
  );

  // Update email link
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.href = `mailto:?subject=BHS Class of '86 Reunion&body=${shareMessage}${currentUrl}`;
  }

  // Update SMS link
  const smsLink = document.querySelector('a[href^="sms:"]');
  if (smsLink) {
    smsLink.href = `sms:?&body=${shareMessage}${currentUrl}`;
  }

  // Update Facebook link
  const fbLink = document.querySelector('a[href*="facebook.com/sharer"]');
  if (fbLink) {
    fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
  }
});

// src/main.js
//
import "./jquery-global.js"; // Vite pulls the code in right here
import { loadPins } from "./map-logic.js"; // We'll put the heavy lifting here

window.initMap = function () {
  // 1. Create the Map instance
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.5584, lng: -71.2689 }, // Billerica area
    zoomControl: true, // This forces the +/- buttons to show
    zoom: 6,
    mapId: "BHS_MAP_ID", // Optional: for custom styling
  });

  // 2. Start loading the pins from your Google Sheet
  loadPins(map);
};
