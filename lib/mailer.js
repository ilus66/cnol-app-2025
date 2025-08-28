import nodemailer from 'nodemailer';
import { uploadToR2 } from './uploadToR2';
import { 
  isValidWhatsAppNumber, 
  normalizePhoneNumber, 
  prepareTicketWhatsAppMessage, 
  prepareTicketFileName,
  logWhatsAppAction 
} from '../utils/whatsappUtils';
    
// AVERTISSEMENT : Les identifiants sont codés en dur pour le développement local.
// Idéalement, utilisez des variables d'environnement.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, text, html, attachments }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

export async function sendTicketMail({ to, nom, prenom, eventType, eventTitle, eventDate, pdfBuffer }) {
  const subject = `Votre ticket ${eventType} - ${eventTitle}`;
  const text = `Bonjour ${prenom} ${nom},\n\nVoici votre ticket pour le ${eventType} : ${eventTitle} du ${new Date(eventDate).toLocaleString()}.\n\nMerci de présenter ce ticket (avec QR code) à l'entrée de la salle.`;
  const html = `<p>Bonjour <b>${prenom} ${nom}</b>,<br/>Voici votre ticket pour le <b>${eventType}</b> : <b>${eventTitle}</b> du <b>${new Date(eventDate).toLocaleString()}</b>.<br/><br/>Merci de présenter ce ticket (avec QR code) à l'entrée de la salle.</p>`;
  return sendMail({
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `ticket-${eventType.toLowerCase()}-${eventTitle.replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

// Nouvelle fonction pour envoyer les tickets par WhatsApp
export async function sendTicketWhatsApp({ to, nom, prenom, eventType, eventTitle, eventDate, pdfBuffer, pdfFileName }) {
  try {
    // 1. Vérifier et normaliser le numéro de téléphone
    if (!isValidWhatsAppNumber(to)) {
      const normalizedNumber = normalizePhoneNumber(to);
      if (!isValidWhatsAppNumber(normalizedNumber)) {
        throw new Error(`Numéro de téléphone invalide: ${to}`);
      }
      to = normalizedNumber;
    }

    // 2. Upload du PDF sur Cloudflare R2
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `tickets/${eventType.toLowerCase()}-${timestamp}-${pdfFileName}`;

    const { success, publicUrl, error: uploadError } = await uploadToR2(
      fileName, 
      pdfBuffer, 
      'application/pdf'
    );

    if (!success) {
      console.error('Erreur upload ticket WhatsApp vers R2:', uploadError);
      throw uploadError;
    }

    // 4. Préparer le message WhatsApp
    const whatsappText = prepareTicketWhatsAppMessage({
      prenom,
      nom,
      eventType,
      eventTitle,
      eventDate,
      downloadUrl: publicUrl
    });

    // 5. Envoyer par WhatsApp via l'API interne
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        text: whatsappText,
        documentUrl: publicUrl,
        fileName: pdfFileName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur envoi WhatsApp: ${errorData.error || 'Erreur inconnue'}`);
    }

    // 6. Logger le succès
    logWhatsAppAction('envoi', eventType, eventTitle, `${prenom} ${nom}`, true);

    // 7. Nettoyer le fichier temporaire après envoi (optionnel)
    // await supabaseAdmin.storage.from('logos').remove([fileName]);

    return { success: true, publicUrl };
  } catch (error) {
    // Logger l'erreur
    logWhatsAppAction('envoi', eventType, eventTitle, `${prenom} ${nom}`, false, error.message);
    console.error('Erreur envoi ticket WhatsApp:', error);
    throw error;
  }
}
