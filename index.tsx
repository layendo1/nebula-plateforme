/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat, Type } from '@google/genai';
import { marked } from 'marked';

// Configure marked to open all links in a new tab for user convenience and security.
const renderer = new marked.Renderer();
// FIX: The signature for the marked.js link renderer has been updated.
// It now accepts a single token object. The `title` property is optional,
// and the link content is in the `tokens` property, which needs to be parsed.
// We use a standard function to get the correct `this` context for the parser.
renderer.link = function({ href, title, tokens }: { href: string; title?: string | null; tokens: any; }): string {
  const text = (this as any).parser.parseInline(tokens);
  return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};
marked.use({ renderer });


// DOM Elements
const body = document.body;
const chatContainer = document.querySelector('.chat-container') as HTMLElement;
const header = document.querySelector('header') as HTMLElement;
const chatHistory = document.getElementById('chat-history') as HTMLElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const submitButton = chatForm.querySelector('button[type="submit"]') as HTMLButtonElement;
const micButton = document.getElementById('mic-button') as HTMLButtonElement;
const imageUploadButton = document.getElementById('image-upload-button') as HTMLButtonElement;
const imageUploadInput = document.getElementById('image-upload-input') as HTMLInputElement;
const imagePreviewContainer = document.getElementById('image-preview-container') as HTMLElement;
const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
const removeImageButton = document.getElementById('remove-image-button') as HTMLButtonElement;
const loadingIndicator = document.getElementById('loading-indicator') as HTMLElement;
const loadingText = document.getElementById('loading-text') as HTMLElement;
const minimizeButton = document.getElementById('minimize-button') as HTMLButtonElement;
const closeButton = document.getElementById('close-button') as HTMLButtonElement;
const helpButton = document.getElementById('help-button') as HTMLButtonElement;
const settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
const settingsPanel = document.getElementById('settings-panel') as HTMLElement;
const closeSettingsButton = document.getElementById('close-settings-button') as HTMLButtonElement;
const soundToggle = document.getElementById('sound-toggle') as HTMLInputElement;
const soundThemeGroup = document.getElementById('sound-theme-group') as HTMLElement;
const clearHistoryButton = document.getElementById('clear-history-button') as HTMLButtonElement;
const uiLangSelect = document.getElementById('ui-lang-select') as HTMLSelectElement;
const themeToggle = document.getElementById('theme-toggle') as HTMLElement;
const textSizeToggle = document.getElementById('text-size-toggle') as HTMLElement;
const playbackSpeedToggle = document.getElementById('playback-speed-toggle') as HTMLElement;
const suggestionChipsContainer = document.getElementById('suggestion-chips-container') as HTMLElement;
const favoritesList = document.getElementById('favorites-list') as HTMLElement;
const shareButton = document.getElementById('share-button') as HTMLButtonElement;
const shareModalOverlay = document.getElementById('share-modal-overlay') as HTMLElement;
const closeShareModalButton = document.getElementById('close-share-modal-button') as HTMLButtonElement;
const copyTranscriptionButton = document.getElementById('copy-transcription-button') as HTMLButtonElement;
const exportPdfButton = document.getElementById('export-pdf-button') as HTMLButtonElement;
const userRoleSelect = document.getElementById('user-role-select') as HTMLSelectElement;
const userLevelSelect = document.getElementById('user-level-select') as HTMLSelectElement;
const avatarContainer = document.getElementById('avatar-container') as HTMLElement;

// Voice Settings DOM Elements
const voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;
const pitchSlider = document.getElementById('pitch-slider') as HTMLInputElement;
const voicePreviewButton = document.getElementById('voice-preview-button') as HTMLButtonElement;

// Advanced Search DOM Elements
const advancedSearchButton = document.getElementById('advanced-search-button') as HTMLButtonElement;
const advancedSearchModalOverlay = document.getElementById('advanced-search-modal-overlay') as HTMLElement;
const closeAdvancedSearchButton = document.getElementById('close-advanced-search-button') as HTMLButtonElement;
const advancedSearchForm = document.getElementById('advanced-search-form') as HTMLFormElement;
const searchSubjectInput = document.getElementById('search-subject-input') as HTMLInputElement;
const searchLevelSelect = document.getElementById('search-level-select') as HTMLSelectElement;
const searchTypeContainer = document.getElementById('search-type-container') as HTMLElement;
const searchResultsModalOverlay = document.getElementById('search-results-modal-overlay') as HTMLElement;
const closeSearchResultsButton = document.getElementById('close-search-results-button') as HTMLButtonElement;
const searchResultsContainer = document.getElementById('search-results-container') as HTMLElement;


// Web Audio API
let audioContext: AudioContext | null = null;
type SoundType = 'send' | 'receive' | 'startRec' | 'stopRec';
type SoundTheme = 'default' | 'soft' | 'digital';


// Chat History
const MAX_HISTORY_MESSAGES = 50;
type ChatMessage = { sender: 'user' | 'ai'; content: string; };
let chatHistoryLog: ChatMessage[] = [];

// App State
type Favorite = { url: string, title: string };
let favorites: Favorite[] = [];
let currentAudioSource: AudioBufferSourceNode | null = null;
let currentlyPlayingButton: HTMLButtonElement | null = null;
let loadingInterval: number | null = null;
let isFetchingSuggestions = false;
let isGoogleTtsAvailable = false;
const fallbackSuggestions = ["📚 Explorer les cours de science", "📝 Commencer un tutoriel de programmation", "🎓 Chercher des guides d'étude"];
let attachedImage: { base64: string; mimeType: string; dataUrl: string; } | null = null;


// App Settings
let settings = {
  soundEnabled: true,
  soundTheme: 'default' as SoundTheme,
  uiLang: 'fr',
  theme: 'light' as 'light' | 'dark',
  textSize: 'normal' as 'small' | 'normal' | 'large',
  playbackSpeed: 1,
  userRole: 'enseignant',
  userLevel: 'all',
  voiceName: '',
  pitch: 1,
};

