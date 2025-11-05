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

// Animation des nombres
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

    console.log('Éléments trouvés:', {
        slides: slides.length,
        indicators: indicators.length,
        prevBtn: !!prevBtn,
        nextBtn: !!nextBtn
    });

    // Fonction pour changer de slide
    function goToSlide(slideIndex) {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // Retirer la classe active de tous les slides et indicateurs
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Gérer les limites
        if (slideIndex >= slides.length) {
            currentSlide = 0;
        } else if (slideIndex < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = slideIndex;
        }
        
        console.log('Changement vers slide:', currentSlide);
        
        // Ajouter la classe active au slide et indicateur actuels
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
            isAnimating = false;
        }, 50);
    }

    // Fonction pour le slide suivant
    function nextSlide() {
        console.log('Slide suivant');
        goToSlide(currentSlide + 1);
    }

    // Fonction pour le slide précédent
    function prevSlide() {
        console.log('Slide précédent');
        goToSlide(currentSlide - 1);
    }

    // Défilement automatique
    function startAutoSlide() {
        console.log('Démarrage du défilement automatique');
        stopAutoSlide(); // S'assurer qu'aucun intervalle n'est déjà en cours
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
            e.stopPropagation();
            console.log('Clic sur next');
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    } else {
        console.error('Bouton next non trouvé');
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur prev');
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    } else {
        console.error('Bouton prev non trouvé');
    }

    // Événements pour les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur indicateur:', index);
            goToSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    // Pause au survol
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            console.log('Survol - pause auto');
            stopAutoSlide();
        });
        
        heroSection.addEventListener('mouseleave', () => {
            console.log('Fin survol - reprise auto');
            startAutoSlide();
        });
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
    console.log('Initialisation du premier slide');
    goToSlide(0);
    startAutoSlide();

    // Debug: Vérifier l'état initial
    setTimeout(() => {
        console.log('État initial du carrousel:', {
            slidesActifs: document.querySelectorAll('.carousel-slide.active').length,
            indicateursActifs: document.querySelectorAll('.indicator.active').length,
            currentSlide: currentSlide
        });
    }, 100);
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
    
    // Gestion de l'assistant
    const assistantLauncher = document.getElementById('assistantLauncher');
    if (assistantLauncher) {
        assistantLauncher.addEventListener('click', function() {
            const assistant = document.getElementById('nebulaAssistant');
            if (assistant.style.display === 'none') {
                assistant.style.display = 'flex';
                if (assistant.innerHTML.trim() === '') {
                    loadAssistant();
                }
            } else {
                assistant.style.display = 'none';
            }
        });
    }

    console.log('NEBULA - Initialisation terminée');
});

// Fonctions pour l'assistant (gardez celles-ci)
function loadAssistant() {
    console.log('Chargement de l\'assistant...');
    createFallbackAssistant();
}

function createFallbackAssistant() {
    const assistantHTML = `
        <div class="assistant-widget" style="display: flex;">
            <header class="widget-header">
                <div class="header-content">
                    <div class="avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="header-text">
                        <h3>Assistant Khadija</h3>
                        <p>Votre assistante éducative</p>
                    </div>
                </div>
                <div class="widget-controls">
                    <button class="control-btn" onclick="toggleMinimize()">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="control-btn" onclick="hideAssistant()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </header>
            <div class="widget-content">
                <div class="chat-container">
                    <div class="chat-history" id="fallbackChatHistory">
                        <div class="message ai">
                            <strong>👋 Bonjour ! Je suis Khadija</strong><br><br>
                            Je suis votre assistante éducative pour NEBULA.
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" id="fallbackChatInput" placeholder="Posez votre question...">
                        <button class="input-btn send-btn" onclick="sendFallbackMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('nebulaAssistant').innerHTML = assistantHTML;
}

function toggleMinimize() {
    const widget = document.querySelector('.assistant-widget');
    if (widget) {
        widget.classList.toggle('minimized');
    }
}

function hideAssistant() {
    const assistant = document.getElementById('nebulaAssistant');
    if (assistant) {
        assistant.style.display = 'none';
    }
}

function sendFallbackMessage() {
    const input = document.getElementById('fallbackChatInput');
    const history = document.getElementById('fallbackChatHistory');
    
    if (!input || !history) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = message;
    history.appendChild(userMsg);
    
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai';
        aiMsg.innerHTML = "Je suis votre assistante NEBULA. En mode démonstration, je peux simuler des réponses à vos questions éducatives !";
        history.appendChild(aiMsg);
        history.scrollTop = history.scrollHeight;
    }, 1000);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;
}