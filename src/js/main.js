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

  // Render missing classmates dynamically
  renderMissingClassmates();

  // Initialize search functionality for missing classmates
  initMissingClassmatesSearch();
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

// ============================================
// HELP US FIND SECTION - Search & Contact Functions
// ============================================

// Updated Missing Classmates Data - BHS Class of '86
// Complete Missing Classmates Data - BHS Class of '86
const missingClassmatesData = [
  {
    letter: "A",
    names: [
      { name: "Abukhdair, Miriam Fahtma", uid: "BHS-447" },
      { name: "Ackerman, Laura K.", uid: "BHS-362" },
      { name: "Akino, Keshi", uid: "BHS-339" },
      { name: "Alexis, Calvin", uid: "BHS-096" },
      { name: "Anderson, Rico E.", uid: "BHS-519" },
      { name: "Aquino, Robert F.", uid: "BHS-524" },
      { name: "Austin, Gena Anne", uid: "BHS-212" },
      { name: "Aviles, Olga Tatiana", uid: "BHS-472" },
    ],
  },
  {
    letter: "B",
    names: [
      { name: "Backer, David A.", uid: "BHS-150" },
      { name: "Baker, Bette J.", uid: "BHS-080" },
      { name: "Baker, Bryant", uid: "BHS-091" },
      { name: "Baker, Paul", uid: "BHS-478" },
      { name: "Ball, Benjamin J.", uid: "BHS-077" },
      { name: "Bankhead, Peter", uid: "BHS-483" },
      { name: "Barter, Christopher M.", uid: "BHS-126" },
      { name: "Bayless, Rico L.", uid: "BHS-520" },
      { name: "Bean, Scott M.", uid: "BHS-540" },
      { name: "Bell, Steven M.", uid: "BHS-580" },
      { name: "Bennett, Sonji B.", uid: "BHS-565" },
      { name: "Bergesen, Sally C.", uid: "BHS-535" },
      { name: "Best, Zachary M.", uid: "BHS-644" },
      { name: "Bickel, Stephen E.", uid: "BHS-577" },
      { name: "Binder, Devin K.", uid: "BHS-169" },
      { name: "Black, Lisa M.", uid: "BHS-376" },
      { name: "Blair, Kimberly D.", uid: "BHS-341" },
      { name: "Blomberg, Jorgen A.", uid: "BHS-303" },
      { name: "Bolt (Juarez), Helen I.", uid: "BHS-234" },
      { name: "Bond, Jane T.", uid: "BHS-258" },
      { name: "Boykin (Corbin), Venise S.", uid: "BHS-623" },
      { name: "Bradford, Jeffrey P.", uid: "BHS-270" },
      { name: "Bradley, Maria", uid: "BHS-394" },
      { name: "Brand, Shauna L.", uid: "BHS-553" },
      { name: "Bright, Kathryn L.", uid: "BHS-329" },
      { name: "Brody, Mimi M.", uid: "BHS-446" },
      { name: "Brown, Aaron E.", uid: "BHS-002" },
      { name: "Brown, David M.", uid: "BHS-153" },
      { name: "Buchanan, Alice J.", uid: "BHS-012" },
      { name: "Bucher, Richard C.", uid: "BHS-516" },
      { name: "Buckland, Anthony F.", uid: "BHS-062" },
      { name: "Budinger, Thomas P.", uid: "BHS-610" },
      { name: "Bui, Quang M.", uid: "BHS-496" },
      { name: "Bullock, Jr., Emeal", uid: "BHS-182" },
      { name: "Burdette (Schwarzbart), Sharon", uid: "BHS-551" },
      { name: "Burns, Erik T.", uid: "BHS-193" },
      { name: "Bush, David R.", uid: "BHS-155" },
      { name: "Butler, Brian A.", uid: "BHS-087" },
      { name: "Butts, Godivus M.", uid: "BHS-220" },
    ],
  },
  {
    letter: "C",
    names: [
      { name: "Calhoun, Sherston D.", uid: "BHS-558" },
      { name: "Campbell, Caitlin M.", uid: "BHS-095" },
      { name: "Campbell, Colin M.", uid: "BHS-132" },
      { name: "Capers, Eric", uid: "BHS-187" },
      { name: "Cary, Ethan M.", uid: "BHS-198" },
      { name: "Chai, David K.", uid: "BHS-152" },
      { name: "Chan, Pui W.", uid: "BHS-495" },
      { name: "Chi, Chi-Liang (Gary)", uid: "BHS-114" },
      { name: "Chi, Hyuk", uid: "BHS-241" },
      { name: "Chi, Wook", uid: "BHS-634" },
      { name: "Chien, Ning C. (Nina)", uid: "BHS-467" },
      { name: "Cho, Jenny J.", uid: "BHS-283" },
      { name: "Cho Nadell, Lailina", uid: "BHS-350" },
      { name: "Chung, Susan S.", uid: "BHS-583" },
      { name: "Clark, Juliet L.", uid: "BHS-317" },
      { name: "Cole, Carey K.", uid: "BHS-098" },
      { name: "Coleman, Lakesha", uid: "BHS-351" },
      { name: "Collins, Jason F.", uid: "BHS-262" },
      { name: "Cooreman, Kathy", uid: "BHS-330" },
      { name: "Coulter, Bridgid L.", uid: "BHS-089" },
      { name: "Cox, Jennifer", uid: "BHS-273" },
      { name: "Crosby, Wyonona", uid: "BHS-635" },
      { name: "Currie, Yolanda R.", uid: "BHS-639" },
    ],
  },
  {
    letter: "D",
    names: [
      { name: "Da Silva, Janaina T.", uid: "BHS-256" },
      { name: "Daughtry, Mary L.", uid: "BHS-414" },
      { name: "Davis, Royce D.", uid: "BHS-530" },
      { name: "Dea, Christopher S.", uid: "BHS-129" },
      { name: "Delaney, Andrew T.", uid: "BHS-045" },
      { name: "Delgado, Silvia", uid: "BHS-560" },
      { name: "DeLissovoy, Noah", uid: "BHS-469" },
      { name: "Dolven, Eric T.", uid: "BHS-191" },
      { name: "Dommer, Jason G.", uid: "BHS-263" },
      { name: "Doyle, Mathew A.", uid: "BHS-416" },
      { name: "Dozier, Jeffrey E.", uid: "BHS-268" },
    ],
  },
  {
    letter: "E",
    names: [
      { name: "Early, Yolanda", uid: "BHS-637" },
      { name: "Edington, Alphonso D.", uid: "BHS-023" },
      { name: "Eggling (Seiden), Marcy", uid: "BHS-391" },
      { name: "Elliott, Aaron", uid: "BHS-001" },
      { name: "Ellish, Jason A.", uid: "BHS-260" },
      { name: "Ely, Michael", uid: "BHS-433" },
      { name: "Ernst, Peter J.", uid: "BHS-489" },
      { name: "Estrada, Michelle D.", uid: "BHS-442" },
    ],
  },
  {
    letter: "F",
    names: [
      { name: "Falk, Amerin", uid: "BHS-025" },
      { name: "Fisher, Jacob S.", uid: "BHS-249" },
      { name: "Fitzsimons, Amy P.", uid: "BHS-035" },
      { name: "Fletcher, Jill J.", uid: "BHS-289" },
      { name: "Folkmanis, Jason", uid: "BHS-259" },
      { name: "Forrest, Anne", uid: "BHS-055" },
      { name: "Frank, Marcos G.", uid: "BHS-388" },
      { name: "Fredman, Peter B.", uid: "BHS-486" },
      { name: "Freedman, Anne Marie", uid: "BHS-056" },
    ],
  },
  {
    letter: "G",
    names: [
      { name: "Gaines, Atwood G.", uid: "BHS-070" },
      { name: "Gamble, Mark D.", uid: "BHS-404" },
      { name: "Ghelerter, Lara E.", uid: "BHS-354" },
      { name: "Giese, Christopher R.", uid: "BHS-128" },
      { name: "Gonzales, Elizabeth", uid: "BHS-176" },
      { name: "Gooding, Colin T.", uid: "BHS-133" },
      { name: "Govers, Scott B.", uid: "BHS-539" },
      { name: "Gray, Michele C.", uid: "BHS-439" },
      { name: "Grayson, Ninochka", uid: "BHS-468" },
      { name: "Greinke, Barney W.", uid: "BHS-074" },
      { name: "Greer, William L. (Buddy)", uid: "BHS-630" },
      { name: "Gregory, Stephen L.", uid: "BHS-578" },
      { name: "Griffin, Benjamin L.", uid: "BHS-078" },
    ],
  },
  {
    letter: "H",
    names: [
      { name: "Haley, Ramal", uid: "BHS-502" },
      { name: "Halverson, Aniko L.", uid: "BHS-050" },
      { name: "Harper, Mia R.", uid: "BHS-431" },
      { name: "Harper, Rashidi", uid: "BHS-505" },
      { name: "Harris, Adriene C.", uid: "BHS-009" },
      { name: "Harris, Katherine R.", uid: "BHS-327" },
      { name: "Harris, Tonie L.", uid: "BHS-615" },
      { name: "Hay, Tammy L.", uid: "BHS-591" },
      { name: "Henry, Melissa S.", uid: "BHS-428" },
      { name: "Herbert, Jaheda", uid: "BHS-252" },
      { name: "Higgins, Neave V.", uid: "BHS-462" },
      { name: "Hoffman (Signer), Flynn", uid: "BHS-200" },
      { name: "Holmes, Jacob A.", uid: "BHS-247" },
      { name: "Holmes, Melissa", uid: "BHS-426" },
      { name: "Horning, Cynthia M.", uid: "BHS-140" },
      { name: "Horton, Emma G.", uid: "BHS-183" },
      { name: "Hosley, Sonji S.", uid: "BHS-566" },
      { name: "Hudson, Marcus D.", uid: "BHS-390" },
      { name: "Hughes, Nicole M.", uid: "BHS-465" },
    ],
  },
  {
    letter: "I",
    names: [
      { name: "Inacay, Amor L.", uid: "BHS-028" },
      { name: "Ishimaru, Craig I.", uid: "BHS-134" },
      { name: "Ison, III, Anthony C.", uid: "BHS-060" },
    ],
  },
  {
    letter: "J",
    names: [
      { name: "Jackson, Anthony C.", uid: "BHS-061" },
      { name: "Jackson, Tina R.", uid: "BHS-612" },
      { name: "James, LaShan", uid: "BHS-356" },
      { name: "Jeffries, Karen", uid: "BHS-322" },
      { name: "Johnson, Julie C.", uid: "BHS-314" },
      { name: "Johnson, Nancy L.", uid: "BHS-455" },
      { name: "Johnson, Rachawn M.", uid: "BHS-498" },
      { name: "Johnson, Sean D.", uid: "BHS-541" },
      { name: "Johnson, Thomas E.", uid: "BHS-609" },
      { name: "Johnson, Jr., Willie C.", uid: "BHS-631" },
      { name: "Jones, Felica D.", uid: "BHS-199" },
      { name: "Jones, Fonda Y.", uid: "BHS-201" },
      { name: "Jones, Meshia D.", uid: "BHS-430" },
      { name: "Jones, Ruth M. L.", uid: "BHS-531" },
      { name: "Jones, Wendy K.", uid: "BHS-626" },
      { name: "Jordan (Le Vinh), Jordan", uid: "BHS-363" },
      { name: "Joyner, Nicole D.", uid: "BHS-464" },
    ],
  },
  {
    letter: "K",
    names: [
      { name: "Kalmar, Tanaya R.", uid: "BHS-593" },
      { name: "Kanyuk, Jane N.", uid: "BHS-257" },
      { name: "Keasler, Anthony (Ian)", uid: "BHS-058" },
      { name: "Kechley, Kevin", uid: "BHS-340" },
      { name: "Keeney, Brian P.", uid: "BHS-088" },
      { name: "Kelman, Navah M.", uid: "BHS-461" },
      { name: "Kessler, Gabriel S.", uid: "BHS-208" },
      { name: "Kim, Mauricio R.", uid: "BHS-421" },
      { name: "King, Benjamin N.", uid: "BHS-079" },
      { name: "Klinman, Douglas", uid: "BHS-173" },
      { name: "Kloian, Elizabeth", uid: "BHS-177" },
      { name: "Krabbe, Tatiana A.", uid: "BHS-598" },
    ],
  },
  {
    letter: "L",
    names: [
      { name: "Labarre, Leland J.", uid: "BHS-365" },
      { name: "La Coss, Simone M.", uid: "BHS-561" },
      { name: "Lam, Hong Y.", uid: "BHS-240" },
      { name: "Langer, Catherine", uid: "BHS-106" },
      { name: "Lau, Sophia So Fei", uid: "BHS-569" },
      { name: "Lawson, Christy", uid: "BHS-130" },
      { name: "Le Thuan, D. Thuan", uid: "BHS-142" },
      { name: "Lee, Susan E.", uid: "BHS-582" },
      { name: "Leegant, Ava R.", uid: "BHS-072" },
      { name: "Leonard, Joanna E.", uid: "BHS-292" },
      { name: "Leonard, Julius B.", uid: "BHS-319" },
      { name: "Levy, Oren Avi", uid: "BHS-473" },
      { name: "Levy, Rebecca S.", uid: "BHS-510" },
      { name: "Libby, Shannon V.", uid: "BHS-548" },
      { name: "Light, Judah S.", uid: "BHS-311" },
      { name: "Link, Yvonne D.", uid: "BHS-643" },
      { name: "Little, Christian Lige", uid: "BHS-118" },
      { name: "Long, Guevara J.", uid: "BHS-225" },
      { name: "Lopez, Jr., Heriberto", uid: "BHS-237" },
      { name: "Lou, Charlie Lei", uid: "BHS-112" },
      { name: "Lubliner, Anna Sarah", uid: "BHS-054" },
      { name: "Lucas, Lisa", uid: "BHS-374" },
      { name: "Lupoff, Thomas D.", uid: "BHS-608" },
      { name: "Lyles, Carolyn Yvette", uid: "BHS-102" },
      { name: "Lynch, Stacy R.", uid: "BHS-572" },
      { name: "Lynch (Golden-Schubert), Shannon", uid: "BHS-547" },
      { name: "Lyons, Damion E.", uid: "BHS-144" },
    ],
  },
  {
    letter: "M",
    names: [
      { name: "Manninen, Mari", uid: "BHS-393" },
      { name: "Manougian, Yon", uid: "BHS-640" },
      { name: "Martinez, Melissa", uid: "BHS-427" },
      { name: "Martinson, Jemal D.", uid: "BHS-271" },
      { name: "Matthews, Joyce", uid: "BHS-310" },
      { name: "McClure, Peter C.", uid: "BHS-487" },
      { name: "McCoy, Anthony A.", uid: "BHS-059" },
      { name: "McCoy, Marc C.", uid: "BHS-387" },
      { name: "McCoy, Monica D.", uid: "BHS-450" },
      { name: "McEldowney, Josephine", uid: "BHS-305" },
      { name: "McGee, Geanise R.", uid: "BHS-211" },
      { name: "McGee, LaRhonda D.", uid: "BHS-355" },
      { name: "McNack, Kathryn E.", uid: "BHS-328" },
      { name: "Medcalf, Rebecca", uid: "BHS-507" },
      { name: "Medina, Denise D.", uid: "BHS-164" },
      { name: "Mendonca, Michael G.", uid: "BHS-435" },
      { name: "Menocal, Marshall L.", uid: "BHS-407" },
      { name: "Merritt, Christopher L.", uid: "BHS-125" },
      { name: "Meuris, Christine R.", uid: "BHS-122" },
      { name: "Miller, Wanda", uid: "BHS-625" },
      { name: "Minor, Darron", uid: "BHS-148" },
      { name: "Mishell, Jacob M.", uid: "BHS-248" },
      { name: "Mixon, Sean H.", uid: "BHS-543" },
      { name: "Miyoshi, Owen M.", uid: "BHS-474" },
      { name: "Moll, Jason S.", uid: "BHS-264" },
      { name: "Montali, Amy", uid: "BHS-029" },
      { name: "Moore, Amy E.", uid: "BHS-033" },
      { name: "Moore, Mark D.", uid: "BHS-403" },
      { name: "Morgan, Damian L.", uid: "BHS-143" },
      { name: "Morris, Georgiana N.", uid: "BHS-215" },
      { name: "Mosley, Jonathan", uid: "BHS-301" },
      { name: "Mouratoff, Vasilis M.", uid: "BHS-622" },
      { name: "Murphy, Cary J.", uid: "BHS-104" },
      { name: "Myles, Achebe L.", uid: "BHS-006" },
      { name: "Myles, Kisaya", uid: "BHS-346" },
    ],
  },
  {
    letter: "N",
    names: [
      { name: "Nelson, Angela C.", uid: "BHS-047" },
      { name: "Nelson, Marielle L.", uid: "BHS-397" },
      { name: "Nesbitt, George J.", uid: "BHS-214" },
      { name: "Newkirk (Christman), Rachel A.", uid: "BHS-500" },
      { name: "Ng, Matthew S.", uid: "BHS-419" },
      { name: "Nishifue, Caroline", uid: "BHS-101" },
    ],
  },
  {
    letter: "O",
    names: [
      { name: "O'Donnell Lahey, Elizabeth", uid: "BHS-178" },
      { name: "Oki, Craig S.", uid: "BHS-135" },
      { name: "Oki, David Y.", uid: "BHS-158" },
      { name: "Olin, Gabriel S.", uid: "BHS-209" },
      { name: "Oliver, Maria A.", uid: "BHS-395" },
      { name: "Orenstein, Catherine", uid: "BHS-107" },
      { name: "Orme, Stephan H.", uid: "BHS-574" },
      { name: "Orozco, Enrique", uid: "BHS-184" },
      { name: "Ortiz, Pedro", uid: "BHS-481" },
      { name: "Ott, Aaron M.", uid: "BHS-004" },
      { name: "Otterbeck, Mary A.", uid: "BHS-413" },
      { name: "Outland, Shelita", uid: "BHS-555" },
    ],
  },
  {
    letter: "P",
    names: [
      { name: "Parker, Chris M.", uid: "BHS-117" },
      { name: "Partyka (Heimpel), Doron U.", uid: "BHS-172" },
      { name: "Perez, Aurora A.", uid: "BHS-071" },
      { name: "Perkins, Chris", uid: "BHS-115" },
      { name: "Peterson, Andrew J.", uid: "BHS-041" },
      { name: "Petry, Pamela", uid: "BHS-475" },
      { name: "Petty, Kemberle Ann", uid: "BHS-334" },
      { name: "Phan, Giao Q.", uid: "BHS-216" },
      { name: "Phill, Lee R.", uid: "BHS-364" },
      { name: "Platt, Rebecca E.", uid: "BHS-509" },
      { name: "Pon, Malcolm K.", uid: "BHS-384" },
      { name: "Ponthier, Bonnie L.", uid: "BHS-084" },
      { name: "Portero, Jonathan D.", uid: "BHS-302" },
      { name: "Price, Armein", uid: "BHS-068" },
      { name: "Price, Monique D.", uid: "BHS-452" },
      { name: "Prichard, Sean D.", uid: "BHS-542" },
      { name: "Prince, Rebecca", uid: "BHS-508" },
      { name: "Pugh, Terrie S.", uid: "BHS-603" },
    ],
  },
  {
    letter: "Q",
    names: [
      { name: "Qin, Zhang", uid: "BHS-645" },
      { name: "Quady, Peter A.", uid: "BHS-485" },
    ],
  },
  {
    letter: "R",
    names: [
      { name: "Ramey, Caitlin C.", uid: "BHS-094" },
      { name: "Ramirez, Marcus A.", uid: "BHS-389" },
      { name: "Ramos, Enrique", uid: "BHS-185" },
      { name: "Ray, Allegheny M.", uid: "BHS-022" },
      { name: "Recht, Joseph W.", uid: "BHS-304" },
      { name: "Redman (Shedroff), Joshua", uid: "BHS-306" },
      { name: "Rehn, Andrea", uid: "BHS-038" },
      { name: "Reid, James", uid: "BHS-254" },
      { name: "Reiff, Devan J.", uid: "BHS-168" },
      { name: "Ricketts, Frances", uid: "BHS-202" },
      { name: "Roberts, Jennifer L.", uid: "BHS-280" },
      { name: "Roberts, Norman P.", uid: "BHS-471" },
      { name: "Roizen, Zoe I.", uid: "BHS-646" },
      { name: "Rosenblum, Petra E.", uid: "BHS-490" },
      { name: "Rudnick, Rachel", uid: "BHS-499" },
    ],
  },
  {
    letter: "S",
    names: [
      { name: "Sanders, Greg", uid: "BHS-222" },
      { name: "Sanders, III, Robert L.", uid: "BHS-525" },
      { name: "Savage, Deanna", uid: "BHS-160" },
      { name: "Scheiner, Ethan", uid: "BHS-197" },
      { name: "Schwarzbart (Burdette), Sharon", uid: "BHS-551" },
      { name: "Sessions, Amy (Aimee)", uid: "BHS-030" },
      { name: "Shabazz, Terika", uid: "BHS-601" },
      { name: "Shaver, Mark A.", uid: "BHS-401" },
      { name: "Shepard, Laura B.", uid: "BHS-360" },
      { name: "Simmons, Degi", uid: "BHS-163" },
      { name: "Simmons, Philip J.", uid: "BHS-492" },
      { name: "Simpson, Michael M.", uid: "BHS-438" },
      { name: "Skelton, Eona", uid: "BHS-186" },
      { name: "Slaughter, Darcel D.", uid: "BHS-146" },
      { name: "Sloan, Reuben C.", uid: "BHS-514" },
      { name: "Smith, Bobby", uid: "BHS-083" },
      { name: "Smith, Mavalda T.", uid: "BHS-422" },
      { name: "Smith, Nico C.", uid: "BHS-463" },
      { name: "Smoller, Karen A.", uid: "BHS-323" },
      { name: "Spencer, Michael D.", uid: "BHS-434" },
      { name: "Spiller, Harry L.", uid: "BHS-227" },
      { name: "Spitzer, Joel B.", uid: "BHS-293" },
      { name: "Springsteen, Tamara", uid: "BHS-590" },
      { name: "Stanley, Antonio", uid: "BHS-205" },
      { name: "Starks, Taurus L.", uid: "BHS-599" },
      { name: "Steinbach, Aminta N.", uid: "BHS-027" },
      { name: "Stevens, Rachel J.", uid: "BHS-501" },
      { name: "Stevens, Spencer D.", uid: "BHS-570" },
      { name: "Stevens, Stefan", uid: "BHS-573" },
      { name: "Stroud, Richard G.", uid: "BHS-517" },
      { name: "Stuart, Deshane L.", uid: "BHS-167" },
      { name: "Stuart (Bagnell), Jennifer Ann", uid: "BHS-276" },
      { name: "Suarez, Raquel M.", uid: "BHS-504" },
      { name: "Sugimoto, Susie K.", uid: "BHS-585" },
      { name: "Sul, Martin R.", uid: "BHS-411" },
      { name: "Sullivan, Shauna E.", uid: "BHS-552" },
    ],
  },
  {
    letter: "T",
    names: [
      { name: "Taplin, Heather E.", uid: "BHS-231" },
      { name: "Taylor, Alicia L.", uid: "BHS-015" },
      { name: "Taylor, Eric C.", uid: "BHS-189" },
      { name: "Taylor, Shokai K.", uid: "BHS-559" },
      { name: "Teague, Michelle J.", uid: "BHS-443" },
      { name: "Thibodeaux, Julius", uid: "BHS-318" },
      { name: "Thomas, LaTanya", uid: "BHS-358" },
      { name: "Thornton, Tawana L.", uid: "BHS-600" },
      { name: "Threatt, Christian R.", uid: "BHS-119" },
      { name: "Tien, Cherie T.", uid: "BHS-113" },
      { name: "Tims, Martrice S.", uid: "BHS-412" },
      { name: "Torre, Karen M.", uid: "BHS-325" },
      { name: "Torrence, Tandeeka M.", uid: "BHS-594" },
      { name: "Toubba, Tania", uid: "BHS-595" },
      { name: "Trainor, Ellen D. (Ellie)", uid: "BHS-181" },
      { name: "Tran, Sahn", uid: "BHS-533" },
    ],
  },
  {
    letter: "U",
    names: [{ name: "Upshaw, Cassandra", uid: "BHS-105" }],
  },
  {
    letter: "V",
    names: [
      { name: "Valentine, Manuel", uid: "BHS-385" },
      { name: "Vanarsdale, Jessi", uid: "BHS-285" },
      { name: "Vann, Troy D.", uid: "BHS-618" },
      { name: "Verzhbinsky, Anna", uid: "BHS-053" },
      { name: "Vogel-Chemla, David S.", uid: "BHS-156" },
    ],
  },
  {
    letter: "W",
    names: [
      { name: "Wagoner, Robert A.", uid: "BHS-523" },
      { name: "Walker-Troutt, Anton", uid: "BHS-064" },
      { name: "Wann, Leon", uid: "BHS-367" },
      { name: "Watkins, Tana L.", uid: "BHS-592" },
      { name: "Watts, Christy L.", uid: "BHS-131" },
      { name: "Wedgley, Hannah", uid: "BHS-226" },
      { name: "Wei, Pei-Yuan", uid: "BHS-482" },
      { name: "Welton, Elizabeth A.", uid: "BHS-179" },
      { name: "Westbrooks, Donald V.", uid: "BHS-171" },
      { name: "Wexelman, Sara L.", uid: "BHS-536" },
      { name: "Whaley, Derek L.", uid: "BHS-166" },
      { name: "Whitfield, Lashun", uid: "BHS-357" },
      { name: "Whitmore, Henry E.", uid: "BHS-235" },
      { name: "Williams, Alisa", uid: "BHS-016" },
      { name: "Williams, Naomi M.", uid: "BHS-457" },
      { name: "Willils, Andrew R.", uid: "BHS-044" },
      { name: "Willis, Chris M.", uid: "BHS-116" },
      { name: "Woods, Adrian", uid: "BHS-008" },
      { name: "Woods, Fred D.", uid: "BHS-204" },
      { name: "Wyrick, Regina E.", uid: "BHS-512" },
    ],
  },
  {
    letter: "Y",
    names: [
      { name: "Yadegar, Jahanrad (Jay)", uid: "BHS-251" },
      { name: "Yee, Charles L.", uid: "BHS-111" },
      { name: "Yin, Sopheak S.", uid: "BHS-568" },
    ],
  },
];