// --- Internationalization (i18n) ---
const translations: Record<string, Record<string, string>> = {
  fr: {
    appTitle: "Nebula",
    appSubtitle: "Votre assistant pour la plateforme Nebula",
    settingsTitle: "Paramètres",
    uiLanguage: "Langue de l'interface",
    enableSounds: "Activer les sons",
    soundTheme: "Thème sonore",
    defaultTheme: "Défaut",
    softTheme: "Doux",
    digitalTheme: "Numérique",
    history: "Historique",
    clearHistory: "Vider l'historique",
    openSettings: "Ouvrir les paramètres",
    closeSettings: "Fermer les paramètres",
    help: "Aide",
    minimize: "Réduire la fenêtre",
    restore: "Agrandir la fenêtre",
    close: "Fermer la fenêtre",
    openChat: "Ouvrir l'assistante",
    recordMessage: "Enregistrer un message vocal",
    stopRecording: "Arrêter l'enregistrement",
    sendMessage: "Envoyer le message",
    chatPlaceholder: "Posez une question en français, wolof, arabe...",
    recordingPlaceholder: "Enregistrement en cours...",
    assistantThinking: "Nebula réfléchit...",
    analyzingRequest: "Analyse de votre demande...",
    consultingResources: "Consultation des ressources...",
    formulatingResponse: "Formulation de la réponse...",
    welcomeMessage: "Bonjour ! Je suis l'assistant Nebula. Posez votre question sur la plateforme Nebula.",
    helpTitle: "Besoin d'aide ?",
    helpP1: "Je suis Nebula. Mon rôle est de vous aider à trouver des ressources sur la plateforme Nebula.",
    helpP2: "Vous pouvez me poser des questions en :",
    helpLangs: "Français, Wolof, Arabe",
    helpVoice: "<strong>Pour la saisie vocale :</strong> Assurez-vous de sélectionner la bonne langue dans le menu déroulant à côté du bouton micro avant de commencer l'enregistrement.",
    genericError: "Désolé, une erreur est survenue. Veuillez réessayer.",
    networkError: "Il semble y avoir un problème de connexion. Veuillez vérifier votre accès à internet et réessayer.",
    apiKeyError: "Il y a un problème avec la configuration de l'application. Veuillez contacter le support.",
    rateLimitError: "L'assistante reçoit trop de demandes en ce moment. Veuillez patienter un instant avant de réessayer.",
    modelError: "Le modèle d'IA n'a pas pu traiter cette demande. Veuillez essayer de reformuler votre question ou réessayer plus tard.",
    blockedContentError: "La réponse a été bloquée car elle pourrait enfreindre les règles de sécurité. Veuillez modifier votre question.",
    imageLoadError: "Impossible de charger l'image sélectionnée. Veuillez essayer un autre fichier.",
    micPermissionError: "L'accès au microphone a été refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.",
    speechError: "Erreur de reconnaissance vocale. Veuillez réessayer.",
    sources: "Source(s) :",
    theme: "Thème",
    lightTheme: "Clair",
    darkTheme: "Sombre",
    textSize: "Taille du texte",
    smallSize: "P",
    normalSize: "M",
    largeSize: "G",
    playbackSpeed: "Vitesse de lecture",
    favorites: "Mes Favoris",
    noFavorites: "Aucun favori pour le moment. Cliquez sur l'icône 🔖 sur un message pour l'enregistrer.",
    removeFavorite: "Supprimer le favori",
    shareConversation: "Partager la conversation",
    copyTranscription: "Copier la transcription",
    exportPdf: "Télécharger en PDF",
    transcriptionCopied: "Transcription copiée !",
    userProfile: "Mon Profil",
    userRole: "Je suis un(e)...",
    userLevel: "Niveau/Classe",
    roleTeacher: "Enseignant",
    roleStudent: "Élève",
    roleParent: "Parent",
    summarize: "Résumer",
    createQuiz: "Créer un Quiz",
    summarizing: "Résumé en cours...",
    quizCreating: "Création du quiz...",
    quizCorrect: "Correct !",
    quizIncorrect: "Incorrect.",
    addFavoriteTooltip: "Ajouter aux favoris",
    removeFavoriteTooltip: "Retirer des favoris",
    summarizeTooltip: "Résumer ce contenu",
    createQuizTooltip: "Créer un quiz sur ce contenu",
    previewSoundTooltip: "Aperçu du thème sonore",
    clearHistoryTooltip: "Supprimer définitivement tous les messages",
    copyTranscriptionTooltip: "Copier la conversation en format texte",
    exportPdfTooltip: "Télécharger la conversation en format PDF",
    closeShareModalTooltip: "Fermer la fenêtre",
    userSender: "Utilisateur",
    assistantSender: "Nebula",
    playAudioTooltip: "Lire le message",
    pauseAudioTooltip: "Arrêter la lecture",
    advancedSearch: "Recherche Avancée",
    searchSubject: "Sujet / Mot-clé",
    resourceType: "Type de ressource",
    resourceVideo: "Vidéo",
    resourceDocument: "Document",
    resourceArticle: "Article",
    searchAction: "Rechercher",
    searchResults: "Résultats de la Recherche",
    noResultsFound: "Aucun résultat trouvé pour vos critères.",
    appearanceSettings: "Apparence",
    soundSettings: "Audio & Sons",
    dataManagement: "Gestion des Données",
    uploadImageTooltip: "Joindre une image",
    assistantVoice: "Voix de l'assistante",
    voice: "Voix",
    pitch: "Hauteur",
    previewVoice: "Écouter un aperçu",
    previewVoiceText: "Bonjour, je suis Nebula. C'est un plaisir de vous aider.",
    noVoiceAvailable: "Aucune voix disponible",
  },
  wo: {
    appTitle: "Ndimalu Nebula",
    appSubtitle: "Sa ndimal ngir jot ci ay ressources ci Nebula",
    settingsTitle: "Paramètres",
    uiLanguage: "Làkku Interface",
    enableSounds: "Activer son yi",
    soundTheme: "Teeamu son",
    defaultTheme: "Default",
    softTheme: "Doux",
    digitalTheme: "Numérique",
    history: "Historique",
    clearHistory: "Effacer historique",
    openSettings: "Ubbi paramètres yi",
    closeSettings: "Tëj paramètres yi",
    help: "Ndimal",
    minimize: "Wàññi palanteer bi",
    restore: "Artuwaat palanteer bi",
    close: "Tëj palanteer bi",
    openChat: "Ubbi ndimal bi",
    recordMessage: "Enregistrer baat",
    stopRecording: "Taxawal enregistrement",
    sendMessage: "Yónne baat",
    chatPlaceholder: "Laajal sa laaj ci français, wolof, arabe...",
    recordingPlaceholder: "Enregistrement...",
    assistantThinking: "Nebula mi ngi xalaat...",
    analyzingRequest: "Mingi saytu laaj bi...",
    consultingResources: "Mingi doxantu ci kàggu yi...",
    formulatingResponse: "Mingi taxawal tontu bi...",
    welcomeMessage: "Salaam aleekum ! Man la Nebula, sa ndimalu Nebula. Laajal sa laaj.",
    helpTitle: "Soo soxla ndimbal?",
    helpP1: "Man Nebula laa. Sama liggéey mooy dimbali leen ngeen giss ay ressources ci Nebula.",
    helpP2: "Mën nga maa laaj ay laaj ci:",
    helpLangs: "Français, Wolof, Arabe",
    helpVoice: "<strong>Ngir enregistrer baat:</strong> Verifieral bu baax ne tànn nga làkk bi gën ci menu bi ci wetu micro bi laata ngay tambali.",
    genericError: "Jéggalu, am na njuumte. Ngir nga jéemaat.",
    networkError: "Problem am na ci connexion bi. Seetal sa internet te jéemaat.",
    apiKeyError: "Problem am na ci configuration application bi. Jookool ak support bi.",
    rateLimitError: "Assistant bi dafa am laaj yu bari. Xaaral tuuti te jéemaat.",
    modelError: "Modèle IA bi mënu la traiter laaj bi. Jéemaatal wala nga laajee beneen anam.",
    blockedContentError: "Tontu bi dañu ko bloqué ndax mën na jalgati règle yi. Soppil sa laaj.",
    imageLoadError: "Mënuñu charger nataal bi. Jéemaatal beneen.",
    micPermissionError: "Daño bañ accès ci micro bi. Ngir nga nangul ko ci paramètres navigateur bi.",
    speechError: "Njuumte ci xammu baat. Jéemaatal.",
    sources: "Source(s):",
    theme: "Thème",
    lightTheme: "Leer",
    darkTheme: "Lëndëm",
    textSize: "Réyaayu Mbind",
    smallSize: "N",
    normalSize: "Y",
    largeSize: "M",
    playbackSpeed: "Gawantu wu wax",
    favorites: "Samay Favoris",
    noFavorites: "Amuloo ab favori. Klikal ci 🔖 ci bépp message ngir denc ko.",
    removeFavorite: "Dindi favori bi",
    shareConversation: "Partager waxtaan wi",
    copyTranscription: "Copier mbind mi",
    exportPdf: "Yebal ci PDF",
    transcriptionCopied: "Mbind mi copié nañu ko!",
    userProfile: "Sama Profiil",
    userRole: "Man...",
    userLevel: "Niveau/Classe",
    roleTeacher: "Jàngalekat",
    roleStudent: "Ndongo",
    roleParent: "Way-jur",
    summarize: "Tekki",
    createQuiz: "Defar ab Quiz",
    summarizing: "Dafa nekk ci tekki...",
    quizCreating: "Dafa nekk ci defar quiz...",
    quizCorrect: "Deug na!",
    quizIncorrect: "Deugul.",
    addFavoriteTooltip: "Yok ci favori",
    removeFavoriteTooltip: "Dindi ci favori",
    summarizeTooltip: "Tekkil li ci biir",
    createQuizTooltip: "Defaral quiz ci li",
    previewSoundTooltip: "Ndéglul teeamu son bi",
    clearHistoryTooltip: "Dindi bépp message bu fi nekk",
    copyTranscriptionTooltip: "Copier waxtaan wi ci text",
    exportPdfTooltip: "Yebal waxtaan wi ci PDF",
    closeShareModalTooltip: "Tëjal palanteer bi",
    userSender: "Jëfandikukat",
    assistantSender: "Nebula",
    playAudioTooltip: "Jàngal message bi",
    pauseAudioTooltip: "Taxawal",
    advancedSearch: "Seet bu Xóot",
    searchSubject: "Sujet / Baatu-clé",
    resourceType: "Xeetu Ressource",
    resourceVideo: "Vidéo",
    resourceDocument: "Document",
    resourceArticle: "Article",
    searchAction: "Seetal",
    searchResults: "Résultat yu Seet",
    noResultsFound: "Gisuñu dara ci sa seet.",
    appearanceSettings: "Noo mu Mele",
    soundSettings: "Son yi",
    dataManagement: "Saytu Données yi",
    uploadImageTooltip: "Yónne nataal",
    assistantVoice: "Baatu ndimal bi",
    voice: "Baat",
    pitch: "Tollu",
    previewVoice: "Deglu misaal",
    previewVoiceText: "Salaam aleekum, man Nebula laa. Bég naa lool ci dimbali leen.",
    noVoiceAvailable: "Amul benn baat",
  },
  ar: {
    appTitle: "مساعد Nebula",
    appSubtitle: "مساعدتك لمنصة Nebula",
    settingsTitle: "الإعدادات",
    uiLanguage: "لغة الواجهة",
    enableSounds: "تمكين الأصوات",
    soundTheme: "سمة الصوت",
    defaultTheme: "افتراضي",
    softTheme: "ناعم",
    digitalTheme: "رقمي",
    history: "السجل",
    clearHistory: "مسح السجل",
    openSettings: "فتح الإعدادات",
    closeSettings: "إغلاق الإعدادات",
    help: "مساعدة",
    minimize: "تصغير النافذة",
    restore: "استعادة النافذة",
    close: "إغلاق النافذة",
    openChat: "فتح المساعد",
    recordMessage: "تسجيل رسالة صوتية",
    stopRecording: "إيقاف التسجيل",
    sendMessage: "إرسال الرسالة",
    chatPlaceholder: "ااطرح سؤالاً باللغة الفرنسية والعربية والولوفية",
    recordingPlaceholder: "جاري التسجيل...",
    assistantThinking: "Nebula يفكر...",
    analyzingRequest: "جاري تحليل طلبك...",
    consultingResources: "جاري البحث في الموارد...",
    formulatingResponse: "جاري صياغة الرد...",
    welcomeMessage: "أهلاً بك! أنا مساعد Nebula. اطرح سؤالك حول منصة Nebula.",
    helpTitle: "هل تحتاج إلى مساعدة؟",
    helpP1: "أنا Nebula. دوري هو مساعدتك في العثور على الموارد على منصة Nebula.",
    helpP2: "يمكنك أن تسألني أسئلة بـ:",
    helpLangs: "الفرنسية، الولوف، البولار، السيرير، الديولا، الماندينكا",
    helpVoice: "<strong>للإدخال الصوتي:</strong> تأكد من تحديد اللغة الصحيحة من القائمة المنسدلة بجوار زر الميكروفون قبل بدء التسجيل.",
    genericError: "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    networkError: "يبدو أن هناك مشكلة في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
    apiKeyError: "هناك مشكلة في تكوين التطبيق. يرجى الاتصال بالدعم.",
    rateLimitError: "يتلقى المساعد عددًا كبيرًا جدًا من الطلبات في الوقت الحالي. يرجى الانتظار لحظة قبل المحاولة مرة أخرى.",
    modelError: "لم يتمكن نموذج الذكاء الاصطناعي من معالجة هذا الطلب. يرجى محاولة إعادة صياغة سؤالك أو المحاولة مرة أخرى لاحقًا.",
    blockedContentError: "تم حظر الرد لأنه قد ينتهك سياسات السلامة. يرجى تعديل سؤالك.",
    imageLoadError: "تعذر تحميل الصورة المحددة. يرجى تجربة ملف آخر.",
    micPermissionError: "تم رفض الوصول إلى الميكروفون. يرجى السماح به في إعدادات متصفحك.",
    speechError: "خطأ في التعرف على الكلام. يرجى المحاولة مرة أخرى.",
    sources: "المصدر (المصادر):",
    theme: "السمة",
    lightTheme: "فاتح",
    darkTheme: "داكن",
    textSize: "حجم النص",
    smallSize: "ص",
    normalSize: "م",
    largeSize: "ك",
    playbackSpeed: "سرعة القراءة",
    favorites: "مفضلاتي",
    noFavorites: "لا توجد مفضلات بعد. انقر على أيقونة 🔖 على رسالة لحفظها.",
    removeFavorite: "إزالة من المفضلة",
    shareConversation: "مشاركة المحادثة",
    copyTranscription: "نسخ النص",
    exportPdf: "تنزيل بصيغة PDF",
    transcriptionCopied: "تم نسخ النص!",
    userProfile: "ملفي الشخصي",
    userRole: "أنا...",
    userLevel: "المستوى/الصف",
    roleTeacher: "معلم",
    roleStudent: "طالب",
    roleParent: "ولي أمر",
    summarize: "تلخيص",
    createQuiz: "إنشاء اختبار",
    summarizing: "جاري التلخيص...",
    quizCreating: "جاري إنشاء الاختبار...",
    quizCorrect: "صحيح!",
    quizIncorrect: "غير صحيح.",
    addFavoriteTooltip: "إضافة إلى المفضلة",
    removeFavoriteTooltip: "إزالة من المفضلة",
    summarizeTooltip: "تلخيص هذا المحتوى",
    createQuizTooltip: "إنشاء اختبار على هذا المحتوى",
    previewSoundTooltip: "معاينة السمة الصوتية",
    clearHistoryTooltip: "حذف جميع الرسائل بشكل دائم",
    copyTranscriptionTooltip: "نسخ المحادثة كنص",
    exportPdfTooltip: "تنزيل المحادثة بصيغة PDF",
    closeShareModalTooltip: "إغلاق النافذة",
    userSender: "المستخدم",
    assistantSender: "Nebula",
    playAudioTooltip: "تشغيل الرسالة",
    pauseAudioTooltip: "إيقاف التشغيل",
    advancedSearch: "بحث متقدم",
    searchSubject: "الموضوع / الكلمة الرئيسية",
    resourceType: "نوع المورد",
    resourceVideo: "فيديو",
    resourceDocument: "مستند",
    resourceArticle: "مقالة",
    searchAction: "بحث",
    searchResults: "نتائج البحث",
    noResultsFound: "لم يتم العثور على نتائج لمعاييرك.",
    appearanceSettings: "المظهر",
    soundSettings: "الصوتيات",
    dataManagement: "إدارة البيانات",
    uploadImageTooltip: "إرفاق صورة",
    assistantVoice: "صوت المساعدة",
    voice: "الصوت",
    pitch: "حدة الصوت",
    previewVoice: "استمع إلى معاينة",
    previewVoiceText: "أهلاً بك، أنا Nebula. يسعدني أن أساعدك.",
    noVoiceAvailable: "لا توجد أصوات متاحة",
  },
};
// -------------------------------------


