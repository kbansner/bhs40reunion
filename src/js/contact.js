// Contact Page JavaScript

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
  
  // Add smooth scrolling to all anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') {
        e.preventDefault();
        return;
      }
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add entrance animation for committee cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all committee cards
  const cards = document.querySelectorAll('.committee-card');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Read More / Read Less functionality for bios
  const bioParagraphs = document.querySelectorAll('.bio-text');
  
  bioParagraphs.forEach(bioText => {
    const text = bioText.textContent;
    
    // Only add Read More button if bio text is longer than 120 characters
    if (text.length > 120) {
      const readMoreBtn = document.createElement('button');
      readMoreBtn.className = 'read-more-btn text-bhs-gold text-xs mt-2 hover:text-bhs-gold/80 transition-colors font-medium';
      readMoreBtn.textContent = 'Read More →';
      
      readMoreBtn.addEventListener('click', function() {
        if (bioText.classList.contains('line-clamp-4')) {
          bioText.classList.remove('line-clamp-4');
          readMoreBtn.textContent = '← Read Less';
        } else {
          bioText.classList.add('line-clamp-4');
          readMoreBtn.textContent = 'Read More →';
          // Scroll the card into view smoothly
          bioText.closest('.committee-card').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      });
      
      bioText.parentElement.appendChild(readMoreBtn);
    }
  });

});