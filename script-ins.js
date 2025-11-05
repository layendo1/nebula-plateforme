function enregistrerInscription(formData) {
  try {
    const SHEET_NAME = "Formulaire d'inscription";
    const SPREADSHEET_ID = "12uBMWFbIiyfnh4ki322iAnhUsAD0oFbCbBlAaq8MX2E";
    const START_ROW = 14;
    
    // Vérification des données requises
    if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone || 
        !formData.niveau || !formData.type_cours || !formData.classe) {
      throw new Error("Tous les champs obligatoires doivent être remplis");
    }

    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      if (!spreadsheet) throw new Error("Feuille introuvable");
    } catch (e) {
      throw new Error("Accès refusé à la feuille. Vérifiez l'ID et les permissions.");
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Création de la feuille si elle n'existe pas
    if (!sheet) {
      try {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
        
        // En-têtes
        const headers = [
          "Date", "Prénom", "Nom", "Email", "Téléphone", "Niveau", "Classe", 
          "Type de cours", "Matières", "Cours info", "Fréquence", "Disponibilités", "Message"
        ];
        
        sheet.getRange(13, 1, 1, headers.length).setValues([headers]);
        
        // Formatage des en-têtes
        const headerRange = sheet.getRange(13, 1, 1, headers.length);
        headerRange.setBackground("#4361ee")
                  .setFontColor("#ffffff")
                  .setFontWeight("bold")
                  .setHorizontalAlignment("center")
                  .setFontSize(12);
      } catch (e) {
        throw new Error("Erreur lors de la création de la feuille: " + e.message);
      }
    }
    
    // Trouver la ligne d'insertion
    let lastRow = sheet.getLastRow();
    let insertRow = (lastRow < START_ROW) ? START_ROW : lastRow + 1;
    
    // Préparation des données
    const rowData = [
      formData.date || new Date().toLocaleString('fr-FR'),
      formData.prenom,
      formData.nom,
      formData.email,
      formData.telephone,
      formData.niveau,
      formData.classe,
      formData.type_cours,
      formData.matieres || "Non applicable",
      formData.cours_info || "Non applicable",
      formData.frequence || "Non spécifié",
      formData.disponibilites || "Non spécifié",
      formData.message || "Aucune information supplémentaire"
    ];
    
    try {
      // Écriture des données
      sheet.getRange(insertRow, 1, 1, rowData.length).setValues([rowData]);
      
      // Formatage des données
      const dataRange = sheet.getRange(insertRow, 1, 1, rowData.length);
      dataRange.setFontFamily("Times New Roman")
              .setFontSize(16)
              .setHorizontalAlignment("center")
              .setVerticalAlignment("middle")
              .setWrap(true)
              .setBorder(true, true, true, true, true, true);
      
      // Alternance des couleurs
      dataRange.setBackground(insertRow % 2 === 0 ? "#f8f9fa" : "#ffffff");
      
      return {
        success: true,
        message: "Votre inscription a été enregistrée avec succès. Nous vous contacterons rapidement."
      };
      
    } catch (e) {
      console.error("Erreur d'écriture:", e);
      throw new Error("Erreur lors de l'écriture des données dans la feuille");
    }
    
  } catch (error) {
    console.error("Erreur complète:", error);
    return {
      success: false,
      message: "Erreur: " + (error.message || "Une erreur inconnue est survenue. Veuillez réessayer.")
    };
  }
}