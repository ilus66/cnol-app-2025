const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');

const logoUrl = 'https://cnol-badge.vercel.app/logo-cnol.png';

const fetchImageAsBytes = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
};

async function generateTicket({
    nom,
    prenom,
    email,
    eventType, // 'Atelier' ou 'Masterclass'
    eventTitle,
    eventDate,
    reservationId
}) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([400, 250]);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Logo CNOL
        const logoImageBytes = await fetchImageAsBytes(logoUrl);
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.12);
        page.drawImage(logoImage, { x: 20, y: 180, width: logoDims.width, height: logoDims.height });

        // Titre
        page.drawText(`Ticket ${eventType}`, { x: 140, y: 220, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
        page.drawText(eventTitle, { x: 140, y: 200, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(new Date(eventDate).toLocaleString(), { x: 140, y: 185, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

        // Infos participant
        page.drawText(`Nom : ${nom}`, { x: 20, y: 150, size: 12, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(`Prénom : ${prenom}`, { x: 20, y: 135, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        page.drawText(`Email : ${email}`, { x: 20, y: 120, size: 10, font: fontRegular, color: rgb(0, 0, 0) });

        // QR Code (id réservation)
        const qrCodeDataUrl = await QRCode.toDataURL(reservationId);
        const qrImageBytes = qrCodeDataUrl.split(',')[1];
        const qrImage = await pdfDoc.embedPng(Buffer.from(qrImageBytes, 'base64'));
        page.drawImage(qrImage, { x: 280, y: 40, width: 90, height: 90 });

        // Mention
        page.drawText('À présenter à l\'entrée de la salle.', { x: 20, y: 40, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Erreur génération ticket PDF :', error);
        throw error;
    }
}

module.exports = { generateTicket }; 