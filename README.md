# BHS Class of '86 40th Reunion - Static HTML Version

This is the static HTML version of the Berkeley High School Class of 1986 40th Reunion website, converted from React to pure HTML/CSS/JS.

## Files Structure

```
src/
├── index.html          # Main HTML file (complete website)
├── css/
│   └── main.css        # Custom CSS styles
└── js/
    └── main.js         # Minimal JavaScript for interactivity
```

## Features

### Pure Static HTML
- No React or build process required
- Works directly in any web browser
- All content is in a single `index.html` file

### Styling
- Uses Tailwind CSS via CDN (no build step)
- Custom CSS in `css/main.css` for:
  - Logo fly-in animation with bounce effect
  - Sticky navigation behavior
  - Custom scrollbar styling
  - Print styles
  - Accessibility focus states

### JavaScript (Minimal)
The `js/main.js` file includes only essential functionality:
- Sticky navigation show/hide on scroll (300px threshold)
- Dynamic share link URL updates
- Throttled scroll event for performance

### Animations
All animations are CSS-based except for the sticky nav:
- **Logo animation**: Pure CSS `@keyframes` with 3s delay and bounce effect
- **Hover effects**: CSS transitions
- **Progress bar**: CSS width transition

## How to Use

### Option 1: Direct File Access
1. Open `src/index.html` directly in any web browser
2. That's it! No server or build process needed.

### Option 2: Local Web Server
For testing share links and other URL-dependent features:

```bash
# Using Python 3
cd static
python -m http.server 8000

# Using PHP
cd static
php -S localhost:8000

# Using Node.js (http-server)
npx http-server static -p 8000
```

Then visit: `http://localhost:8000`

### Option 3: Deploy to Static Hosting
Upload the entire `static/` folder to any static hosting service:
- **GitHub Pages**: Push to gh-pages branch

## Customization

### Update Content
Edit `index.html` directly - all content is in semantic HTML with clear sections:
- Hero section
- Kickstarter progress
- Events
- Map & questionnaire
- Who's coming
- Footer

### Change Colors
Colors are defined in the Tailwind config inline in `index.html`:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'bhs-green': '#006400',
        'bhs-gold': '#FFCC00',
        'bhs-red': '#C41230',
      }
    }
  }
}
```

### Replace Images
Update image URLs in `index.html`:
- Hero background: Line 60
- BHS Logo: Line 70

### Adjust Animations
Edit animation timing in `styles/main.css`:
- Logo fly-in duration: `.5s` (line 21)
- Logo delay: `3s` (line 21)
- Bounce effect: Keyframes at 60%, 80% (lines 14-22)

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ IE11 (with Tailwind CDN fallbacks)

## Performance Notes

- Tailwind CDN adds ~80KB (gzipped)
- Custom CSS: ~2KB
- Custom JS: ~1KB
- Total page weight: ~100KB (excluding images)
- No JavaScript required for core content (progressive enhancement)

## Accessibility

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Custom focus states (gold outline)
- Responsive design (mobile-first)

## SEO Considerations

To improve SEO, consider adding to `<head>`:
```html
<meta name="description" content="Berkeley High School Class of 1986 40th Reunion - October 3rd, 2026">
<meta property="og:title" content="BHS Class of '86 Reunion">
<meta property="og:description" content="Join us for our 40th reunion celebration">
<meta property="og:image" content="[your-image-url]">
```

## Notes

- The progress bar value (12.33%) is hardcoded - update in HTML if needed
- Google Maps embed URL is included - replace with your actual map ID
- Google Forms links point to placeholder URLs - update with real form links
- Share buttons work best when deployed (not file:// protocol)

## Credits

Designed for Berkeley High School Class of 1986
Built with HTML5, Tailwind CSS, and minimal vanilla JavaScript
