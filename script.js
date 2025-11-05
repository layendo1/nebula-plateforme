// Fonctionnalités de base
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        
        // Empêcher le défilement du body quand le sidebar est ouvert
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
    
    // Animation de la flèche
    const arrow = element.querySelector('.arrow');
    if (arrow) {
        arrow.textContent = submenu.classList.contains('open') ? '▲' : '▼';
    }
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

// Animation au défilement
function checkScroll() {
    const sections = document.querySelectorAll('.section-card');
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < windowHeight - 100) {
            section.classList.add('animate');
        }
    });
}

// Initialisation après chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('NEBULA - Initialisation de la plateforme');
    
    // Éléments DOM
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const heroScroll = document.querySelector('.hero-scroll');
    const sections = document.querySelectorAll('.section-card');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    // Vérification des éléments critiques
    if (!sidebar) {
        console.error('Sidebar non trouvé');
        return;
    }

    // Écouteur pour le bouton du menu hamburger
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // Écouteur pour le bouton de fermeture du sidebar
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    // Écouteurs pour les sous-menus
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSubmenu(this);
        });
    });
    
    // Fermer le sidebar en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            toggleSidebar();
        }
    });
    
    // Fermer le sidebar avec la touche Échap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    // Animation au défilement
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Initialiser les animations de défilement
    initScrollAnimations();
    
    // Animation du bouton de défilement hero
    if (heroScroll) {
        heroScroll.addEventListener('click', function() {
            smoothScrollTo('.sections-grid');
        });
    }
    
    // Interactions des cartes
    function initCardInteractions() {
        sections.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            // Animation au clic
            card.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return; // Ne pas animer les clics sur les liens
                this.style.transform = 'translateY(-5px) scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-10px)';
                }, 150);
            });
        });
    }
    
    initCardInteractions();
    
    // Animation des boutons d'action
    function initButtonInteractions() {
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0) scale(0.95)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-3px) scale(1)';
            });
        });
    }
    
    initButtonInteractions();
    
    // Gestion des liens sociaux
    function initSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        });
    }
    
    initSocialLinks();
    
    // Gestion responsive
    function handleResize() {
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Amélioration de l'accessibilité
    function enhanceAccessibility() {
        // Ajouter les attributs ARIA
        if (menuToggle) {
            menuToggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-controls', 'sidebar');
        }
        
        if (sidebar) {
            sidebar.setAttribute('aria-hidden', 'true');
            sidebar.setAttribute('aria-label', 'Menu de navigation principal');
        }
        
        // Mettre à jour les états ARIA
        menuToggle.addEventListener('click', function() {
            const isOpen = sidebar.classList.contains('open');
            this.setAttribute('aria-expanded', isOpen);
            sidebar.setAttribute('aria-hidden', !isOpen);
        });
        
        // Navigation au clavier dans le sidebar
        sidebar.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                toggleSidebar();
                menuToggle.focus();
            }
        });
    }
    
    enhanceAccessibility();
    
    // Initialisation des performances
    function initPerformance() {
        // Préchargement des images critiques
        const criticalImages = [
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    initPerformance();
    
    console.log('NEBULA - Initialisation terminée');
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Gestion des promesses non catchées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée non gérée:', e.reason);
});

// Ajoutez cette fonction dans votre script.js

function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                const duration = 2000; // 2 secondes
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                statNumber.classList.add('animated');
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    statNumber.textContent = `+${Math.floor(current)}`;
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

// Appelez cette fonction après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    animateNumbers();
});

// Fonctionnalité du carrousel
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let autoSlideInterval;

    // Fonction pour changer de slide
    function goToSlide(slideIndex) {
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
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
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
        autoSlideInterval = setInterval(nextSlide, 5000); // Change toutes les 5 secondes
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Événements
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    // Événements pour les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
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
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });

    // Démarrer le défilement automatique
    startAutoSlide();
}

// Initialiser le carrousel après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
});