// Data Constants
const schoolLevels = [
    { value: "all", key: "Tous" },
    { value: "prescolaire", key: "Préscolaire" },
    { value: "elementaire-ci", key: "Élémentaire - CI" },
    { value: "elementaire-cp", key: "Élémentaire - CP" },
    { value: "elementaire-ce1", key: "Élémentaire - CE1" },
    { value: "elementaire-ce2", key: "Élémentaire - CE2" },
    { value: "elementaire-cm1", key: "Élémentaire - CM1" },
    { value: "elementaire-cm2", key: "Élémentaire - CM2" },
    { value: "moyen-6e", key: "Moyen - 6ème" },
    { value: "moyen-5e", key: "Moyen - 5ème" },
    { value: "moyen-4e", key: "Moyen - 4ème" },
    { value: "moyen-3e", key: "Moyen - 3ème" },
    { value: "secondaire-2nde", key: "Secondaire - Seconde" },
    { value: "secondaire-1ere", key: "Secondaire - Première" },
    { value: "secondaire-tle", key: "Secondaire - Terminale" }
];

// Sound Profiles Definition
const soundProfiles: Record<SoundTheme, Record<SoundType, any>> = {
  default: {
    send: { type: 'triangle', freq1: 300, freq2: 150, gain: 0.2, dur: 0.1 },
    receive: { type: 'sine', freq1: 600, gain: 0.15, dur: 0.15 },
    startRec: { type: 'sine', freq1: 220, gain: 0.3, dur: 0.1 },
    stopRec: { type: 'sine', freq1: 440, gain: 0.3, dur: 0.1 },
  },
  soft: {
    send: { type: 'sine', freq1: 440, freq2: 330, gain: 0.1, dur: 0.15 },
    receive: { type: 'sine', freq1: 880, freq2: 660, gain: 0.08, dur: 0.2 },
    startRec: { type: 'sine', freq1: 300, gain: 0.15, dur: 0.1 },
    stopRec: { type: 'sine', freq1: 500, gain: 0.15, dur: 0.1 },
  },
  digital: {
    send: { type: 'square', freq1: 1000, freq2: 500, gain: 0.05, dur: 0.1 },
    receive: { type: 'square', freq1: 1500, gain: 0.05, dur: 0.1 },
    startRec: { type: 'sawtooth', freq1: 250, gain: 0.1, dur: 0.05 },
    stopRec: { type: 'sawtooth', freq1: 500, gain: 0.1, dur: 0.05 },
  },
};


// Speech Recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
let isRecording = false;

// Ensure API key is available
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  chatHistory.innerHTML = '<div class="message ai">Erreur: La variable d\'environnement API_KEY n\'est pas configurée.</div>';
  throw new Error('API key not found');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chat: Chat;


// --- Character Data ---
const character = {
    svg: `<svg viewBox="0 0 100 125" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="khadija-skin-new" cx="50%" cy="45%" r="60%" fx="55%" fy="40%">
        <stop offset="0%" stop-color="#A67B5B"></stop>
        <stop offset="100%" stop-color="#8C6442"></stop>
      </radialGradient>
      <linearGradient id="khadija-hair-new" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A342E"></stop>
        <stop offset="100%" stop-color="#2D1E1A"></stop>
      </linearGradient>
      <radialGradient id="khadija-hair-highlight-new" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#C2A58C" stop-opacity="0.3"></stop>
        <stop offset="100%" stop-color="#C2A58C" stop-opacity="0"></stop>
      </radialGradient>
      <radialGradient id="khadija-eyes-new" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#694028"></stop>
        <stop offset="100%" stop-color="#402616"></stop>
      </radialGradient>
      <linearGradient id="khadija-hoodie" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FF9800"></stop>
        <stop offset="100%" stop-color="#FB8C00"></stop>
      </linearGradient>
       <linearGradient id="khadija-book" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#5D4037"></stop>
        <stop offset="100%" stop-color="#4E342E"></stop>
      </linearGradient>
       <linearGradient id="khadija-glasses" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#555555"></stop>
        <stop offset="100%" stop-color="#333333"></stop>
      </linearGradient>
      <filter id="drop-shadow-khadija" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"></feGaussianBlur>
        <feOffset dx="1" dy="4" result="offsetblur"></feOffset>
        <feFlood flood-color="rgba(0,0,0,0.2)"></feFlood>
        <feComposite in2="offsetblur" operator="in"></feComposite>
        <feMerge>
          <feMergeNode></feMergeNode>
          <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
    <g class="avatar-body" style="filter: url(#drop-shadow-khadija);">
      <!-- Body -->
      <path d="M 50,60 C 30,62 25,80 28,125 L 72,125 C 75,80 70,62 50,60 Z" fill="url(#khadija-hoodie)"></path>
      <!-- Hoodie collar -->
      <path d="M 40,60 C 42,68 48,72 50,72 C 52,72 58,68 60,60 L 55,63 L 50,65 L 45,63 Z" fill="#F57C00"></path>
      <!-- Hoodie strings -->
      <path d="M45,70 C43,80 44,90 45,95" fill="none" stroke="#FB8C00" stroke-width="1.5" stroke-linecap="round"></path>
      <path d="M55,70 C57,80 56,90 55,95" fill="none" stroke="#FB8C00" stroke-width="1.5" stroke-linecap="round"></path>

      <!-- Book and Hands -->
      <g>
        <!-- Book -->
        <path d="M28,85 L72,85 L75,120 L25,120 Z" fill="url(#khadija-book)"></path>
        <path d="M50,86 L50,119" stroke="#3E2723" stroke-width="1"></path>
        <path d="M30,88 L48,88 L48,117 L30,117 Z" fill="#FBFBFB"></path>
        <path d="M52,88 L70,88 L70,117 L52,117 Z" fill="#FBFBFB"></path>
        
        <!-- Hands -->
        <path d="M20,95 C25,90 35,92 32,105 C35,100 28,95 20,95Z" fill="url(#khadija-skin-new)"></path>
        <path d="M80,95 C75,90 65,92 68,105 C65,100 72,95 80,95Z" fill="url(#khadija-skin-new)"></path>
      </g>
      
      <!-- Head -->
      <g class="avatar-head">
        <!-- Neck -->
        <rect x="46" y="52" width="8" height="10" fill="url(#khadija-skin-new)"></rect>
        <!-- Face -->
        <path d="M33,45 C33,25 67,25 67,45 C67,65 55,70 50,70 C45,70 33,65 33,45 Z" fill="url(#khadija-skin-new)"></path>
        
        <!-- Hair -->
        <g>
          <path d="M25,50 C 5,20 50,-10 95,20 C80,55 20,55 25,50 Z" fill="url(#khadija-hair-new)"></path>
          <circle cx="30" cy="20" r="18" fill="url(#khadija-hair-new)"></circle>
          <circle cx="70" cy="20" r="18" fill="url(#khadija-hair-new)"></circle>
          <circle cx="50" cy="15" r="20" fill="url(#khadija-hair-new)"></circle>
          <!-- Hair Highlights -->
          <circle cx="30" cy="20" r="15" fill="url(#khadija-hair-highlight-new)"></circle>
          <circle cx="70" cy="20" r="15" fill="url(#khadija-hair-highlight-new)"></circle>
          <!-- Hairband -->
          <path d="M38,28 Q50,23 62,28" stroke="#FF9800" stroke-width="4" fill="none" stroke-linecap="round"></path>
        </g>
        
        <!-- Eyes -->
        <g>
          <!-- Sclera -->
          <ellipse cx="41.5" cy="47" rx="5" ry="5.5" fill="white"></ellipse>
          <ellipse cx="58.5" cy="47" rx="5" ry="5.5" fill="white"></ellipse>
          <!-- Iris -->
          <circle cx="41.5" cy="48" r="3.5" fill="url(#khadija-eyes-new)"></circle>
          <circle cx="58.5" cy="48" r="3.5" fill="url(#khadija-eyes-new)"></circle>
          <!-- Highlight -->
          <circle cx="42.5" cy="46.5" r="1" fill="rgba(255,255,255,0.9)"></circle>
          <circle cx="59.5" cy="46.5" r="1" fill="rgba(255,255,255,0.9)"></circle>
        </g>
        
        <!-- Glasses -->
        <g fill="none" stroke="url(#khadija-glasses)" stroke-width="2.5" stroke-linecap="round">
          <circle cx="41.5" cy="47" r="7"></circle>
          <circle cx="58.5" cy="47" r="7"></circle>
          <path d="M48.5,47 Q50,45 51.5,47"></path>
        </g>
        
        <!-- Eyebrows -->
        <g fill="none" stroke="#2D1E1A" stroke-width="1.5" stroke-linecap="round">
          <path d="M36,38 C39,36 45,36 46,38"></path>
          <path d="M54,38 C55,36 61,36 64,38"></path>
        </g>
        
        <!-- Mouth -->
        <path d="M44,59 Q50,64 56,59" stroke="#6D4C41" stroke-width="1.5" fill="none" stroke-linecap="round"></path>
        
        <!-- Earrings -->
        <circle cx="32" cy="52" r="1.5" fill="#FFD700"></circle>
        <circle cx="68" cy="52" r="1.5" fill="#FFD700"></circle>
      </g>
    </g>
  </svg>`,
    getInstruction: (profileContext, name) => `Tu es "${name}", l'assistant IA bienveillant, pédagogue et passionné de la plateforme Nebula. Ta personnalité est chaleureuse, encourageante et très patiente. Tu es là pour guider tous les utilisateurs, qu'ils soient enseignants, élèves ou parents.
${profileContext}
**Ta Mission Principale :** Aider les utilisateurs à trouver, comprendre, et structurer les ressources pédagogiques de la plateforme Nebula. Tu peux également **analyser les images** que les utilisateurs t'envoient pour identifier du contenu pédagogique, expliquer des concepts visuels, ou répondre à des questions sur ce qu'elles représentent.
**IMPORTANT : La Langue de l'Utilisateur est Prioritaire** Tu dois impérativement détecter la langue de l'utilisateur (français, wolof, arabe) et lui répondre systématiquement dans cette même langue.
**Ton et Style :**
*   **Chaleureux et Conversationnel :** Adopte un ton naturel et amical. Commence tes réponses par des petites phrases pour accueillir l'utilisateur (par exemple : "Absolument !", "Je vois ce que vous voulez dire.", "C'est une excellente question !").
*   **Empathique et Rassurant :** Si un utilisateur exprime une difficulté, reconnais-la (ex: "Je comprends que cela puisse être compliqué..."). Sois toujours positive et termine tes interactions sur une note encourageante ("N'hésitez pas si vous avez d'autres questions !").
**Tes Principes de Guidage :**
1.  **Source Exclusive :** Ta source d'information principale et **exclusive** est \`https://layendo1.github.io/nebula-plateforme/\`. Toutes les ressources que tu proposes (liens web, documents PDF, etc.) **doivent impérativement** provenir de ce site. N'utilise **jamais** de liens externes. **Règle non négociable : Toute URL fournie qui ne commence pas par \`https://layendo1.github.io/nebula-plateforme/\` est une erreur. Tu dois vérifier chaque lien avant de l'inclure.**
2.  **Priorité aux Liens Directs :** Ta tâche la plus importante est de fournir des liens directs vers les ressources finales. Quand un utilisateur demande un "exercice", une "leçon", ou une "activité", ne te contente pas de donner un lien vers une page de catégorie. Cherche le lien le plus profond et spécifique possible. **Par exemple, un lien idéal ressemble à \`https://layendo1.github.io/nebula-plateforme/courses/math/lecon1.pdf\`, plutôt qu'un lien général comme \`.../courses/math/\`.**
3.  **Analyse d'Image Pertinente :** Lorsque tu reçois une image, intègre son analyse dans ta réponse. Si un utilisateur te demande "Qu'est-ce que c'est ?", décris l'image. S'il demande "Trouve-moi des exercices sur ce sujet" en envoyant une photo d'une cellule végétale, identifie la cellule et recherche des ressources sur la biologie cellulaire sur la plateforme Nebula.
4.  **Expertise et Pédagogie :** Structure tes réponses de manière pédagogique.
5.  **Accès direct :** Pour chaque ressource du site, fournis toujours le lien direct. **CRUCIAL :** Tu dois impérativement formater chaque URL comme un lien Markdown cliquable, par exemple : \`[Titre de l'exercice de maths](https://layendo1.github.io/nebula-plateforme/courses/A1.xhtml)\`. Ne jamais afficher une URL sous forme de texte brut.
6.  **Transparence totale :** Si une ressource n'existe pas, dis-le gentiment et propose des alternatives pertinentes sur le site. Si tu ne peux pas comprendre une image, admets-le poliment.
7.  **Adaptabilité :** Utilise un langage clair et adapté à ton interlocuteur (simple pour un élève, plus technique pour un enseignant).`
};