// Render all missing classmates dynamically
function renderMissingClassmates() {
  const container = document.getElementById("missing-classmates-container");
  const alphabetNav = document.querySelector(
    ".flex.flex-wrap.justify-center.gap-2.mb-8",
  );

  if (!container) return; // Section might not exist on page

  // Clear existing content
  container.innerHTML = "";

  // Build alphabet navigation
  if (alphabetNav) {
    alphabetNav.innerHTML = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabet.forEach((letter) => {
      const link = document.createElement("a");
      link.href = `#letter-${letter}`;
      link.className =
        "alphabet-link px-3 py-2 bg-bhs-green text-white rounded-md hover:bg-bhs-green/90 transition-colors font-semibold text-sm";
      link.textContent = letter;
      alphabetNav.appendChild(link);
    });
  }

  // Render each letter section
  missingClassmatesData.forEach((section) => {
    if (section.names.length === 0) return; // Skip empty sections

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "letter-section mb-8";
    sectionDiv.setAttribute("data-letter", section.letter);
    sectionDiv.id = `letter-${section.letter}`;

    const heading = document.createElement("h3");
    heading.className =
      "text-2xl font-bold text-bhs-green heading-font mb-4 pb-2 border-b-2 border-bhs-gold";
    heading.textContent = section.letter;
    sectionDiv.appendChild(heading);

    const grid = document.createElement("div");
    grid.className =
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3";

    section.names.forEach((name) => {
      const card = createClassmateCard(name);
      grid.appendChild(card);
    });

    sectionDiv.appendChild(grid);
    container.appendChild(sectionDiv);
  });

  // Update total count
  const totalCount = missingClassmatesData.reduce(
    (sum, section) => sum + section.names.length,
    0,
  );
  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = totalCount;
  }
}

