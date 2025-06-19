import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const logoUrl = 'https://cnol-badge.vercel.app/logo-cnol.png';

const fetchImageAsBytes = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
};

export async function generateTicket({
    nom,
    prenom,
    email,
    eventType, // 'Atelier' ou 'Masterclass'
    eventTitle,
    eventDate,
    reservationId,
    salle // on prévoit ce champ, il sera passé depuis l'appel
}) {
    try {
        if (!reservationId) {
            console.error('generateTicket: reservationId manquant ou invalide', reservationId);
            throw new Error('reservationId manquant pour la génération du QR code');
        }
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([420, 260]);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Logo CNOL (plus petit, en haut à gauche)
        const logoImageBytes = await fetchImageAsBytes(logoUrl);
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.09);
        page.drawImage(logoImage, { x: 20, y: 210, width: logoDims.width, height: logoDims.height });

        // Titre centré
        page.drawText(`Ticket ${eventType}`, { x: 140, y: 230, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
        page.drawText(eventTitle, { x: 140, y: 210, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(new Date(eventDate).toLocaleString(), { x: 140, y: 195, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        if (salle) {
            page.drawText(`Salle : ${salle}`, { x: 140, y: 182, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        }

        // Infos participant (gauche)
        page.drawText(`Nom : ${nom}`, { x: 20, y: 150, size: 12, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(`Prénom : ${prenom}`, { x: 20, y: 135, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
        page.drawText(`Email : ${email}`, { x: 20, y: 120, size: 10, font: fontRegular, color: rgb(0, 0, 0) });

        // QR Code (droite)
        const qrCodeDataUrl = await QRCode.toDataURL(reservationId);
        const qrImageBytes = qrCodeDataUrl.split(',')[1];
        const qrImage = await pdfDoc.embedPng(Buffer.from(qrImageBytes, 'base64'));
        page.drawImage(qrImage, { x: 300, y: 60, width: 90, height: 90 });

        // Mention
        page.drawText('À présenter à l\'entrée de la salle.', { x: 20, y: 40, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Erreur génération ticket PDF :', error);
        throw error;
    }
} 