/**
 * Generates the system instruction based on current user settings.
 */
function getSystemInstruction(): string {
  const { userRole, userLevel } = settings;
  const profileContext = `L'utilisateur est un(e) '${userRole}' s'intéressant au niveau '${userLevel}'. Adapte tes réponses à ce profil.`;
  const characterName = "Nebula";
  
  return character.getInstruction(profileContext, characterName);
}

/**
 * Initializes or re-initializes the chat session with the current system instruction.
 */
function initializeChat(): void {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(),
      tools: [{ googleSearch: {} }],
    },
  });
}

/**
 * Populates the level select dropdowns from the constant.
 */
function populateLevelSelects(): void {
    const optionsHtml = schoolLevels.map(level => `<option value="${level.value}">${level.key}</option>`).join('');
    userLevelSelect.innerHTML = optionsHtml;
    searchLevelSelect.innerHTML = optionsHtml;
}


/**
 * Updates all UI text elements to the selected language.
 * @param lang The language code (e.g., 'fr', 'en').
 */
function updateUIText(lang: string): void {
  const t = translations[lang] || translations.fr;

  // Set document direction for RTL support
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  document.documentElement.setAttribute('lang', lang);
  
  // Update static text using data attributes
  document.querySelectorAll('[data-translate-key]').forEach(el => {
    const key = el.getAttribute('data-translate-key');
    if (key && t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Update tooltips using data attributes
  document.querySelectorAll('[data-translate-key-tooltip]').forEach(el => {
    const key = el.getAttribute('data-translate-key-tooltip');
    if (key && t[key]) {
      el.setAttribute('aria-label', t[key]);
      el.setAttribute('title', t[key]);
    }
  });


  // Update dynamic elements (placeholders, ARIA labels, titles)
  advancedSearchButton.setAttribute('aria-label', t.advancedSearch);
  advancedSearchButton.setAttribute('title', t.advancedSearch);
  shareButton.setAttribute('aria-label', t.shareConversation);
  shareButton.setAttribute('title', t.shareConversation);
  settingsButton.setAttribute('aria-label', t.openSettings);
  settingsButton.setAttribute('title', t.openSettings);
  closeSettingsButton.setAttribute('aria-label', t.closeSettings);
  closeSettingsButton.setAttribute('title', t.closeSettings);
  helpButton.setAttribute('aria-label', t.help);
  helpButton.setAttribute('title', t.help);
  const isCollapsed = chatContainer.classList.contains('collapsed');
  const minimizeTooltip = isCollapsed ? t.restore : t.minimize;
  minimizeButton.setAttribute('aria-label', minimizeTooltip);
  minimizeButton.setAttribute('title', minimizeTooltip);
  closeButton.setAttribute('aria-label', t.close);
  closeButton.setAttribute('title', t.close);
  const micTooltip = isRecording ? t.stopRecording : t.recordMessage;
  micButton.setAttribute('aria-label', micTooltip);
  micButton.setAttribute('title', micTooltip);
  imageUploadButton.setAttribute('aria-label', t.uploadImageTooltip);
  imageUploadButton.setAttribute('title', t.uploadImageTooltip);
  submitButton.setAttribute('aria-label', t.sendMessage);
  submitButton.setAttribute('title', t.sendMessage);
  
  chatInput.placeholder = isRecording ? t.recordingPlaceholder : t.chatPlaceholder;
  
  // Update select value
  uiLangSelect.value = lang;
  renderFavorites(); // Re-render in case "no favorites" text needs translation
}

/**
 * Ensures the Web Audio API context is initialized.
 * @returns The shared AudioContext or null if not supported.
 */
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.");
      return null;
    }
  }
  return audioContext;
}

/**
 * Plays a sound effect for a given action based on current settings.
 * @param type The type of sound to play.
 * @param themeOverride Optional theme to use for previews.
 */
function playSound(type: SoundType, themeOverride?: SoundTheme): void {
  if (!settings.soundEnabled && !themeOverride) return;
  
  const audioCtx = getAudioContext();
  if (!audioCtx) return;

  const theme = soundProfiles[themeOverride || settings.soundTheme];
  const sound = theme[type];
  if (!sound) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

  oscillator.type = sound.type;
  oscillator.frequency.setValueAtTime(sound.freq1, audioCtx.currentTime);
  if (sound.freq2) {
    oscillator.frequency.exponentialRampToValueAtTime(sound.freq2, audioCtx.currentTime + sound.dur);
  }
  gainNode.gain.linearRampToValueAtTime(sound.gain, audioCtx.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + sound.dur);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + sound.dur + 0.05);
}


/**
 * Stops any playing ambient background sounds with a fade-out.
 */
function stopAmbientSound(): void {
  // This function is now empty to disable ambient sounds.
}

/**
 * Starts playing a subtle, thematic ambient sound based on the current UI theme.
 */
function startAmbientSound(): void {
  // This function is now empty to disable ambient sounds.
}

/**
 * Adds interactive elements (bookmark, summarize, quiz) to an AI message.
 * @param messageElement The AI message element to process.
 */
function addInteractiveElements(messageElement: HTMLElement): void {
    const t = translations[settings.uiLang];
    const interactiveContainer = document.createElement('div');
    interactiveContainer.className = 'interactive-elements';
    
    // Bookmark logic
    const links = Array.from(messageElement.querySelectorAll('a[href*="layendo1.github.io/nebula-plateforme/"]'));
    if (links.length > 0) {
        const url = (links[0] as HTMLAnchorElement).href;
        const title = links[0].textContent || url;
        const isBookmarked = favorites.some(fav => fav.url === url);

        const bookmarkButton = document.createElement('button');
        bookmarkButton.className = 'bookmark-button';
        if(isBookmarked) bookmarkButton.classList.add('bookmarked');
        const bookmarkTooltip = isBookmarked ? t.removeFavoriteTooltip : t.addFavoriteTooltip;
        bookmarkButton.setAttribute('aria-label', bookmarkTooltip);
        bookmarkButton.setAttribute('title', bookmarkTooltip);
        bookmarkButton.innerHTML = '🔖';
        
        bookmarkButton.addEventListener('click', () => {
            const favoriteIndex = favorites.findIndex(fav => fav.url === url);
            if (favoriteIndex > -1) {
                favorites.splice(favoriteIndex, 1);
                bookmarkButton.classList.remove('bookmarked');
            } else {
                favorites.push({ url, title });
                bookmarkButton.classList.add('bookmarked');
            }
            const newBookmarkTooltip = bookmarkButton.classList.contains('bookmarked') ? t.removeFavoriteTooltip : t.addFavoriteTooltip;
            bookmarkButton.setAttribute('aria-label', newBookmarkTooltip);
            bookmarkButton.setAttribute('title', newBookmarkTooltip);
            saveFavorites();
            renderFavorites();
        });
        interactiveContainer.appendChild(bookmarkButton);
    }
    
    // Text-to-Speech Button
    const audioButton = document.createElement('button');
    audioButton.className = 'audio-button';
    audioButton.setAttribute('aria-label', t.playAudioTooltip);
    audioButton.setAttribute('title', t.playAudioTooltip);
    audioButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5v-9l7 4.5-7 4.5z"></path></svg>`;
    
    audioButton.addEventListener('click', () => handleTextToSpeech(messageElement, audioButton));
    interactiveContainer.appendChild(audioButton);

    if (interactiveContainer.children.length > 0) {
        messageElement.appendChild(interactiveContainer);
    }
    
    // Summarize and Quiz buttons for each link
    links.forEach(link => {
        const url = (link as HTMLAnchorElement).href;
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'resource-actions';

        const summarizeButton = document.createElement('button');
        summarizeButton.innerHTML = `🔍 <span data-translate-key="summarize">${t.summarize}</span>`;
        summarizeButton.setAttribute('aria-label', t.summarizeTooltip);
        summarizeButton.title = t.summarizeTooltip;
        summarizeButton.onclick = () => handleSummarizeClick(url, actionsContainer);

        const quizButton = document.createElement('button');
        quizButton.innerHTML = `🧠 <span data-translate-key="createQuiz">${t.createQuiz}</span>`;
        quizButton.setAttribute('aria-label', t.createQuizTooltip);
        quizButton.title = t.createQuizTooltip;
        quizButton.onclick = () => handleQuizClick(url, actionsContainer);
        
        actionsContainer.append(summarizeButton, quizButton);
        link.parentElement?.insertAdjacentElement('afterend', actionsContainer);
    });
}

