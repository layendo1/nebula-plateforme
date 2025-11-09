// Fonctionnalités de base
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function toggleSubmenu(element) {
    const submenu = element.nextElementSibling;
    if (!submenu || !submenu.classList.contains('submenu')) return;
    
    // Fermer les autres sous-menus ouverts
    const allOpenSubmenus = document.querySelectorAll('.submenu.open');
    allOpenSubmenus.forEach(openSubmenu => {
        if (openSubmenu !== submenu) {
            openSubmenu.classList.remove('open');
            const otherToggle = openSubmenu.previousElementSibling;
            if (otherToggle) {
                otherToggle.classList.remove('active');
                const otherArrow = otherToggle.querySelector('.arrow');
                if (otherArrow) otherArrow.textContent = '▼';
            }
        }
    });
    
    // Basculer le sous-menu actuel
    submenu.classList.toggle('open');
    element.classList.toggle('active');
    
    const arrow = element.querySelector('.arrow');
    if (arrow) {
        arrow.textContent = submenu.classList.contains('open') ? '▲' : '▼';
    }
}

// Animation des nombres - VERSION CORRIGÉE
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    statNumber.textContent = Math.floor(current);
                }, 16);
                
                observer.unobserve(statNumber);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// Fonctionnalité du carrousel - VERSION CORRIGÉE
function initCarousel() {
    console.log('Initialisation du carrousel...');
    
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentSlide = 0;
    let autoSlideInterval;
    let isAnimating = false;

    // Fonction pour changer de slide
    function goToSlide(slideIndex) {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // Retirer la classe active de tous les slides et indicateurs
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Gérer les limites
        if (slideIndex >= slides.length) {
            currentSlide = 0;
        } else if (slideIndex < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = slideIndex;
        }
        
        // Ajouter la classe active au slide et indicateur actuels
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
            isAnimating = false;
        }, 50);
    }

    // Fonction pour le slide suivant
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // Fonction pour le slide précédent
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Défilement automatique
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Événements pour les boutons de navigation
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    // Événements pour les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    // Pause au survol
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', stopAutoSlide);
        heroSection.addEventListener('mouseleave', startAutoSlide);
    }

    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });

    // Redémarrer le carrousel si la page devient visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });

    // Initialisation
    goToSlide(0);
    startAutoSlide();
}

// Gestion du défilement fluide
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
    console.log('NEBULA - Initialisation de la plateforme');
    
    // Éléments DOM
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const heroScroll = document.querySelector('.hero-scroll');
    
    // Écouteurs d'événements
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSubmenu(this);
        });
    });
    
    // Fermer le sidebar en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open') && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            toggleSidebar();
        }
    });
    
    // Fermer le sidebar avec la touche Échap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    // Initialisation des fonctionnalités
    initCarousel();
    animateNumbers();
    
    // Animation du bouton de défilement hero
    if (heroScroll) {
        heroScroll.addEventListener('click', function() {
            smoothScrollTo('.sections-grid');
        });
    }

    console.log('NEBULA - Initialisation terminée');
});