let classmates = [];
let selectedIndex = -1;

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xDkTv8aIauGKKuiqZrHiC2RgOw0A4Nw3HnJkYQ3ES5kmbzxXM7mUker_v-WX1rt6rnnBwI6wQvcO/pub?gid=1741366949&single=true&output=csv";

// HTML for the informational disclaimer shown when search is empty
const placeholderHTML = `
    <div id="search-placeholder-text" class="py-6 px-2">
        <div class="max-w-2xl">
            <h5 class="text-gray-400 font-bold mb-3 uppercase tracking-wider text-xs">A Note on our Data</h5>
            <p class="text-gray-500 text-base leading-relaxed">
                We are working hard to track everyone down, but we aren't 100% certain about all our data.
                Most of this has been <span class="italic">crowd-sourced</span> from classmates like you.
            </p>
            <p class="text-gray-500 text-base mt-4 leading-relaxed">
                If you see a mistake, please accept our apologies and help us correct it!
                And if your photo is missing, please send one to
                <a href="mailto:photos@bhs40.com" class="text-yellow-500 hover:underline font-medium">photos@bhs40.com</a>.
            </p>
        </div>
    </div>`;

async function loadDirectoryData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    classmates = rows.map((row) => {
      const cols = row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());

      const firstName = cols[1] || "";
      const lastName = cols[2] || "";
      const city = cols[10] || "";
      const state = cols[11] || "";

      let rawStatus = (cols[12] || "not responded").toLowerCase().trim();

      // Map sheet values to internal status keys
      let status = rawStatus;
      if (rawStatus === "yes" || rawStatus === "attending") status = "yes";
      if (rawStatus === "not responded") status = "not_responded";

      const photoName = cols[13] || "default.png";

      return {
        name: `${firstName} ${lastName}`.trim(),
        status: status,
        hometown:
          city && state ? `${city}, ${state}` : city || state || "Unknown",
        photo: `/grad-thumbnails/${photoName}`,
      };
    });

    // Set initial placeholder
    document.getElementById("searchResults").innerHTML = placeholderHTML;
    console.log("Classmate data loaded:", classmates.length);
  } catch (error) {
    console.error("Error loading directory:", error);
  }
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

document.addEventListener("DOMContentLoaded", () => {
  loadDirectoryData();

  const searchInput = document.getElementById("directorySearch");
  const dropdown = document.getElementById("autocompleteDropdown");
  const resultsContainer = document.getElementById("searchResults");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      const items = dropdown.querySelectorAll(".dropdown-item");
      const isVisible = !dropdown.classList.contains("hidden");

      if (e.key === "Escape") {
        searchInput.value = "";
        dropdown.classList.add("hidden");
        resultsContainer.innerHTML = placeholderHTML;
        selectedIndex = -1;
        return;
      }

      if (e.key === "ArrowDown" && isVisible) {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateHighlight(items);
      } else if (e.key === "ArrowUp" && isVisible) {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateHighlight(items);
      } else if ((e.key === "Enter" || e.key === "Tab") && isVisible) {
        if (selectedIndex > -1) {
          e.preventDefault();
          items[selectedIndex].click();
        }
      }
    });

    searchInput.addEventListener("input", function () {
      selectedIndex = -1;
      const searchTerm = this.value.toLowerCase().trim();

      if (searchTerm.length === 0) {
        dropdown.classList.add("hidden");
        resultsContainer.innerHTML = placeholderHTML;
        return;
      }

      const searchTerms = searchTerm.split(/\s+/);
      const matches = classmates.filter((person) => {
        const fullName = person.name.toLowerCase();
        return searchTerms.every((term) => fullName.includes(term));
      });

      if (matches.length > 0) {
        dropdown.innerHTML = matches
          .map(
            (person) => `
              <div class="dropdown-item px-6 py-3 text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 font-medium"
                    onclick="selectPerson('${person.name.replace(/'/g, "\\'")}')">
                ${person.name}
              </div>
            `,
          )
          .join("");
        dropdown.classList.remove("hidden");
      } else {
        dropdown.classList.add("hidden");
      }
    });

    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }
});

function selectPerson(name) {
  const searchInput = document.getElementById("directorySearch");
  const dropdown = document.getElementById("autocompleteDropdown");
  const resultsContainer = document.getElementById("searchResults");

  searchInput.value = name;
  dropdown.classList.add("hidden");

  const person = classmates.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );

  if (person) {
    const statusConfig = {
      yes: {
        label: "Attending",
        colors: "bg-green-800 text-white border-green-800",
        icon: '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>',
      },
      no: {
        label: "Not Attending",
        colors: "bg-red-50 text-red-700 border-red-200",
        icon: '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>',
      },
      maybe: {
        label: "Maybe",
        colors: "bg-amber-50 text-amber-700 border-amber-200",
        icon: '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>',
      },
      private: {
        label: "Private",
        colors: "bg-purple-100 text-purple-700 border-purple-200",
        icon: '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>',
      },
      missing: {
        label: "Missing",
        colors: "bg-purple-50 text-purple-700 border-purple-200",
        icon: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>',
      },
      deceased: {
        label: "Deceased",
        colors: "bg-gray-800 text-gray-100 border-gray-900",
        icon: '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.945 2.035a1 1 0 01.555.894V17a1 1 0 01-1 1H5.5a1 1 0 01-1-1V7.252a1 1 0 01.555-.894L9 4.323V3a1 1 0 011-1z"/></svg>',
      },
      not_responded: {
        label: "Not Responded",
        colors: "bg-slate-100 text-slate-600 border-slate-200",
        icon: "",
      },
    };

    let statusKey = person.status.toLowerCase().trim();
    const currentStatus =
      statusConfig[statusKey] || statusConfig["not_responded"];
    const isPrivate = statusKey === "private";

    resultsContainer.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto">
        <div class="flex items-center gap-8 text-left">
          <div class="relative flex-shrink-0">
            <img src="${isPrivate ? "/grad-thumbnails/default.png" : person.photo}"
                 alt="${person.name}"
                 class="w-40 h-40 rounded-xl object-cover shadow-md border-4 border-white ring-1 ring-gray-200 ${isPrivate ? "grayscale opacity-50" : ""}">
          </div>
          <div class="flex-1">
            <h4 class="text-3xl font-bold text-green-800 tracking-tight mb-4 heading-font">${person.name}</h4>
            <div class="mb-4">
              <span class="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold border ${currentStatus.colors}">
                ${currentStatus.icon} ${currentStatus.label}
              </span>
            </div>
            <p class="text-slate-600 text-lg">
              <span class="font-bold text-slate-800">Hometown:</span> ${isPrivate ? "Private" : person.hometown}
            </p>
          </div>
        </div>
      </div>`;
  }
}