/**
 * Resets the global audio state and UI.
 */
function resetAudioState() {
    stopAmbientSound();
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
    }
    if (currentAudioSource) {
      currentAudioSource.onended = null; // Prevent the onended callback from firing on manual stop
      currentAudioSource.stop();
    }
    if (currentlyPlayingButton) {
        const t = translations[settings.uiLang];
        currentlyPlayingButton.classList.remove('speaking');
        currentlyPlayingButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5v-9l7 4.5-7 4.5z"></path></svg>`;
        currentlyPlayingButton.setAttribute('aria-label', t.playAudioTooltip);
        const associatedMessage = currentlyPlayingButton.closest('.message');
        if (associatedMessage) {
            associatedMessage.classList.remove('speaking-aloud');
        }
    }
    currentAudioSource = null;
    currentlyPlayingButton = null;
}

/**
 * Converts a base64 string to an ArrayBuffer.
 * @param base64 The base64 encoded string.
 * @returns An ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Handles Text-to-Speech functionality for a message using the best available service.
 * @param messageElement The element containing the text to speak.
 * @param button The audio button that was clicked.
 */
async function handleTextToSpeech(messageElement: HTMLElement, button: HTMLButtonElement) {
  const t = translations[settings.uiLang];
  const wasPlayingThis = currentlyPlayingButton === button;

  resetAudioState();

  if (wasPlayingThis) {
    return;
  }
  
  const cleanText = messageElement.cloneNode(true) as HTMLElement;
  cleanText.querySelectorAll('.interactive-elements, .resource-actions, .action-result-container, .sources').forEach(el => el.remove());
  const textToSpeak = cleanText.textContent?.trim() || '';
  if (!textToSpeak) return;

  currentlyPlayingButton = button;
  button.classList.add('speaking');
  button.innerHTML = `<div class="loading-spinner"></div>`;
  button.setAttribute('aria-label', t.pauseAudioTooltip);
  messageElement.classList.add('speaking-aloud');

  if (isGoogleTtsAvailable) {
    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: textToSpeak },
          voice: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-E' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: settings.playbackSpeed }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'TTS API request failed');
      }
      const data = await response.json();
      const audioCtx = getAudioContext();
      if (!audioCtx) throw new Error("AudioContext not available");

      const audioBuffer = await audioCtx.decodeAudioData(base64ToArrayBuffer(data.audioContent));
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);

      currentAudioSource = source;
      startAmbientSound();
      
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 16h8V8H8v8z"></path></svg>`;
      source.onended = resetAudioState;

    } catch (error) {
      console.error("Google TTS Error:", error);
      resetAudioState(); 
    }
  } else {
    // Fallback to native browser TTS
    if (typeof speechSynthesis === 'undefined') {
        console.error("Speech Synthesis API is not supported in this browser.");
        resetAudioState();
        return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === settings.voiceName);
    
    utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith(settings.uiLang)) || voices.find(v => v.lang.startsWith('fr')) || null;
    utterance.pitch = settings.pitch;
    utterance.rate = settings.playbackSpeed;
    
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 16h8V8H8v8z"></path></svg>`;
    utterance.onend = resetAudioState;
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        console.error("Native TTS Error:", e.error);
        resetAudioState();
    };
    speechSynthesis.speak(utterance);
  }
}


/**
 * Appends a message to the chat history.
 * @param message The message content (HTML).
 * @param sender The sender ('user' or 'ai').
 * @returns The created message element.
 */
function displayMessage(message: string, sender: 'user' | 'ai'): HTMLElement {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = message;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  if (sender === 'ai' && !messageElement.classList.contains('error')) {
      addInteractiveElements(messageElement);
  }
  return messageElement;
}

/**
 * Toggles the loading state of the UI.
 * @param isLoading True to show loading, false to hide.
 */
function setLoading(isLoading: boolean): void {
  if (isLoading) {
    loadingIndicator.classList.remove('hidden');
    chatInput.disabled = true;
    submitButton.disabled = true;
    micButton.disabled = true;
    imageUploadButton.disabled = true;
    langSelect.disabled = true;
    suggestionChipsContainer.classList.add('hidden');

    // Start dynamic text cycle
    const t = translations[settings.uiLang];
    const messages = [
        t.assistantThinking,
        t.analyzingRequest,
        t.consultingResources,
        t.formulatingResponse,
    ];
    let messageIndex = 0;
    
    // Set initial message
    loadingText.textContent = messages[messageIndex];

    if (loadingInterval) clearInterval(loadingInterval);
    
    loadingInterval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        loadingText.classList.add('fade');
        setTimeout(() => {
            loadingText.textContent = messages[messageIndex];
            loadingText.classList.remove('fade');
        }, 500); // Corresponds to transition duration in CSS
    }, 3000); // Change text every 3 seconds

  } else {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    
    loadingIndicator.classList.add('hidden');
    chatInput.disabled = false;
    submitButton.disabled = false;
    micButton.disabled = false;
    imageUploadButton.disabled = false;
    langSelect.disabled = false;
    chatInput.focus();
    if(chatInput.value.trim() === '') {
      renderSuggestions();
    }
  }
}

/**
 * Saves the current chat history to localStorage.
 */
function saveChatHistory(): void {
  try {
    if (chatHistoryLog.length > MAX_HISTORY_MESSAGES) {
      chatHistoryLog = chatHistoryLog.slice(chatHistoryLog.length - MAX_HISTORY_MESSAGES);
    }
    localStorage.setItem('senProfAssistantHistory', JSON.stringify(chatHistoryLog));
  } catch (error) {
    console.warn('Could not save chat history to localStorage:', error);
  }
}

/**
 * Loads chat history from localStorage and displays it.
 */
function loadChatHistory(): void {
  try {
    const savedHistory = localStorage.getItem('senProfAssistantHistory');
    if (savedHistory) {
      chatHistoryLog = JSON.parse(savedHistory);
      chatHistory.innerHTML = '';
      chatHistoryLog.forEach(msg => {
        // Re-rendering messages will also re-attach interactive elements
        const el = displayMessage(msg.content, msg.sender);
        // Re-apply error class if it exists in the stored HTML
        if (msg.content.includes('class="message ai error"')) {
            el.classList.add('error');
        }
      });
    }
  } catch (error) {
    console.warn('Could not load chat history from localStorage:', error);
    chatHistoryLog = [];
  }
}

// --- Error Handling ---
/**
 * Analyzes an error and returns a corresponding translation key.
 * @param error The error object.
 * @returns A string key for the translations object.
 */
function getErrorMessageKey(error: any): string {
    const errorMessage = (error?.message || error.toString()).toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
        return 'networkError';
    }
    if (errorMessage.includes('api key')) {
        return 'apiKeyError';
    }
    if (errorMessage.includes('[429]')) { // HTTP 429 Too Many Requests
        return 'rateLimitError';
    }
    if (errorMessage.includes('safety')) {
        return 'blockedContentError';
    }
    if (errorMessage.includes('[400]') || errorMessage.includes('[500]') || errorMessage.includes('[503]')) {
        return 'modelError';
    }
    
    return 'genericError';
}

/**
 * Displays a styled error message in the chat.
 * @param error The original error object for console logging.
 * @param messageKey An optional, specific message key to use.
 */
function displayError(error: any, messageKey?: string) {
    const key = messageKey || getErrorMessageKey(error);
    const translatedMessage = translations[settings.uiLang][key] || translations[settings.uiLang].genericError;

    console.error('An error occurred:', error);

    const errorElement = displayMessage(translatedMessage, 'ai');
    errorElement.classList.add('error');
    
    // Create a snapshot of the element's state for the log
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(errorElement.cloneNode(true));
    chatHistoryLog.push({ sender: 'ai', content: tempDiv.innerHTML });
    
    saveChatHistory();
}

/**
 * Handles the chat form submission.
 * @param event The form submission event.
 */
