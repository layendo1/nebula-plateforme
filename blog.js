// ===== DONNÉES INITIALES =====
let questions = [
    {
        id: 1,
        title: "Comment résoudre une équation du second degré ?",
        content: "Je n'arrive pas à comprendre comment utiliser le discriminant dans les équations du type ax² + bx + c = 0. Quelqu'un peut m'expliquer ?",
        sujet: "pedagogique",
        tags: [],
        auteur: "Marie D.",
        date: "2024-01-15",
        votes: 24,
        reponses: 5,
        resolu: true,
        reponsesListe: [
            {
                id: 1,
                auteur: "Prof. Martin",
                date: "2024-01-15",
                content: "Le discriminant Δ se calcule avec b² - 4ac. Si Δ > 0, deux solutions ; Δ = 0, une solution ; Δ < 0, pas de solution réelle.",
                votes: 15
            },
            {
                id: 2,
                auteur: "Jean K.",
                date: "2024-01-16",
                content: "Je te conseille cette vidéo qui explique très bien : https://youtu.be/exemple",
                votes: 8
            }
        ]
    },
    {
        id: 2,
        title: "Quels sont les horaires d'ouverture de la bibliothèque ?",
        content: "Je voudrais savoir à quelle heure ouvre et ferme la bibliothèque du campus principal.",
        sujet: "demande-info",
        tags: [],
        auteur: "Lucas P.",
        date: "2024-01-14",
        votes: 18,
        reponses: 3,
        resolu: true
    },
    {
        id: 3,
        title: "Comment organiser son temps de révision efficacement ?",
        content: "Je prépare mes examens et je cherche des méthodes pour organiser mon temps de révision de manière optimale.",
        sujet: "organisation",
        tags: [],
        auteur: "Sophie L.",
        date: "2024-01-16",
        votes: 12,
        reponses: 0,
        resolu: false
    },
    {
        id: 4,
        title: "Problème de connexion à la plateforme NEBULA",
        content: "Je n'arrive pas à me connecter à la plateforme depuis hier. Le message d'erreur indique 'connexion refusée'.",
        sujet: "technique",
        tags: [],
        auteur: "Thomas R.",
        date: "2024-01-13",
        votes: 31,
        reponses: 7,
        resolu: true
    },
    {
        id: 5,
        title: "Quelles sont les bonnes pratiques pour travailler en groupe ?",
        content: "Nous devons faire un projet en groupe de 4 personnes et je cherche des conseils pour travailler efficacement ensemble.",
        sujet: "general",
        tags: [],
        auteur: "Emma T.",
        date: "2024-01-15",
        votes: 9,
        reponses: 2,
        resolu: false
    },
    {
        id: 6,
        title: "Où trouver des ressources supplémentaires en mathématiques ?",
        content: "Je cherche des sites web ou des livres pour approfondir mes connaissances en mathématiques niveau terminale.",
        sujet: "ressources",
        tags: [],
        auteur: "Alex B.",
        date: "2024-01-12",
        votes: 22,
        reponses: 4,
        resolu: true
    }
];

// ===== DOM ELEMENTS =====
const questionsContainer = document.getElementById('questions-container');
const questionForm = document.getElementById('question-form');
const filterTags = document.querySelectorAll('.filter-tag');
const sortSelect = document.getElementById('sort-select');
const modal = document.getElementById('question-modal');
const closeModal = document.querySelector('.close-modal');
const modalContent = document.getElementById('modal-content');
const menuToggle = document.getElementById('menuToggle');

// ===== VARIABLES D'ÉTAT =====
let currentFilter = 'all';
let currentSort = 'recent';

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Créer les particules animées
    createParticles();
    
    // Charger d'abord les données
    loadFromLocalStorage();
    
    // Initialiser l'application
    setupEventListeners();
    displayQuestions();
});

// ===== FONCTIONS UTILITAIRES =====

