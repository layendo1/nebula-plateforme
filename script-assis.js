class AssistantKhadija {
    constructor() {
        this.widget = document.getElementById('assistantWidget');
        this.chatHistory = document.getElementById('chatHistory');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.micBtn = document.getElementById('micBtn');
        this.imageBtn = document.getElementById('imageBtn');
        this.imageUpload = document.getElementById('imageUpload');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.removeImage = document.getElementById('removeImage');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.loadingText = document.getElementById('loadingText');
        this.suggestionChips = document.getElementById('suggestionChips');
        this.settingsBtn = document.getElementById('settings-btn');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettings = document.getElementById('close-settings');
        this.soundToggle = document.getElementById('sound-toggle');
        
        this.isMinimized = false;
        this.isRecording = false;
        this.attachedImage = null;
        
        this.settings = {
            soundEnabled: true,
            theme: 'light',
            textSize: 'normal'
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.bindEvents();
        this.loadChatHistory();
        this.renderSuggestions();
        console.log('Assistant Khadija initialisé !');
    }
    
    bindEvents() {
        // Envoi de messages
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Upload d'images
        this.imageBtn.addEventListener('click', () => this.imageUpload.click());
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        this.removeImage.addEventListener('click', () => this.removeAttachedImage());
        
        // Contrôles du widget
        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettings();
        });
        
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });
        
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide();
        });
        
        this.closeSettings.addEventListener('click', () => this.toggleSettings());
        
        // Header pour restaurer
        this.widget.querySelector('.widget-header').addEventListener('click', () => {
            if (this.isMinimized) {
                this.toggleMinimize();
            }
        });
        
        // Paramètres
        this.setupSettingsEvents();
        
        // Clic externe pour fermer les settings
        document.addEventListener('click', (e) => {
            if (this.settingsPanel && !this.settingsPanel.contains(e.target) && 
                this.settingsBtn && !this.settingsBtn.contains(e.target)) {
                this.widget.classList.remove('settings-visible');
            }
        });
    }
    
    setupSettingsEvents() {
        // Thème
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.theme = e.target.dataset.theme;
                this.applySettings();
            });
        });
        
        // Taille du texte
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.textSize = e.target.dataset.size;
                this.applySettings();
            });
        });
        
        // Son
        if (this.soundToggle) {
            this.soundToggle.addEventListener('change', () => {
                this.settings.soundEnabled = this.soundToggle.checked;
                this.saveSettings();
            });
        }
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message && !this.attachedImage) return;
        
        // Ajouter le message utilisateur
        let userMessageHTML = message;
        if (this.attachedImage) {
            userMessageHTML += `<br><img src="${this.attachedImage.dataUrl}" class="user-image" alt="Image envoyée" style="max-width: 200px; border-radius: 8px;">`;
        }
        
        this.addMessage(userMessageHTML, 'user');
        this.saveToHistory(userMessageHTML, 'user');
        
        this.chatInput.value = '';
        this.removeAttachedImage();
        this.showLoading(true);
        this.suggestionChips.innerHTML = '';
        
        try {
            // Simuler un délai de traitement
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Générer une réponse simulée
            const aiResponse = this.generateResponse(message);
            this.addMessage(aiResponse, 'ai');
            this.saveToHistory(aiResponse, 'ai');
            
        } catch (error) {
            console.error('Erreur:', error);
            this.addMessage("Désolé, une erreur s'est produite. Veuillez réessayer.", 'ai', true);
        } finally {
            this.showLoading(false);
            this.renderSuggestions();
        }
    }
    
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
            return "👋 Bonjour ! Je suis Khadija, votre assistante éducative. Je suis ravie de vous aider avec la plateforme NEBULA !";
        } else if (lowerMessage.includes('math') || lowerMessage.includes('calcul')) {
            return "🔢 <strong>Ressources Mathématiques</strong><br>Je peux vous aider avec les mathématiques ! Voici quelques ressources :<br>• Cours de géométrie pour le CM2<br>• Exercices d'algèbre pour la 3ème<br>• Problèmes de logique";
        } else if (lowerMessage.includes('français') || lowerMessage.includes('lecture')) {
            return "📚 <strong>Ressources Français</strong><br>Pour le français, nous avons :<br>• Grammaire et conjugaison<br>• Textes littéraires<br>• Exercices de compréhension";
        } else if (lowerMessage.includes('science') || lowerMessage.includes('svt')) {
            return "🔬 <strong>Ressources Scientifiques</strong><br>Les sciences sont fascinantes ! Je peux vous orienter vers :<br>• Biologie et SVT<br>• Physique-Chimie<br>• Sciences de la Terre";
        } else if (lowerMessage.includes('primaire')) {
            return "🎒 <strong>Ressources Primaire</strong><br>Pour le primaire (CI à CM2), nous avons des ressources adaptées dans toutes les matières fondamentales.";
        } else if (lowerMessage.includes('secondaire')) {
            return "🎓 <strong>Ressources Secondaire</strong><br>Au secondaire (6ème à Terminale), nous couvrons toutes les disciplines avec des ressources pour préparer les examens.";
        } else if (lowerMessage.includes('merci')) {
            return "😊 Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
        } else {
            return "🤔 <strong>Comment puis-je vous aider ?</strong><br>Je peux vous aider à :<br>• Trouver des ressources pédagogiques<br>• Expliquer des concepts complexes<br>• Vous guider sur la plateforme NEBULA<br><br>N'hésitez pas à être plus spécifique dans votre demande !";
        }
    }
    
    addMessage(content, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        if (isError) messageDiv.classList.add('error');
        messageDiv.innerHTML = content;
        
        this.chatHistory.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.addMessage("Veuillez sélectionner une image valide.", 'ai', true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            this.attachedImage = {
                dataUrl,
                mimeType: file.type
            };
            
            this.previewImage.src = dataUrl;
            this.imagePreview.classList.remove('hidden');
        };
        
        reader.onerror = () => {
            this.addMessage("Erreur lors du chargement de l'image.", 'ai', true);
        };
        
        reader.readAsDataURL(file);
    }
    
    removeAttachedImage() {
        this.attachedImage = null;
        this.imagePreview.classList.add('hidden');
        this.imageUpload.value = '';
    }
    
    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('hidden');
            this.chatInput.disabled = true;
            this.sendBtn.disabled = true;
        } else {
            this.loadingIndicator.classList.add('hidden');
            this.chatInput.disabled = false;
            this.sendBtn.disabled = false;
            this.chatInput.focus();
        }
    }
    
    scrollToBottom() {
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.widget.classList.toggle('minimized', this.isMinimized);
    }
    
    toggleSettings() {
        this.widget.classList.toggle('settings-visible');
    }
    
    hide() {
        this.widget.style.display = 'none';
    }
    
    show() {
        this.widget.style.display = 'flex';
        if (this.isMinimized) {
            this.toggleMinimize();
        }
    }
    
    // Gestion des paramètres
    loadSettings() {
        const saved = localStorage.getItem('nebulaAssistantSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('nebulaAssistantSettings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        // Thème
        document.body.setAttribute('data-theme', this.settings.theme);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
        
        // Taille texte
        document.body.setAttribute('data-text-size', this.settings.textSize);
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.settings.textSize);
        });
        
        // Son
        if (this.soundToggle) {
            this.soundToggle.checked = this.settings.soundEnabled;
        }
        
        this.saveSettings();
    }
    
    // Historique
    loadChatHistory() {
        const saved = localStorage.getItem('nebulaAssistantHistory');
        if (saved) {
            const history = JSON.parse(saved);
            history.forEach(msg => {
                this.addMessage(msg.content, msg.sender, msg.isError);
            });
        } else {
            this.showWelcomeMessage();
        }
    }
    
    saveToHistory(content, sender, isError = false) {
        const history = JSON.parse(localStorage.getItem('nebulaAssistantHistory') || '[]');
        history.push({ content, sender, isError, timestamp: Date.now() });
        
        // Garder seulement les 50 derniers messages
        if (history.length > 50) {
            history.shift();
        }
        
        localStorage.setItem('nebulaAssistantHistory', JSON.stringify(history));
    }
    
    showWelcomeMessage() {
        const welcomeMsg = `
            <strong>👋 Bonjour ! Je suis Khadija</strong><br><br>
            Je suis votre assistante éducative pour la plateforme <strong>NEBULA</strong>. Je peux vous aider à :<br><br>
            • 📚 Trouver des ressources pédagogiques<br>
            • 🎓 Expliquer des concepts complexes<br>
            • 🔍 Vous guider dans l'utilisation de la plateforme<br>
            • 📝 Répondre à vos questions éducatives<br><br>
            <em>N'hésitez pas à me poser vos questions en français !</em>
        `;
        this.addMessage(welcomeMsg, 'ai');
        this.saveToHistory(welcomeMsg, 'ai');
    }
    
    // Suggestions
    renderSuggestions() {
        const suggestions = [
            "Trouver des ressources pour le CM2",
            "Expliquer un concept de mathématiques",
            "Aide avec les sciences physiques",
            "Ressources pour enseignants"
        ];
        
        this.suggestionChips.innerHTML = '';
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.addEventListener('click', () => {
                this.chatInput.value = suggestion;
                this.sendMessage();
            });
            this.suggestionChips.appendChild(chip);
        });
    }
}

// Initialiser l'assistant quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AssistantKhadija();
    });
} else {
    new AssistantKhadija();
}