async function handleFormSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const userMessage = chatInput.value.trim();

  if (!userMessage && !attachedImage) {
    return;
  }
  
  resetAudioState();

  // Create user message with image if attached
  let userMessageHTML = userMessage;
  if (attachedImage) {
    userMessageHTML += `<br><img src="${attachedImage.dataUrl}" class="user-image" alt="Image envoyée par l'utilisateur">`;
  }
  
  displayMessage(userMessageHTML, 'user');
  chatHistoryLog.push({ sender: 'user', content: userMessageHTML });
  
  playSound('send');
  chatInput.value = '';
  setLoading(true);

  // Construct a more specific prompt for the model to ensure site-specific search
  const modelQuery = `En te basant exclusivement sur des recherches sur "site:layendo1.github.io/nebula-plateforme/", trouve les liens les plus directs et spécifiques possible (par exemple, vers un exercice .xhtml ou un document .pdf) pour la demande suivante : "${userMessage}"`;

  // Prepare content for API
  const messageParts: (string | { inlineData: { mimeType: string; data: string; } })[] = [];
  if (userMessage) {
    messageParts.push(modelQuery);
  }
  if (attachedImage) {
    messageParts.push({
      inlineData: {
        mimeType: attachedImage.mimeType,
        data: attachedImage.base64,
      }
    });
  }
  removeAttachedImage(); // Clear preview after preparing for sending

  try {
    const stream = await chat.sendMessageStream({ 
        message: messageParts as any 
    });

    const aiMessageElement = displayMessage('', 'ai');
    aiMessageElement.innerHTML = `<span class="typing-cursor"></span>`;
    playSound('receive');
    let fullResponse = '';
    const sources = new Set<string>();

    for await (const chunk of stream) {
      fullResponse += chunk.text;
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        for (const gc of groundingChunks) {
          // Strict filtering to ensure only nebula links are added
          if (gc.web?.uri && gc.web.uri.includes('layendo1.github.io/nebula-plateforme/')) {
            sources.add(gc.web.uri);
          }
        }
      }
      aiMessageElement.innerHTML = (await marked.parse(fullResponse)).trim() + '<span class="typing-cursor"></span>';
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // --- START: ROBUST LINK HANDLING ---

    // Final render pass with full content
    aiMessageElement.innerHTML = await marked.parse(fullResponse);

    // Function to find plain text URLs in text nodes and convert them to <a> tags.
    const linkifyUrlsInElement = (element: HTMLElement) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
      const nodesToProcess: Node[] = [];
      let node;
      // First, collect all text nodes to avoid issues with modifying the DOM while iterating.
      while ((node = walker.nextNode())) {
        // Only process text nodes that are not already inside an <a> or <button> tag.
        if (node.parentElement?.closest('a, button') === null) {
          nodesToProcess.push(node);
        }
      }

      const urlRegex = /(https?:\/\/[^\s`()<>"]+)/g;
      nodesToProcess.forEach(textNode => {
        const text = textNode.textContent;
        if (text && urlRegex.test(text)) {
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;

          // Use replace with a function to build the fragment
          text.replace(urlRegex, (match, offset) => {
            // Add text before the match
            if (offset > lastIndex) {
              fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
            }
            // Create and add the link
            const a = document.createElement('a');
            a.href = match;
            a.textContent = match;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            fragment.appendChild(a);

            lastIndex = offset + match.length;
            return match; // Required by replace
          });

          // Add any remaining text after the last match
          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
          }

          // Replace the original text node with the new fragment
          textNode.parentNode?.replaceChild(fragment, textNode);
        }
      });
    };

    // Apply the linkify function to the AI message content.
    linkifyUrlsInElement(aiMessageElement);
    
    // --- FOOLPROOF LINK FILTER (existing logic) ---
    const allLinks = aiMessageElement.querySelectorAll('a');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('https://layendo1.github.io/nebula-plateforme/') && !href.startsWith('http://layendo1.github.io/nebula-plateforme/')) {
        const textContent = link.textContent || href;
        const textNode = document.createTextNode(textContent);
        link.parentNode?.replaceChild(textNode, link);
      }
    });

    // --- END: ROBUST LINK HANDLING ---


    if (sources.size > 0) {
      const sourcesElement = document.createElement('div');
      sourcesElement.classList.add('sources');
      let sourcesHTML = `<strong>${translations[settings.uiLang].sources || 'Source(s) :'}</strong><ul>`;
      sources.forEach(url => {
        sourcesHTML += `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></li>`;
      });
      sourcesHTML += '</ul>';
      
      sourcesElement.innerHTML = sourcesHTML;
      aiMessageElement.appendChild(sourcesElement);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    addInteractiveElements(aiMessageElement);
    chatHistoryLog.push({ sender: 'ai', content: aiMessageElement.innerHTML });
    saveChatHistory();

  } catch (error) {
    displayError(error);
  } finally {
    setLoading(false);
  }
}

// --- New Feature Handlers ---

async function handleSummarizeClick(url: string, container: HTMLElement) {
    resetAudioState();
    container.innerHTML = `<div class="action-result-container"><div class="loading-spinner"></div> ${translations[settings.uiLang].summarizing}</div>`;
    const prompt = `En tant qu'assistant pour un ${settings.userRole} de niveau ${settings.userLevel}, résume le contenu de cette page en 3 points clés: ${url}. Réponds uniquement avec les points du résumé.`;
    try {
        const stream = await chat.sendMessageStream({ message: prompt });
        let fullResponse = '';
        container.innerHTML = `<div class="action-result-container"></div>`;
        const resultContainer = container.querySelector('.action-result-container') as HTMLElement;

        for await (const chunk of stream) {
            fullResponse += chunk.text;
            resultContainer.innerHTML = await marked.parse(fullResponse);
        }
    } catch (e) {
        console.error("Summarization failed", e);
        const t = translations[settings.uiLang];
        const key = getErrorMessageKey(e);
        container.innerHTML = `<div class="action-result-container error">${t[key]}</div>`;
    }
}

async function handleQuizClick(url: string, container: HTMLElement) {
    resetAudioState();
    container.innerHTML = `<div class="action-result-container"><div class="loading-spinner"></div> ${translations[settings.uiLang].quizCreating}</div>`;
    const prompt = `En te basant sur le contenu de la page ${url}, crée un quiz à choix multiples de 3 questions. Pour chaque question, fournis 3 options de réponse et indique l'index de la bonne réponse (0, 1, ou 2).`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswerIndex: { type: Type.INTEGER }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const quizData = JSON.parse(response.text).quiz;
        renderQuiz(quizData, container);

    } catch(e) {
        console.error("Quiz creation failed", e);
        const t = translations[settings.uiLang];
        const key = getErrorMessageKey(e);
        container.innerHTML = `<div class="action-result-container error">${t[key]}</div>`;
    }
}

function renderQuiz(quizData: any[], container: HTMLElement) {
    container.innerHTML = ''; // Clear loading
    const quizContainer = document.createElement('div');
    quizContainer.className = 'action-result-container';
    
    quizData.forEach((q, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-container';
        questionEl.innerHTML = `<div class="quiz-question">${index + 1}. ${q.question}</div>`;
        
        const optionsEl = document.createElement('div');
        optionsEl.className = 'quiz-options';
        
        q.options.forEach((option: string, optIndex: number) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'quiz-option';
            optionEl.textContent = option;
            optionEl.dataset.index = `${optIndex}`;
            
            optionEl.addEventListener('click', () => {
                if (optionsEl.classList.contains('answered')) return;
                optionsEl.classList.add('answered');
                const selectedIndex = parseInt(optionEl.dataset.index!);
                
                if (selectedIndex === q.correctAnswerIndex) {
                    optionEl.classList.add('correct');
                } else {
                    optionEl.classList.add('incorrect');
                    optionsEl.querySelector(`[data-index='${q.correctAnswerIndex}']`)?.classList.add('correct');
                }
            }, { once: true });
            
            optionsEl.appendChild(optionEl);
        });
        
        questionEl.appendChild(optionsEl);
        quizContainer.appendChild(questionEl);
    });
    container.appendChild(quizContainer);
}


// --- Original Handlers ---

function handleMicClick(): void {
  if (!recognition) return;

  if (isRecording) {
    recognition.stop();
  } else {
    recognition.lang = langSelect.value;
    recognition.start();
  }
}

function handleMinimizeClick(): void {
  chatContainer.classList.toggle('collapsed');
  updateUIText(settings.uiLang);
}

function handleCloseClick(): void {
  resetAudioState();
  chatContainer.classList.add('collapsed');
  updateUIText(settings.uiLang);
}

function handleHeaderClick(event: Event): void {
  // Only expand if the click is on the header itself, not its buttons.
  if ((event.target as HTMLElement).closest('button')) {
    return;
  }
  if (chatContainer.classList.contains('collapsed')) {
    chatContainer.classList.remove('collapsed');
    updateUIText(settings.uiLang);
  }
}

function handleHelpClick(): void {
  const t = translations[settings.uiLang];
  const helpMessage = `
    <strong>${t.helpTitle}</strong>
    <p>${t.helpP1}</p>
    <p>${t.helpP2}</p>
    <ul>
      <li>${t.helpLangs.split(', ').join('</li><li>')}</li>
    </ul>
    <p>${t.helpVoice}</p>
  `;
  displayMessage(helpMessage, 'ai');
  chatHistoryLog.push({ sender: 'ai', content: helpMessage });
  saveChatHistory();
}

function setupSpeechRecognition(): void {
  if (!SpeechRecognition) {
    micButton.classList.add('hidden');
    langSelect.classList.add('hidden');
    console.warn('Speech Recognition API not supported in this browser.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.onstart = () => { isRecording = true; micButton.classList.add('recording'); updateUIText(settings.uiLang); playSound('startRec'); };
  recognition.onend = () => { isRecording = false; micButton.classList.remove('recording'); updateUIText(settings.uiLang); playSound('stopRec'); };
  recognition.onerror = (event: any) => {
    let errorMessageKey = 'speechError';
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      errorMessageKey = 'micPermissionError';
    } else if (event.error === 'network') {
      errorMessageKey = 'networkError';
    }
    displayError(event.error, errorMessageKey);
  };
  recognition.onresult = (event) => {
    let interimTranscript = '', finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      else interimTranscript += event.results[i][0].transcript;
    }
    chatInput.value = finalTranscript || interimTranscript;
    if (finalTranscript) chatForm.requestSubmit();
  };
  micButton.addEventListener('click', handleMicClick);
}

function flashButton(button: HTMLButtonElement): void {
  button.classList.add('shortcut-active');
  setTimeout(() => button.classList.remove('shortcut-active'), 400);
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event) => {
    const isCmdOrCtrl = event.metaKey || event.ctrlKey;
    if (event.key === 'Enter' && isCmdOrCtrl && chatInput.value.trim() && !submitButton.disabled) {
      event.preventDefault(); chatForm.requestSubmit(); flashButton(submitButton);
    }
    if (event.key.toLowerCase() === 's' && isCmdOrCtrl && event.shiftKey && !micButton.disabled) {
      event.preventDefault(); handleMicClick(); flashButton(micButton);
    }
  });
}

function updateAvatar() {
    avatarContainer.innerHTML = character.svg;
}

/**
 * Populates the voice selection dropdown with available system voices.
 */
function populateVoiceList() {
    if (typeof speechSynthesis === 'undefined') {
        voiceSelect.innerHTML = '';
        const option = document.createElement('option');
        option.textContent = translations[settings.uiLang].noVoiceAvailable;
        voiceSelect.appendChild(option);
        return;
    }
    
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';

    if (voices.length === 0) {
        const option = document.createElement('option');
        option.textContent = translations[settings.uiLang].noVoiceAvailable;
        voiceSelect.appendChild(option);
        return;
    }

    const lang = settings.uiLang;
    // Prioritize voices for the current language
    voices.filter(voice => voice.lang.startsWith(lang))
          .forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });

    // Add a separator if there were language-specific voices
    if (voiceSelect.options.length > 0 && voiceSelect.options.length < voices.length) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '──────────';
        voiceSelect.appendChild(separator);
    }

    // Add the rest of the voices
    voices.filter(voice => !voice.lang.startsWith(lang))
          .forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });

    if (settings.voiceName) {
        voiceSelect.value = settings.voiceName;
    }
    if (voiceSelect.selectedIndex === -1) {
        voiceSelect.selectedIndex = 0;
    }
}


/**
 * Plays a preview of the selected voice settings.
 */
