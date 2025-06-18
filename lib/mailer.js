const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text, html, attachments }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

async function sendTicketMail({ to, nom, prenom, eventType, eventTitle, eventDate, pdfBuffer }) {
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

module.exports = { sendMail, sendTicketMail };


