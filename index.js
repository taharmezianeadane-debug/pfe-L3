// ========================================
// INTERACTION SOURIS - Éléments flottants
// ========================================
document.addEventListener('mousemove', (e) => {
    const floatingElements = document.querySelectorAll('.floating-circle, .floating-hexagon');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    floatingElements.forEach((element, index) => {
        const speed = 20 + (index * 5);
        const x = (mouseX * speed) - (speed / 2);
        const y = (mouseY * speed) - (speed / 2);
        
        element.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.1}deg)`;
    });
});

// ========================================
// GESTION DU TEXT SCROLLER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const jobInput = document.getElementById('job-input');
    const textScroller = document.getElementById('textScroller');
    
    if (jobInput && textScroller) {
        jobInput.addEventListener('focus', () => {
            textScroller.style.opacity = '0';
        });
        
        jobInput.addEventListener('blur', () => {
            if (!jobInput.value) {
                textScroller.style.opacity = '1';
            }
        });
        
        jobInput.addEventListener('input', () => {
            if (jobInput.value) {
                textScroller.style.opacity = '0';
            } else {
                textScroller.style.opacity = '1';
            }
        });
    }
});

// ========================================
// INTERACTION BOUTON DE RECHERCHE
// ========================================
const searchBtn = document.querySelector('.tech-search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Animation de clic
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
        
        // Récupérer les valeurs
        const jobInput = document.getElementById('job-input');
        const locationInput = document.querySelector('.search-tech-field:last-child .tech-input');
        
        const jobValue = jobInput ? jobInput.value : '';
        const locationValue = locationInput ? locationInput.value : '';
        
        // Feedback visuel
        const searchBar = document.querySelector('.search-tech-bar');
        searchBar.style.boxShadow = '0 0 50px var(--vert-emeraude)';
        setTimeout(() => {
            searchBar.style.boxShadow = '';
        }, 500);
    });
}

// ========================================
// CARROUSEL DE TÉMOIGNAGES
// ========================================
const track = document.getElementById('testimonialsTrack');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

if (track && dots.length > 0) {
    let currentIndex = 0;
    const totalSlides = document.querySelectorAll('.testimonial-card').length;

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    // Auto-play
    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlay);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        });
    }
}

// ========================================
// ANIMATION SUPPLEMENTAIRE POUR LE GLOW
// ========================================
const searchBar = document.querySelector('.search-tech-bar');
if (searchBar) {
    searchBar.addEventListener('mouseenter', () => {
        if (!searchBar.matches(':focus-within')) {
            searchBar.style.transform = 'scale(1.02)';
        }
    });
    
    searchBar.addEventListener('mouseleave', () => {
        if (!searchBar.matches(':focus-within')) {
            searchBar.style.transform = 'scale(1)';
        }
    });
}