async function handleVoicePreview(): Promise<void> {
    const t = translations[settings.uiLang];
    const previewText = t.previewVoiceText;
    const wasPlayingThis = currentlyPlayingButton === voicePreviewButton;

    resetAudioState();
    if (wasPlayingThis) return;

    currentlyPlayingButton = voicePreviewButton;
    const originalText = voicePreviewButton.innerHTML;
    voicePreviewButton.innerHTML = `<div class="loading-spinner" style="width: 1.2em; height: 1.2em; border-width: 2px; display: inline-block; vertical-align: middle;"></div>`;
    voicePreviewButton.disabled = true;

    const onEnd = () => {
        resetAudioState();
        voicePreviewButton.innerHTML = originalText;
        voicePreviewButton.disabled = false;
    };
    
    if (isGoogleTtsAvailable) {
        try {
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text: previewText },
                    voice: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-E' },
                    audioConfig: { audioEncoding: 'MP3', speakingRate: settings.playbackSpeed }
                })
            });
            if (!response.ok) throw new Error('Preview TTS failed');
            const data = await response.json();
            const audioCtx = getAudioContext();
            if (!audioCtx) return;
            const audioBuffer = await audioCtx.decodeAudioData(base64ToArrayBuffer(data.audioContent));
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
            currentAudioSource = source;
            startAmbientSound();
            source.onended = onEnd;
        } catch (e) {
            console.error("Voice preview failed", e);
            onEnd();
        }
    } else {
        if (typeof speechSynthesis === 'undefined') {
            console.error("Speech Synthesis API is not supported in this browser.");
            onEnd();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(previewText);
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === settings.voiceName);
        utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith(settings.uiLang)) || null;
        utterance.pitch = settings.pitch;
        utterance.rate = settings.playbackSpeed;
        utterance.onend = onEnd;
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            console.error("Native TTS Preview Error:", e.error);
            onEnd();
        };
        speechSynthesis.speak(utterance);
    }
}

function setupSettings(): void {
  settingsButton.addEventListener('click', () => { chatContainer.classList.add('settings-visible'); renderFavorites(); });
  closeSettingsButton.addEventListener('click', () => chatContainer.classList.remove('settings-visible'));
  
  const handleProfileChange = () => {
    settings.userRole = userRoleSelect.value;
    settings.userLevel = userLevelSelect.value;
    saveSettings();
    initializeChat(); // Re-init chat with new system prompt
    if (chatHistoryLog.length <= 1) { // Only refresh if conversation hasn't started
        renderSuggestions();
    }
  };
  userRoleSelect.addEventListener('change', handleProfileChange);
  userLevelSelect.addEventListener('change', handleProfileChange);

  uiLangSelect.addEventListener('change', () => { 
    settings.uiLang = uiLangSelect.value; 
    updateUIText(settings.uiLang); 
    if (!isGoogleTtsAvailable) populateVoiceList();
    saveSettings(); 
  });
  
  themeToggle.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.matches('.theme-button')) {
      settings.theme = target.dataset.theme as 'light' | 'dark';
      body.setAttribute('data-theme', settings.theme);
      const previouslyActive = themeToggle.querySelector('.active') as HTMLButtonElement;
      if (previouslyActive) {
        previouslyActive.classList.remove('active');
        previouslyActive.setAttribute('aria-pressed', 'false');
      }
      target.classList.add('active');
      target.setAttribute('aria-pressed', 'true');
      saveSettings();
    }
  });

  textSizeToggle.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.matches('.text-size-button')) {
      settings.textSize = target.dataset.size as 'small' | 'normal' | 'large';
      chatContainer.setAttribute('data-text-size', settings.textSize);
      const previouslyActive = textSizeToggle.querySelector('.active') as HTMLButtonElement;
      if (previouslyActive) {
        previouslyActive.classList.remove('active');
        previouslyActive.setAttribute('aria-pressed', 'false');
      }
      target.classList.add('active');
      target.setAttribute('aria-pressed', 'true');
      saveSettings();
    }
  });
  
  playbackSpeedToggle.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.matches('.playback-speed-button')) {
      settings.playbackSpeed = parseFloat(target.dataset.speed || '1');
      const previouslyActive = playbackSpeedToggle.querySelector('.active') as HTMLButtonElement;
      if (previouslyActive) {
        previouslyActive.classList.remove('active');
        previouslyActive.setAttribute('aria-pressed', 'false');
      }
      target.classList.add('active');
      target.setAttribute('aria-pressed', 'true');
      saveSettings();
    }
  });

  soundToggle.addEventListener('change', () => { settings.soundEnabled = soundToggle.checked; saveSettings(); });
  soundThemeGroup.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'sound-theme') {
      settings.soundTheme = target.value as SoundTheme;
      playSound('receive'); saveSettings();
    }
  });
  soundThemeGroup.querySelectorAll('.preview-button').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme') as SoundTheme;
      if(theme) playSound('receive', theme);
    });
  });

  voiceSelect.addEventListener('change', () => {
    const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
    settings.voiceName = selectedOption.getAttribute('data-name') || '';
    saveSettings();
  });
  pitchSlider.addEventListener('input', () => {
    settings.pitch = parseFloat(pitchSlider.value);
    saveSettings();
  });

  voicePreviewButton.addEventListener('click', handleVoicePreview);

  clearHistoryButton.addEventListener('click', () => {
    resetAudioState();
    localStorage.removeItem('senProfAssistantHistory');
    chatHistoryLog = [];
    chatHistory.innerHTML = '';
    const welcomeMessage = translations[settings.uiLang].welcomeMessage;
    displayMessage(welcomeMessage, 'ai');
    chatHistoryLog.push({ sender: 'ai', content: welcomeMessage });
    chatContainer.classList.remove('settings-visible');
  });
}

function saveSettings(): void {
  try {
    localStorage.setItem('senProfAssistantSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Could not save settings to localStorage:', error);
  }
}

function loadSettings(): void {
  try {
    const savedSettings = localStorage.getItem('senProfAssistantSettings');
    if (savedSettings) {
      settings = { ...settings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.warn('Could not load settings from localStorage:', error);
  }

  // Update UI
  updateAvatar();
  body.setAttribute('data-theme', settings.theme);
  const oldActiveTheme = themeToggle.querySelector('.active') as HTMLButtonElement;
  if(oldActiveTheme) {
      oldActiveTheme.classList.remove('active');
      oldActiveTheme.setAttribute('aria-pressed', 'false');
  }
  const newActiveTheme = themeToggle.querySelector(`[data-theme="${settings.theme}"]`) as HTMLButtonElement;
  if(newActiveTheme) {
      newActiveTheme.classList.add('active');
      newActiveTheme.setAttribute('aria-pressed', 'true');
  }
  
  chatContainer.setAttribute('data-text-size', settings.textSize);
  const oldActiveSize = textSizeToggle.querySelector('.active') as HTMLButtonElement;
  if(oldActiveSize) {
      oldActiveSize.classList.remove('active');
      oldActiveSize.setAttribute('aria-pressed', 'false');
  }
  const newActiveSize = textSizeToggle.querySelector(`[data-size="${settings.textSize}"]`) as HTMLButtonElement;
  if(newActiveSize) {
      newActiveSize.classList.add('active');
      newActiveSize.setAttribute('aria-pressed', 'true');
  }

  const oldActiveSpeed = playbackSpeedToggle.querySelector('.active') as HTMLButtonElement;
  if(oldActiveSpeed) {
      oldActiveSpeed.classList.remove('active');
      oldActiveSpeed.setAttribute('aria-pressed', 'false');
  }
  const newActiveSpeed = playbackSpeedToggle.querySelector(`[data-speed="${settings.playbackSpeed}"]`) as HTMLButtonElement;
  if(newActiveSpeed) {
      newActiveSpeed.classList.add('active');
      newActiveSpeed.setAttribute('aria-pressed', 'true');
  }

  soundToggle.checked = settings.soundEnabled;
  (document.querySelector(`input[name="sound-theme"][value="${settings.soundTheme}"]`) as HTMLInputElement)?.setAttribute('checked', 'true');
  uiLangSelect.value = settings.uiLang;
  userRoleSelect.value = settings.userRole;
  userLevelSelect.value = settings.userLevel;
  pitchSlider.value = String(settings.pitch);
}

function saveFavorites() {
  localStorage.setItem('senProfAssistantFavorites', JSON.stringify(favorites));
}

function loadFavorites() {
  try {
    const saved = localStorage.getItem('senProfAssistantFavorites');
    if (saved) favorites = JSON.parse(saved);
  } catch (e) {
    console.warn('Could not load favorites', e);
    favorites = [];
  }
}

function renderFavorites() {
  const t = translations[settings.uiLang];
  favoritesList.innerHTML = '';
  if (favorites.length === 0) {
    favoritesList.innerHTML = `<p class="no-favorites">${t.noFavorites}</p>`;
    return;
  }

  favorites.forEach((fav, index) => {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.innerHTML = `
      <a href="${fav.url}" target="_blank" rel="noopener noreferrer">${fav.title}</a>
      <button class="remove-favorite-button" data-index="${index}" aria-label="${t.removeFavorite}" title="${t.removeFavorite}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    `;
    favoritesList.appendChild(item);
  });

  favoritesList.querySelectorAll('.remove-favorite-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt((e.currentTarget as HTMLButtonElement).dataset.index!, 10);
      favorites.splice(index, 1);
      saveFavorites();
      renderFavorites();
      chatHistory.querySelectorAll('.message.ai').forEach(m => {
          const oldInteractive = m.querySelector('.interactive-elements');
          if(oldInteractive) oldInteractive.remove();
          addInteractiveElements(m as HTMLElement)
      });
    });
  });
}

