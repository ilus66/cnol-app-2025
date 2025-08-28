/**
 * Utilitaires pour la gestion WhatsApp
 */

/**
 * Vérifie si un numéro de téléphone est valide pour l'envoi WhatsApp
 * @param {string} telephone - Le numéro de téléphone à vérifier
 * @returns {boolean} - True si le numéro est valide
 */
export function isValidWhatsAppNumber(telephone) {
  if (!telephone) return false;
  
  // Nettoyer le numéro
  const cleanNumber = telephone.replace(/\s+/g, '');
  
  // Vérifier qu'il commence par + et contient au moins 10 chiffres
  return /^\+[0-9]{10,}$/.test(cleanNumber);
}

/**
 * Normalise un numéro de téléphone pour WhatsApp
 * @param {string} telephone - Le numéro de téléphone à normaliser
 * @returns {string} - Le numéro normalisé
 */
export function normalizePhoneNumber(telephone) {
  if (!telephone) return '';
  
  let p = telephone.replace(/\D/g, '');
  
  if (p.startsWith('212')) p = '+' + p;
  else if (p.startsWith('0')) p = '+212' + p.slice(1);
  else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
  else if (!p.startsWith('+')) p = '+' + p;
  
  return p;
}

/**
 * Prépare le message WhatsApp pour un ticket
 * @param {Object} params - Paramètres du ticket
 * @param {string} params.prenom - Prénom du participant
 * @param {string} params.nom - Nom du participant
 * @param {string} params.eventType - Type d'événement (Atelier/Masterclass)
 * @param {string} params.eventTitle - Titre de l'événement
 * @param {string} params.eventDate - Date de l'événement
 * @param {string} params.downloadUrl - URL de téléchargement du ticket
 * @returns {string} - Le message WhatsApp formaté
 */
export function prepareTicketWhatsAppMessage({ prenom, nom, eventType, eventTitle, eventDate, downloadUrl }) {
  return `Bonjour ${prenom} ${nom},\n\nVotre ticket pour le ${eventType} : ${eventTitle} du ${new Date(eventDate).toLocaleString()} est en pièce jointe.\n\nMerci de présenter ce ticket (avec QR code) à l'entrée de la salle.\n\nVous pouvez également le télécharger ici : ${downloadUrl}\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc`;
}

/**
 * Prépare le nom de fichier pour un ticket
 * @param {Object} params - Paramètres du ticket
 * @param {string} params.eventType - Type d'événement
 * @param {string} params.eventTitle - Titre de l'événement
 * @param {string} params.prenom - Prénom du participant
 * @param {string} params.nom - Nom du participant
 * @returns {string} - Le nom de fichier formaté
 */
export function prepareTicketFileName({ eventType, eventTitle, prenom, nom }) {
  const cleanTitle = eventTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
  const cleanName = `${prenom}-${nom}`.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
  return `ticket-${eventType.toLowerCase()}-${cleanTitle}-${cleanName}.pdf`;
}

/**
 * Log les informations d'envoi WhatsApp
 * @param {string} action - Action effectuée (validation, renvoi, etc.)
 * @param {string} eventType - Type d'événement
 * @param {string} eventTitle - Titre de l'événement
 * @param {string} participantName - Nom du participant
 * @param {boolean} success - Si l'envoi a réussi
 * @param {string} error - Message d'erreur si échec
 */
export function logWhatsAppAction(action, eventType, eventTitle, participantName, success, error = null) {
  const timestamp = new Date().toISOString();
  const status = success ? '✅' : '❌';
  const logMessage = `[${timestamp}] ${status} WhatsApp ${action} - ${eventType}: ${eventTitle} - ${participantName}`;
  
  if (success) {
    console.log(logMessage);
  } else {
    console.error(`${logMessage} - Erreur: ${error}`);
  }
} 