// Créer les particules
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 8}s`;
        particle.style.opacity = Math.random() * 0.4 + 0.1;
        
        particlesContainer.appendChild(particle);
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Menu toggle
    menuToggle.addEventListener('click', () => {
        alert('Menu de navigation - Fonctionnalité à venir');
    });

    // Filtres
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.dataset.filter;
            displayQuestions();
            
            // Animation douce
            questionsContainer.style.opacity = '0.5';
            setTimeout(() => {
                questionsContainer.style.opacity = '1';
            }, 300);
        });
    });

    // Tri
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayQuestions();
        
        // Feedback visuel
        sortSelect.style.transform = 'scale(0.95)';
        setTimeout(() => {
            sortSelect.style.transform = 'scale(1)';
        }, 200);
    });

    // Formulaire
    questionForm.addEventListener('submit', submitQuestion);

    // Modal
    closeModal.addEventListener('click', () => {
        closeModalFunc();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Fermer modal avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModalFunc();
        }
    });
}

// Afficher les questions
function displayQuestions() {
    let filteredQuestions = [...questions];

    // Filtrage
    if (currentFilter !== 'all') {
        filteredQuestions = filteredQuestions.filter(q => q.sujet === currentFilter);
    }

    // Tri
    filteredQuestions.sort((a, b) => {
        switch (currentSort) {
            case 'votes':
                return b.votes - a.votes;
            case 'reponses':
                return b.reponses - a.reponses;
            case 'non-repondu':
                return a.reponses - b.reponses;
            case 'recent':
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    // Génération du HTML
    questionsContainer.innerHTML = '';

    if (filteredQuestions.length === 0) {
        questionsContainer.innerHTML = `
            <div class="no-questions" style="text-align: center; padding: 4rem 2rem; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 4rem; color: var(--secondary-color); margin-bottom: 1.5rem; opacity: 0.7;"></i>
                <h3 style="color: var(--gold-light); margin-bottom: 1rem; font-size: 1.5rem;">Aucune question trouvée</h3>
                <p style="font-size: 1.1rem; max-width: 500px; margin: 0 auto 2rem;">Soyez le premier à poser une question sur ce sujet !</p>
                <button onclick="document.getElementById('question-form').scrollIntoView({behavior: 'smooth'})" 
                        style="background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%); 
                               color: white; border: none; padding: 12px 30px; border-radius: 30px; cursor: pointer; 
                               font-weight: 600; transition: var(--transition);">
                    <i class="fas fa-plus-circle"></i> Poser une question
                </button>
            </div>
        `;
        return;
    }

    filteredQuestions.forEach(question => {
        const questionElement = createQuestionElement(question);
        questionsContainer.appendChild(questionElement);
    });
}

// Créer un élément question
function createQuestionElement(question) {
    const div = document.createElement('div');
    div.className = 'question-card';
    div.dataset.id = question.id;

    // Texte selon le sujet
    const sujetTexts = {
        'demande-info': 'Demande de renseignement',
        'pedagogique': 'Questions pédagogiques',
        'general': 'Questions générales',
        'technique': 'Questions techniques',
        'organisation': 'Organisation',
        'ressources': 'Ressources'
    };

    // Extraire le titre du contenu (première phrase)
    const title = question.content.split('.')[0] + (question.content.includes('.') ? '...' : '');
    
    div.innerHTML = `
        <div class="question-header">
            <h3 class="question-title">${title}</h3>
            <span class="question-sujet sujet-${question.sujet}">
                ${sujetTexts[question.sujet]}
            </span>
        </div>
        <div class="question-content">
            ${question.content.substring(0, 200)}${question.content.length > 200 ? '...' : ''}
        </div>
        <div class="question-footer">
            <div class="question-meta">
                <span class="meta-item">
                    <i class="fas fa-user"></i> ${question.auteur}
                </span>
                <span class="meta-item">
                    <i class="far fa-calendar"></i> ${formatDate(question.date)}
                </span>
                <span class="meta-item">
                    <i class="fas fa-thumbs-up"></i> ${question.votes}
                </span>
                <span class="meta-item">
                    <i class="fas fa-comments"></i> ${question.reponses} réponse${question.reponses !== 1 ? 's' : ''}
                </span>
                ${question.resolu ? '<span class="meta-item"><i class="fas fa-check-circle" style="color: #06D6A0;"></i> Résolu</span>' : ''}
            </div>
            <div>
                <button class="delete-btn" onclick="deleteQuestion(${question.id}, event)">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            </div>
        </div>
    `;

    div.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-btn')) {
            showQuestionDetails(question.id);
        }
    });
    return div;
}

// Afficher les détails d'une question
function showQuestionDetails(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const sujetTexts = {
        'demande-info': 'Demande de renseignement',
        'pedagogique': 'Questions pédagogiques',
        'general': 'Questions générales',
        'technique': 'Questions techniques',
        'organisation': 'Organisation',
        'ressources': 'Ressources'
    };

    let reponsesHTML = '';
    if (question.reponsesListe && question.reponsesListe.length > 0) {
        reponsesHTML = `
            <div class="reponses-section" style="margin-top: 2rem;">
                <h3 style="color: var(--gold-light); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-comments"></i> Réponses (${question.reponsesListe.length})
                </h3>
                ${question.reponsesListe.map((reponse) => `
                    <div class="reponse-card" style="background: rgba(30, 30, 30, 0.7); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border-left: 3px solid var(--gold-light); position: relative;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 10px;">
                            <strong style="color: var(--gold-light);">${reponse.auteur}</strong>
                            <small style="color: var(--text-light);">${formatDate(reponse.date)}</small>
                        </div>
                        <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 1rem;">${reponse.content}</p>
                        <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: var(--text-light); display: flex; align-items: center; gap: 10px;">
                                <button onclick="voteReponse(${question.id}, ${reponse.id})" style="background: none; border: 1px solid rgba(127, 107, 0, 0.3); color: var(--gold-light); padding: 5px 15px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: var(--transition);">
                                    <i class="fas fa-thumbs-up"></i> Utile (${reponse.votes})
                                </button>
                            </div>
                            <button onclick="deleteReponse(${question.id}, ${reponse.id})" style="background: rgba(239, 71, 111, 0.1); color: #EF476F; border: 1px solid rgba(239, 71, 111, 0.3); padding: 5px 15px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; transition: var(--transition);">
                                <i class="fas fa-trash-alt"></i> Supprimer
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    modalContent.innerHTML = `
        <div class="question-detail">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;">
                <span class="question-sujet sujet-${question.sujet}" style="font-size: 0.9rem;">
                    ${sujetTexts[question.sujet]}
                </span>
                <span style="color: var(--text-light); font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                    <i class="far fa-calendar"></i> ${formatDate(question.date)}
                </span>
            </div>
            
            <h2 style="margin-bottom: 1.5rem; color: var(--text-color); font-size: 1.8rem; line-height: 1.4;">${question.content.split('.')[0] + (question.content.includes('.') ? '...' : '')}</h2>
            
            <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-user" style="color: var(--gold-light);"></i>
                <strong style="color: var(--text-color);">${question.auteur}</strong>
            </div>
            
            <div style="background: rgba(30, 30, 30, 0.7); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid rgba(127, 107, 0, 0.2);">
                <p style="line-height: 1.6; color: var(--text-light); font-size: 1.1rem;">${question.content}</p>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
                <button class="vote-btn" data-id="${question.id}" style="padding: 10px 25px; background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition); border: 1px solid rgba(127, 107, 0, 0.5);">
                    <i class="fas fa-thumbs-up"></i> Utile (${question.votes})
                </button>
                <button class="resolve-btn" data-id="${question.id}" style="padding: 10px 25px; background: rgba(6, 214, 160, 0.1); color: #06D6A0; border: 1px solid rgba(6, 214, 160, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition);">
                    <i class="fas fa-check"></i> ${question.resolu ? 'Question résolue' : 'Marquer comme résolu'}
                </button>
                <button onclick="deleteQuestion(${question.id})" style="padding: 10px 25px; background: rgba(239, 71, 111, 0.1); color: #EF476F; border: 1px solid rgba(239, 71, 111, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition);">
                    <i class="fas fa-trash-alt"></i> Supprimer la question
                </button>
            </div>
            
            <div class="form-reponse" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(127, 107, 0, 0.3);">
                <h4 style="color: var(--gold-light); margin-bottom: 1rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-reply"></i> Ajouter une réponse
                </h4>
                <textarea id="reponse-text" placeholder="Votre réponse..." rows="4" style="width: 100%; padding: 15px; background: rgba(30, 30, 30, 0.7); border: 1px solid rgba(127, 107, 0, 0.3); border-radius: 8px; color: var(--text-color); font-family: 'Montserrat', sans-serif; transition: var(--transition); outline: none; margin-bottom: 1rem;"></textarea>
                <div style="display: flex; gap: 1rem;">
                    <button id="submit-reponse" data-id="${question.id}" style="padding: 12px 30px; background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition); border: 1px solid rgba(127, 107, 0, 0.5);">
                        <i class="fas fa-paper-plane"></i> Publier la réponse
                    </button>
                    <button onclick="closeModalFunc()" style="padding: 12px 30px; background: rgba(255, 255, 255, 0.1); color: var(--text-light); border: 1px solid rgba(127, 107, 0, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: var(--transition);">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                </div>
            </div>
            
            ${reponsesHTML}
        </div>
    `;

    // Ajouter les événements dans le modal
    const voteBtn = modalContent.querySelector('.vote-btn');
    const resolveBtn = modalContent.querySelector('.resolve-btn');
    const submitReponseBtn = modalContent.querySelector('#submit-reponse');

    if (voteBtn) {
        voteBtn.addEventListener('click', () => voteQuestion(question.id));
    }

    if (resolveBtn) {
        resolveBtn.addEventListener('click', () => resolveQuestion(question.id));
    }

    if (submitReponseBtn) {
        submitReponseBtn.addEventListener('click', () => submitReponse(question.id));
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Soumettre une question
function submitQuestion(e) {
    e.preventDefault();

    const content = document.getElementById('question-content').value;
    const sujet = document.getElementById('question-sujet').value;

    if (!content || !sujet) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    // Trouver le plus grand ID existant
    const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 0;
    
    const newQuestion = {
        id: maxId + 1,
        title: content.split('.')[0] + (content.includes('.') ? '...' : ''),
        content,
        sujet,
        tags: [],
        auteur: "Vous",
        date: new Date().toISOString().split('T')[0],
        votes: 0,
        reponses: 0,
        resolu: false,
        reponsesListe: []
    };

    questions.unshift(newQuestion);
    saveToLocalStorage();
    displayQuestions();

    // Réinitialiser le formulaire
    questionForm.reset();
    
    // Afficher un message de succès
    showNotification('Question publiée avec succès !', 'success');
    
    // Scroll vers la nouvelle question
    setTimeout(() => {
        const firstQuestion = document.querySelector('.question-card');
        if (firstQuestion) {
            firstQuestion.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
}

// Soumettre une réponse
function submitReponse(questionId) {
    const reponseText = document.getElementById('reponse-text').value;
    if (!reponseText.trim()) {
        showNotification('Veuillez écrire une réponse', 'error');
        return;
    }

    const question = questions.find(q => q.id === questionId);
    if (question) {
        if (!question.reponsesListe) {
            question.reponsesListe = [];
        }

        // Trouver le plus grand ID de réponse
        const maxReponseId = question.reponsesListe.length > 0 ? 
            Math.max(...question.reponsesListe.map(r => r.id)) : 0;

        question.reponsesListe.push({
            id: maxReponseId + 1,
            auteur: "Vous",
            date: new Date().toISOString().split('T')[0],
            content: reponseText,
            votes: 0
        });

        question.reponses++;
        saveToLocalStorage();
        showQuestionDetails(questionId);
        showNotification('Réponse publiée avec succès !', 'success');
        
        // Mettre à jour l'affichage
        displayQuestions();
    }
}

// Supprimer une question
function deleteQuestion(questionId, event = null) {
    if (event) event.stopPropagation();
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.')) {
        const questionIndex = questions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            questions.splice(questionIndex, 1);
            saveToLocalStorage();
            displayQuestions();
            closeModalFunc();
            showNotification('Question supprimée avec succès', 'success');
        }
    }
}

// Supprimer une réponse
function deleteReponse(questionId, reponseId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
        const question = questions.find(q => q.id === questionId);
        if (question && question.reponsesListe) {
            const reponseIndex = question.reponsesListe.findIndex(r => r.id === reponseId);
            if (reponseIndex !== -1) {
                question.reponsesListe.splice(reponseIndex, 1);
                question.reponses = Math.max(0, question.reponses - 1);
                saveToLocalStorage();
                showQuestionDetails(questionId);
                showNotification('Réponse supprimée avec succès', 'success');
            }
        }
    }
}

// Voter pour une question
function voteQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.votes++;
        saveToLocalStorage();
        showQuestionDetails(questionId);
        displayQuestions();
        showNotification('Votre vote a été enregistré !', 'success');
    }
}

// Voter pour une réponse
function voteReponse(questionId, reponseId) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.reponsesListe) {
        const reponse = question.reponsesListe.find(r => r.id === reponseId);
        if (reponse) {
            reponse.votes++;
            saveToLocalStorage();
            showQuestionDetails(questionId);
            showNotification('Votre vote a été enregistré !', 'success');
        }
    }
}

// Marquer comme résolu
function resolveQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.resolu = !question.resolu;
        saveToLocalStorage();
        showQuestionDetails(questionId);
        displayQuestions();
        showNotification(question.resolu ? 'Question marquée comme résolue !' : 'Question marquée comme non résolue', 'success');
    }
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    
    return date.toLocaleDateString('fr-FR');
}

// Sauvegarder dans localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('supportApprenant_questions', JSON.stringify(questions));
        console.log('Données sauvegardées:', questions.length, 'questions');
    } catch (e) {
        console.error('Erreur lors de la sauvegarde :', e);
        showNotification('Erreur lors de la sauvegarde des données', 'error');
    }
}

// Charger depuis localStorage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('supportApprenant_questions');
        console.log('Données chargées depuis localStorage:', saved);
        
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('Données parsées:', parsed.length, 'questions');
            
            // Vérifier si nous avons des questions sauvegardées
            if (Array.isArray(parsed) && parsed.length > 0) {
                questions = [...parsed];
                console.log('Questions chargées depuis localStorage:', questions);
            } else {
                console.log('Utilisation des questions par défaut');
                saveToLocalStorage(); // Sauvegarder les données par défaut
            }
        } else {
            console.log('Aucune donnée sauvegardée, utilisation des données par défaut');
            saveToLocalStorage();
        }
    } catch (e) {
        console.error('Erreur lors du chargement :', e);
        showNotification('Erreur lors du chargement des données', 'error');
        questions = [...defaultQuestions];
        saveToLocalStorage();
    }
}

// Garder une copie des questions par défaut pour réinitialisation
const defaultQuestions = [...questions];

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid;
        font-family: 'Montserrat', sans-serif;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #06D6A0 0%, #04B486 100%)';
        notification.style.borderColor = 'rgba(6, 214, 160, 0.3)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #EF476F 0%, #D43A5C 100%)';
        notification.style.borderColor = 'rgba(239, 71, 111, 0.3)';
    } else {
        notification.style.background = 'linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%)';
        notification.style.borderColor = 'rgba(127, 107, 0, 0.3)';
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonction pour fermer le modal
function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Ajouter les styles d'animation pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== OUTILS DE DÉVELOPPEMENT =====
// Exporter les questions
function exportQuestions() {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'questions-support-apprenant.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Fonction pour réinitialiser aux questions par défaut
function resetToDefaultQuestions() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les questions ? Cette action est irréversible.')) {
        questions = [...defaultQuestions];
        saveToLocalStorage();
        displayQuestions();
        showNotification('Questions réinitialisées avec succès', 'success');
    }
}

// Pour le débogage : ajouter la fonction à la console
window.supportApprenant = {
    questions,
    exportQuestions,
    resetToDefaultQuestions,
    clearStorage: () => {
        if (confirm('Voulez-vous vraiment effacer toutes les données ?')) {
            localStorage.clear();
            location.reload();
        }
    },
    debugInfo: () => {
        console.log('=== DEBUG INFO ===');
        console.log('Questions en mémoire:', questions.length);
        console.log('Questions sauvegardées:', JSON.parse(localStorage.getItem('supportApprenant_questions') || '[]').length);
        console.log('Questions détaillées:', questions);
    }
};

console.log('Support Apprenant NEBULA initialisé. Utilisez supportApprenant dans la console pour les outils de développement.');