async function generateSuggestions(): Promise<string[]> {
  const { userRole, userLevel, uiLang } = settings;
  const t = translations[uiLang] || translations.fr;

  const roleKeyMap: { [key: string]: string } = {
    'enseignant': 'roleTeacher',
    'eleve': 'roleStudent',
    'parent': 'roleParent'
  };
  const userRoleKey = roleKeyMap[userRole];
  const translatedRole = t[userRoleKey] || userRole;
  const levelKey = schoolLevels.find(l => l.value === userLevel)?.key || userLevel;

  const prompt = `You are an assistant for Nebula, an educational platform. A user with the profile '${translatedRole}' for school level '${levelKey}' is using the chat. The current interface language is '${uiLang}'. Generate 3 short, relevant, and engaging questions (max 50 chars) in the language '${uiLang}' that this user might ask. These questions will be displayed as clickable suggestion chips. For a teacher, suggest lesson plans or resources. For a student, suggest exercises or explanations. For a parent, suggest ways to help their child. Respond ONLY with a JSON object containing a "suggestions" array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    if (result.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
      return result.suggestions.slice(0, 3); // Ensure only 3 are returned
    }
    return [];
  } catch (error) {
    console.error("Failed to generate suggestions:", error);
    return [];
  }
}


async function renderSuggestions() {
  // Only show suggestions at the start of a conversation.
  if (chatHistoryLog.length > 1) {
      suggestionChipsContainer.classList.add('hidden');
      suggestionChipsContainer.innerHTML = '';
      return;
  }
  // Prevent re-fetching or showing if user is typing.
  if (isFetchingSuggestions || chatInput.value.trim() !== '') {
    return;
  }

  isFetchingSuggestions = true;
  suggestionChipsContainer.innerHTML = ''; // Clear previous
  suggestionChipsContainer.classList.remove('hidden');

  // Show placeholders while loading
  for (let i = 0; i < 3; i++) {
    const placeholder = document.createElement('div');
    placeholder.className = 'suggestion-chip-placeholder';
    suggestionChipsContainer.appendChild(placeholder);
  }

  let suggestions: string[] = [];
  try {
    suggestions = await generateSuggestions();
  } finally {
    isFetchingSuggestions = false;
  }
  
  if (suggestions.length === 0) {
    suggestions = fallbackSuggestions;
  }

  // If user started typing or a message was sent while we were fetching, abort rendering.
  if (chatInput.value.trim() !== '' || loadingIndicator.classList.contains('hidden') === false) {
    suggestionChipsContainer.classList.add('hidden');
    suggestionChipsContainer.innerHTML = '';
    return;
  }

  suggestionChipsContainer.innerHTML = ''; // Clear placeholders
  suggestions.slice(0, 3).forEach(text => { // Ensure max 3
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = text;
    chip.addEventListener('click', () => { 
      chatInput.value = text; 
      chatForm.requestSubmit(); 
    });
    suggestionChipsContainer.appendChild(chip);
  });
}

function setupShareModal() {
  shareButton.addEventListener('click', () => shareModalOverlay.classList.remove('hidden'));
  closeShareModalButton.addEventListener('click', () => shareModalOverlay.classList.add('hidden'));
  shareModalOverlay.addEventListener('click', (e) => {
    if (e.target === shareModalOverlay) shareModalOverlay.classList.add('hidden');
  });
  copyTranscriptionButton.addEventListener('click', copyTranscription);
  exportPdfButton.addEventListener('click', exportToPdf);
}

// --- Image Upload ---

function setupImageUpload() {
  imageUploadButton.addEventListener('click', () => imageUploadInput.click());
  imageUploadInput.addEventListener('change', handleImageSelection);
  removeImageButton.addEventListener('click', removeAttachedImage);
}

function handleImageSelection(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      attachedImage = {
        base64,
        mimeType: file.type,
        dataUrl,
      };
      imagePreview.src = dataUrl;
      imagePreviewContainer.classList.remove('hidden');
    };
    reader.onerror = () => {
      displayError(reader.error, 'imageLoadError');
      removeAttachedImage();
    };
    reader.readAsDataURL(file);
  }
}

function removeAttachedImage() {
  attachedImage = null;
  imageUploadInput.value = ''; // Reset file input
  imagePreviewContainer.classList.add('hidden');
}


// --- Advanced Search ---

function setupAdvancedSearch() {
  advancedSearchButton.addEventListener('click', () => advancedSearchModalOverlay.classList.remove('hidden'));
  closeAdvancedSearchButton.addEventListener('click', () => advancedSearchModalOverlay.classList.add('hidden'));
  advancedSearchModalOverlay.addEventListener('click', (e) => {
    if (e.target === advancedSearchModalOverlay) advancedSearchModalOverlay.classList.add('hidden');
  });
  advancedSearchForm.addEventListener('submit', handleAdvancedSearchSubmit);

  closeSearchResultsButton.addEventListener('click', () => searchResultsModalOverlay.classList.add('hidden'));
  searchResultsModalOverlay.addEventListener('click', (e) => {
    if (e.target === searchResultsModalOverlay) searchResultsModalOverlay.classList.add('hidden');
  });
}

async function handleAdvancedSearchSubmit(event: SubmitEvent) {
  event.preventDefault();
  const t = translations[settings.uiLang];
  
  const subject = searchSubjectInput.value.trim();
  const level = schoolLevels.find(l => l.value === searchLevelSelect.value)?.key || 'Tous';
  const selectedTypes = Array.from(searchTypeContainer.querySelectorAll<HTMLInputElement>('input[name="resource-type"]:checked'))
                             .map(checkbox => checkbox.value);
  
  if (!subject || selectedTypes.length === 0) {
    // Basic validation
    return;
  }

  advancedSearchModalOverlay.classList.add('hidden');
  searchResultsModalOverlay.classList.remove('hidden');
  searchResultsContainer.innerHTML = `<div class="loading-spinner-container" style="margin: auto;"><svg class="loading-spinner-svg" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle></svg></div>`;

  const prompt = `Effectue une recherche en utilisant l'opérateur "site:layendo1.github.io/nebula-plateforme/" pour des ressources pédagogiques sur le sujet "${subject}" pour le niveau scolaire "${level}". Filtre les résultats pour n'inclure que les types suivants : ${selectedTypes.join(', ')}. Pour chaque ressource trouvée, fournis le titre, une brève description, l'URL complète (qui doit provenir de la plateforme Nebula), le type de ressource et le niveau scolaire correspondant.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resources: {
              type: Type.ARRAY,
              description: "A list of educational resources found.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The title of the resource." },
                  description: { type: Type.STRING, description: "A brief summary of the resource." },
                  url: { type: Type.STRING, description: "The direct URL to the resource on the Nebula platform." },
                  type: { type: Type.STRING, description: "The type of resource (e.g., 'Vidéo', 'Document', 'Article')." },
                  level: { type: Type.STRING, description: "The target school level (e.g., 'CM2', 'Seconde')." }
                },
                required: ["title", "description", "url", "type", "level"]
              }
            }
          }
        }
      }
    });

    const resultData = JSON.parse(response.text);
    renderSearchResults(resultData.resources || []);

  } catch (error) {
    console.error("Advanced search failed:", error);
    const key = getErrorMessageKey(error);
    searchResultsContainer.innerHTML = `<p class="error">${t[key]}</p>`;
  }
}

function renderSearchResults(results: any[]) {
    const t = translations[settings.uiLang];
    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<p>${t.noResultsFound}</p>`;
        return;
    }

    results.forEach(res => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const isBookmarked = favorites.some(fav => fav.url === res.url);
        const bookmarkTooltip = isBookmarked ? t.removeFavoriteTooltip : t.addFavoriteTooltip;

        card.innerHTML = `
            <div class="result-card-header">
                <h4><a href="${res.url}" target="_blank" rel="noopener noreferrer">${res.title}</a></h4>
                <span class="result-card-type-badge">${res.type}</span>
            </div>
            <div class="result-card-body">
                <p>${res.description}</p>
            </div>
            <div class="result-card-footer">
                <span>${res.level}</span>
                <div class="interactive-elements" style="opacity:1; transform:none; position:relative; top:0; right:0;">
                  <button class="bookmark-button ${isBookmarked ? 'bookmarked' : ''}" aria-label="${bookmarkTooltip}" title="${bookmarkTooltip}">🔖</button>
                </div>
            </div>
        `;
        
        const bookmarkButton = card.querySelector('.bookmark-button') as HTMLButtonElement;
        bookmarkButton.addEventListener('click', () => {
            const favoriteIndex = favorites.findIndex(fav => fav.url === res.url);
            if (favoriteIndex > -1) {
                favorites.splice(favoriteIndex, 1);
                bookmarkButton.classList.remove('bookmarked');
            } else {
                favorites.push({ url: res.url, title: res.title });
                bookmarkButton.classList.add('bookmarked');
            }
            const newBookmarkTooltip = bookmarkButton.classList.contains('bookmarked') ? t.removeFavoriteTooltip : t.addFavoriteTooltip;
            bookmarkButton.setAttribute('aria-label', newBookmarkTooltip);
            bookmarkButton.setAttribute('title', newBookmarkTooltip);
            saveFavorites();
            renderFavorites();
        });

        searchResultsContainer.appendChild(card);
    });
}


async function copyTranscription() {
  const t = translations[settings.uiLang];
  const header = `${t.appTitle}\n${t.appSubtitle}\n\n====================\n\n`;
  
  const userSender = t.userSender || 'User';
  const assistantSender = t.assistantSender || 'Assistant';
  
  const body = chatHistoryLog.map(msg => {
    const sender = msg.sender === 'user' ? userSender : assistantSender;
    return `${sender}:\n${msg.content.replace(/<[^>]+>/g, '')}`;
  }).join('\n\n');

  const text = header + body;
  try {
    await navigator.clipboard.writeText(text);
    const originalText = copyTranscriptionButton.textContent;
    copyTranscriptionButton.textContent = t.transcriptionCopied;
    setTimeout(() => { copyTranscriptionButton.textContent = originalText; }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

function exportToPdf() {
  const t = translations[settings.uiLang];
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${t.appTitle} - Conversation</title>
          <link rel="stylesheet" href="index.css">
        </head>
        <body class="pdf-export" data-theme="${settings.theme}">
          <div class="chat-container">
            <header>
              <div class="header-text">
                <h1>${t.appTitle}</h1>
                <p>${t.appSubtitle}</p>
              </div>
            </header>
            <div id="chat-history">${chatHistory.innerHTML}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // A small delay is needed for styles to apply before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

/**
 * Checks if the Google Cloud TTS API is available and configures the UI accordingly.
 */
async function initializeTts() {
    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: 'test' },
                voice: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-E' },
                audioConfig: { audioEncoding: 'MP3' }
            })
        });
        if (response.ok) {
            isGoogleTtsAvailable = true;
        } else {
            isGoogleTtsAvailable = false;
        }
    } catch (error) {
        isGoogleTtsAvailable = false;
    }

    body.dataset.ttsService = isGoogleTtsAvailable ? 'google' : 'native';

    if (!isGoogleTtsAvailable) {
        // Populate voices for native TTS
        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }
        populateVoiceList();
    }
}

async function main() {
  loadSettings();
  populateLevelSelects();
  loadFavorites();
  await initializeTts();
  initializeChat();
  updateUIText(settings.uiLang);
  loadChatHistory();

  chatForm.addEventListener('submit', handleFormSubmit);
  setupSpeechRecognition();
  setupKeyboardShortcuts();
  setupSettings();
  setupShareModal();
  setupAdvancedSearch();
  setupImageUpload();

  chatInput.addEventListener('input', () => {
    if(chatInput.value.trim() !== '') {
      suggestionChipsContainer.classList.add('hidden');
    } else {
      renderSuggestions();
    }
  });

  minimizeButton.addEventListener('click', handleMinimizeClick);
  closeButton.addEventListener('click', handleCloseClick);
  header.addEventListener('click', handleHeaderClick);
  helpButton.addEventListener('click', handleHelpClick);
  
  if (chatHistoryLog.length === 0) {
    const welcomeMessage = translations[settings.uiLang].welcomeMessage;
    displayMessage(welcomeMessage, 'ai');
    chatHistoryLog.push({ sender: 'ai', content: welcomeMessage });
  }

  renderSuggestions();
}

main();