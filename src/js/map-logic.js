// src/map-logic.js
import "sheetrock";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1vzSMuzoYv9H40xQmpXCjHALZmx3ALnb9WH-musGAvqo/gviz/tq?tqx=out:csv&gid=2122626799";

export function loadPins(map) {
  const bounds = new google.maps.LatLngBounds();

  window.$("#map").sheetrock({
    url: SHEET_URL,
    // Step 1: Update query to include columns E (Lat) and F (Lng)
    query: "select A, B, C, D, E, F",
    callback: function (error, options, response) {
      if (error) {
        console.error("Sheetrock Error:", error);
        return;
      }

      if (!response.rows || response.rows.length <= 1) {
        console.warn("No data rows found in Google Sheet.");
        return;
      }

      response.rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row

        const name = row.cellsArray[0];
        const rsvp = row.cellsArray[1] || "";
        const location = row.cellsArray[2];
        const note = row.cellsArray[3] || "";

        // Step 2: Grab the cached coordinates directly from the row data
        const lat = parseFloat(row.cellsArray[4]); // Column E
        const lng = parseFloat(row.cellsArray[5]); // Column F

        // Check if the numbers exist
        if (!isNaN(lat) && !isNaN(lng)) {
          const jitterLat = (Math.random() - 0.5) * 0.15; // Set back to your preferred jitter
          const jitterLng = (Math.random() - 0.5) * 0.15;
          const finalPos = { lat: lat + jitterLat, lng: lng + jitterLng };

          // Determine Color
          let pinColor = "#808080";
          const rsvpLower = rsvp.toLowerCase();

          if (rsvpLower.includes("yes")) {
            pinColor = "#006400"; // BHS Green
          } else if (rsvpLower.includes("no")) {
            pinColor = "#808080"; // Grey
          } else if (rsvpLower.includes("maybe")) {
            pinColor = "#ffcc00"; // Gold
          }

          // Create the Marker
          const marker = new google.maps.Marker({
            map: map,
            position: finalPos,
            title: name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: pinColor,
              fillOpacity: 0.9,
              scale: 8,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });

          // InfoWindow Setup
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 5px; color: #333;">
                <strong style="font-size: 18px;">${name}</strong><br>
                <span style="font-size: 12px;">Attending: ${rsvp}</span><br>
                <small style="color: #666;">${location}</small>
                ${note ? `<p style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 5px;"><em>"${note}"</em></p>` : ""}
              </div>`,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));

          bounds.extend(finalPos);
          map.fitBounds(bounds);
        } else {
          console.warn(`Skipping ${name}: No Lat/Lng data found in Sheet.`);
        }
      });
    },
  });
}
