function doGet() {
  return HtmlService.createHtmlOutputFromFile('form_etablissement');
}

const CODE_UNIQUE = "12345"; // Code unique non modifiable

function verifierCode(code) {
  // Vérifie si le code saisi correspond au code unique
  if (code === CODE_UNIQUE) {
    return { 
      success: true, 
      message: "Code valide. Accès accordé.",
      redirectUrl: "index.html" // URL de redirection
    };
  } else {
    return { 
      success: false, 
      message: "Code invalide. Veuillez réessayer." 
    };
  }
}