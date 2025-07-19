const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const fontkit = require('fontkit');

// URLs absolues des images (fonctionne en local et sur Vercel)
const posterUrl = 'https://cnol-app-2025.vercel.app/cnol2025-poster.jpg';
const logoUrl = 'https://cnol-app-2025.vercel.app/logo-cnol.png';

// Fonction utilitaire pour charger une image depuis une URL
const fetchImageAsBytes = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
};

// Fonction pour dessiner la partie haut droite (affiche congrès)
async function drawBadgeTopRight(page, pdfDoc) {
    const posterUrl = 'https://cnol-app-2025.vercel.app/cnol2025-poster.jpg';
    const fetchImageAsBytes = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        const buffer = await res.arrayBuffer();
        return new Uint8Array(buffer);
    };
    const posterImageBytes = await fetchImageAsBytes(posterUrl);
    const posterImage = await pdfDoc.embedJpg(posterImageBytes);
    const posterDims = posterImage.scale(0.21);
    page.drawImage(posterImage, {
        x: 300, y: 420, width: posterDims.width, height: posterDims.height,
    });
}

// Fonction pour dessiner la partie haut gauche (identité, titre, code-barres, dates...)
async function drawBadgeTopLeft(page, pdfDoc, userData) {
    const { prenom, nom, function: userFunction, city, badgeCode, date, heure, dateFin, heureFin, lieu } = userData;
    // Utilisation de Montserrat si disponible, sinon Helvetica
    const fs = require('fs');
    let fontRegular, fontBold;
    try {
        const montserratRegular = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf'));
        const montserratBold = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf'));
        fontRegular = await pdfDoc.embedFont(montserratRegular);
        fontBold = await pdfDoc.embedFont(montserratBold);
    } catch (e) {
        console.error('Erreur chargement police Montserrat:', e);
        fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }
    // Décalage horizontal global
    const decalX = 20;
    // 1. Code-barres statique en haut à gauche
    let y = 780;
    const barcodeImagePath = path.join(process.cwd(), 'public', 'codeb.png');
    const barcodeImageBytes = fs.readFileSync(barcodeImagePath);
    const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);
    page.drawImage(barcodeImage, { x: decalX, y: y + 20, width: 120, height: 24 });
    y -= 38;
    // 2. Titre principal sur deux lignes, centré
    y += 22;
    const title1 = "CONGRÈS NATIONAL";
    const title2 = "D'OPTIQUE LUNETTERIE";
    const title1Width = fontBold.widthOfTextAtSize(title1, 22);
    const title2Width = fontBold.widthOfTextAtSize(title2, 22);
    const centerX = decalX + 130 - Math.max(title1Width, title2Width) / 2;
    page.drawText(title1, { x: centerX, y: y + 7, size: 22, font: fontBold, color: rgb(0,0,0) });
    y -= 26;
    page.drawText(title2, { x: centerX, y: y + 7, size: 22, font: fontBold, color: rgb(0,0,0) });
    y -= 20;
    // 3. Adresse
    const adresse1 = "Centre de conférences Fm6education";
    const adresse2 = "Av. Allal Al Fassi RABAT";
    page.drawText(adresse1, { x: decalX, y: y + 10, size: 11, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 14;
    page.drawText(adresse2, { x: decalX, y: y + 10, size: 11, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 24;
    // 4. Bloc dates/horaires avec flèche, bien aligné
    page.drawText(date || "10 OCT. 2025", { x: decalX, y: y, size: 16, font: fontBold, color: rgb(0,0,0) });
    page.drawText(heure || "09H00", { x: decalX, y: y-16, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    // Trait vertical centré, gris, allongé
    const traitX = decalX + 120;
    page.drawLine({ start: { x: traitX, y: y+10.4 }, end: { x: traitX, y: y-18.4 }, thickness: 1, color: rgb(0.6,0.6,0.6) });
    page.drawText(dateFin || "12 OCT. 2025", { x: decalX+140, y: y, size: 16, font: fontBold, color: rgb(0,0,0) });
    page.drawText(heureFin || "18H00", { x: decalX+140, y: y-16, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 38;
    // Séparateur horizontal
    // Trait horizontal gris, remonté de 5px, raccourci de 20% à droite
    const traitHFin = decalX + (300 - decalX) * 0.9;
    page.drawLine({ start: { x: decalX, y: y+8 }, end: { x: traitHFin, y: y+8 }, thickness: 1, color: rgb(0.6,0.6,0.6) });
    y -= 22;
    // 5. Bloc nom/prénom, fonction, ville, code
    const fullName = ((prenom || '') + ' ' + (nom || '')).trim();
    page.drawText(fullName, { x: decalX, y: y, size: 16, font: fontBold, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(userFunction || '', { x: decalX, y: y, size: 13, font: fontBold, color: rgb(0,0,0) });
    y -= 16;
    page.drawText(city || '', { x: decalX, y: y, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 16;
    page.drawText(`Code : ${badgeCode || ''}`, { x: decalX, y: y, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 22;
    // Séparateur horizontal
    page.drawLine({ start: { x: decalX, y: y+8 }, end: { x: traitHFin, y: y+8 }, thickness: 1, color: rgb(0.6,0.6,0.6) });
    y -= 32;
    // 6. Texte badge nominatif et URL
    y -= 75;
    page.drawText("BADGE nominatif personnel – Présentez-le à l'entrée", { x: decalX, y: y, size: 8, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 29;
    page.drawText("www.app.cnol.ma", { x: decalX, y: y + 16, size: 12, font: fontBold, color: rgb(0.2,0.2,0.2) });
    // 7. QR code en bas à droite du bloc
    if (badgeCode) {
        // Génère le même format que generateBadge.js : cnol2025-<id>
        let qrValue = '';
        if (userData.userId) {
            qrValue = String(userData.userId);
        }
        // Remplacement : génération QR code avec 'qrcode' (comme dans generateBadge.js)
        const QRCode = require('qrcode');
        const qrCodeDataUrl = await QRCode.toDataURL(qrValue);
        const qrImageBytes = qrCodeDataUrl.split(',')[1];
        const qrImage = await pdfDoc.embedPng(Buffer.from(qrImageBytes, 'base64'));
        const infoY = 100;
        page.drawImage(qrImage, { x: 225, y: infoY + 318, width: 79, height: 79 });
    }
}

// Fonction principale
async function generateBadgeUnified(userData) {
    try {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        const page = pdfDoc.addPage([595, 842]); // A4

        // Utilisation de Montserrat si disponible, sinon Helvetica
        const fs = require('fs');
        let fontRegular, fontBold;
        try {
            const montserratRegular = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf'));
            const montserratBold = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf'));
            fontRegular = await pdfDoc.embedFont(montserratRegular);
            fontBold = await pdfDoc.embedFont(montserratBold);
        } catch (e) {
            console.error('Erreur chargement police Montserrat:', e);
            fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
            fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        }

        const { name, function: userFunction, city, email, userId } = userData;

        await drawBadgeTopLeft(page, pdfDoc, userData);

        // Affiche CNOL
        await drawBadgeTopRight(page, pdfDoc);

        // Affichage du code d'identification à gauche du QR code, même niveau
        if (userData.identifiant_badge) {
            // Encadré
            page.drawRectangle({
                x: 20, y: 100, width: 120, height: 40, borderColor: rgb(0, 0, 0), borderWidth: 1.5, color: rgb(1,1,1)
            });
            // Texte centré dans l'encadré
            const label = "Numéro d'identification";
            const labelWidth = fontBold.widthOfTextAtSize(label, 10);
            page.drawText(label, {
                x: 20 + (120 - labelWidth) / 2,
                y: 120,
                size: 10,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
            // Numéro centré en dessous
            const code = userData.identifiant_badge;
            const codeWidth = fontBold.widthOfTextAtSize(code, 18);
            page.drawText(code, {
                x: 20 + (120 - codeWidth) / 2,
                y: 105,
                size: 18,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
        }

        // --- Conseils et conditions (gauche/droite)
        const boxY = 150;
        const lineHeight = 11;
        // Titres parfaitement alignés
        const conseilsY = boxY + 50;
        const conditionsY = boxY + 50;
        // Conseils à gauche
        page.drawText("Conseils d'utilisation", {
            x: 20,
            y: conseilsY,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        const conseils = [
            "À plier en quatre selon les lignes indiquées.",
            "À conserver visible sur vous pendant l'événement.",
            "Présentez-le à l'entrée et aux contrôles.",
        ];
        conseils.forEach((line, i) => {
            page.drawText(line, {
                x: 20,
                y: conseilsY - (i + 1) * lineHeight,
                size: 8,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });
        });
        // Conditions à droite
        page.drawText("Conditions d'utilisation", {
            x: 340,
            y: conditionsY,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        const conditions = [
            "Ce badge est personnel et non transférable.",
            "Toute reproduction est interdite.",
            "Il est obligatoire pour accéder à l'espace exposition et",
            "aux conférences générales.",
            "Ce badge ne donne pas accès aux ateliers ni aux masterclass.",
            "La participation à l'événement vaut autorisation de captation",
            "photo et vidéo pour la communication du CNOL.",
        ];
        conditions.forEach((line, i) => {
            page.drawText(line, {
                x: 340,
                y: conditionsY - (i + 1) * lineHeight,
                size: 8,
                font: fontRegular,
                color: rgb(0.2, 0.2, 0.2),
            });
        });

        // Lignes de pliage
        page.drawLine({ start: { x: 0, y: 421 }, end: { x: 595, y: 421 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
        page.drawLine({ start: { x: 297.5, y: 0 }, end: { x: 297.5, y: 842 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });

        const pdfBytes = await pdfDoc.save();

        console.log(`✅ Badge généré en mémoire pour ${userId} (${name})`);

        return pdfBytes;

    } catch (error) {
        console.error("❌ Erreur lors de la génération du badge :", error);
        throw error;
    }
}

// Fonction de test : génère un PDF minimal (juste du texte)
async function generateMinimalPdf() {
    const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText('PDF minimal de test', { x: 50, y: 800, size: 24, font, color: rgb(0,0,0) });
    return await pdfDoc.save();
}

module.exports = { generateBadgeUnified, generateMinimalPdf }; 