// Create a single classmate card
function createClassmateCard(classmateData) {
  const card = document.createElement("div");
  card.className =
    "classmate-card bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow";
  card.setAttribute("data-name", classmateData.name);

  const nameHeading = document.createElement("h4");
  nameHeading.className = "font-semibold text-base text-bhs-green mb-2";
  nameHeading.textContent = classmateData.name;
  card.appendChild(nameHeading);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "flex gap-1.5 justify-center";

  // Email button (icon only)
  const emailBtn = document.createElement("button");
  emailBtn.onclick = () => sendEmail(classmateData.name);
  emailBtn.className =
    "flex items-center justify-center p-2 bg-bhs-gold/20 text-bhs-green rounded-md hover:bg-bhs-gold/40 transition-all";
  emailBtn.title = "Email Them";
  emailBtn.setAttribute("aria-label", "Email Them");
  emailBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>`;
  emailBtn.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      button_name: "Email Them",
      link_text: emailBtn.innerText,
    });
  });
  buttonContainer.appendChild(emailBtn);

  // SMS button (icon only)
  const smsBtn = document.createElement("button");
  smsBtn.onclick = () => sendSMS(classmateData.name);
  smsBtn.className =
    "flex items-center justify-center p-2 bg-bhs-green/10 text-bhs-green rounded-md hover:bg-bhs-green/20 transition-all";
  smsBtn.title = "Text Them";
  smsBtn.setAttribute("aria-label", "Text Them");
  smsBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>`;
  smsBtn.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      button_name: "Text Them",
      link_text: smsBtn.innerText,
    });
  });
  buttonContainer.appendChild(smsBtn);

  // Share info link (icon only) - NOW WITH UID!
  const shareLink = document.createElement("a");
  shareLink.href = `https://docs.google.com/forms/d/e/1FAIpQLSeUCK2CHwM4sf2Y7YcxJh2EaqiuIWXf2DWIiUBRrGbYeEOxag/viewform?usp=pp_url&entry.1936296006=${classmateData.name}&entry.1741703138=${classmateData.uid}`;
  shareLink.target = "_blank";
  shareLink.rel = "noopener noreferrer";
  shareLink.className =
    "flex items-center justify-center p-2 bg-bhs-red/10 text-bhs-red rounded-md hover:bg-bhs-red/20 transition-all";
  shareLink.title = "Share Their Info";
  shareLink.setAttribute("aria-label", "Share Their Info");
  shareLink.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>`;
  shareLink.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      link_name: "Share Their Info",
      link_url: shareLink.href,
    });
  });
  buttonContainer.appendChild(shareLink);

  card.appendChild(buttonContainer);
  return card;
}

// Search functionality for missing classmates
function initMissingClassmatesSearch() {
  const searchInput = document.getElementById("search-missing");
  if (!searchInput) return; // Section might not exist on page

  const resultsCount = document.getElementById("results-count");
  const noResults = document.getElementById("no-results");
  const classmateCards = document.querySelectorAll(".classmate-card");
  const letterSections = document.querySelectorAll(".letter-section");

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    // If search is empty, show all
    if (searchTerm === "") {
      classmateCards.forEach((card) => {
        card.style.display = "";
      });
      letterSections.forEach((section) => {
        section.style.display = "";
      });
      resultsCount.textContent = classmateCards.length;
      noResults.classList.add("hidden");
      return;
    }

    // Search and filter
    classmateCards.forEach((card) => {
      const name = card.getAttribute("data-name").toLowerCase();
      if (name.includes(searchTerm)) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Hide letter sections that have no visible cards
    letterSections.forEach((section) => {
      const visibleCardsInSection = section.querySelectorAll(
        '.classmate-card:not([style*="display: none"])',
      );
      if (visibleCardsInSection.length === 0) {
        section.style.display = "none";
      } else {
        section.style.display = "";
      }
    });

    // Update count and show/hide no results message
    resultsCount.textContent = visibleCount;
    if (visibleCount === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
    }
  });
}

// Email function for missing classmates
function sendEmail(name) {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
  const subject = encodeURIComponent(
    "BHS Class of '86 Reunion - We're Looking for You!",
  );
  const body = encodeURIComponent(
    `Hi ${name.split(",")[1] ? name.split(",")[1].trim() : name},\n\n` +
      `The Berkeley High School Class of 1986 is planning our 40th reunion for October 2026!\n\n` +
      `We'd love to have you join us. Please fill out this quick questionnaire so we can keep you in the loop:\n` +
      `${questionnaireUrl}\n\n` +
      `Hope to see you there!\n\n` +
      `- BHS Class of '86 Reunion Committee`,
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// SMS function for missing classmates
function sendSMS(name) {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
  const firstName = name.split(",")[1] ? name.split(",")[1].trim() : name;
  const message = encodeURIComponent(
    `Hi ${firstName}! BHS Class of '86 here. We're planning our 40th reunion (Oct 2026) and would love to have you join! ` +
      `Fill out our quick questionnaire: ${questionnaireUrl}`,
  );

  window.location.href = `sms:?&body=${message}`;
}
