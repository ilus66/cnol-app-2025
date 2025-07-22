const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const fontkit = require('fontkit');
const fs = require('fs');

// --- Caching Mechanism ---
const assetCache = {};

async function loadAsset(key, loader) {
  if (!assetCache[key]) {
    assetCache[key] = await loader();
  }
  return assetCache[key];
}

// --- Asset Loaders ---
const fetchImageAsBytes = (url) => async () => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  return new Uint8Array(await res.arrayBuffer());
};

const readFileBytes = (filePath) => () => fs.promises.readFile(filePath);

// --- PDF Drawing Functions ---
async function drawBadgeTopRight(page, pdfDoc) {
    const posterImageBytes = await loadAsset('posterImage', fetchImageAsBytes('https://cnol-app-2025.vercel.app/cnol2025-poster.jpg'));
    const posterImage = await pdfDoc.embedJpg(posterImageBytes);
    const posterDims = posterImage.scale(0.21);
    page.drawImage(posterImage, {
        x: 300, y: 420, width: posterDims.width, height: posterDims.height,
    });
}

async function drawBadgeTopLeft(page, pdfDoc, userData) {
    const { prenom, nom, function: userFunction, city, badgeCode, date, heure, dateFin, heureFin, lieu } = userData;

    const fontRegularBytes = await loadAsset('fontRegular', readFileBytes(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf')));
    const fontBoldBytes = await loadAsset('fontBold', readFileBytes(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf')));
    const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const decalX = 20;
    let y = 780;

    const barcodeImageBytes = await loadAsset('barcodeImage', readFileBytes(path.join(process.cwd(), 'public', 'codeb.png')));
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
    page.drawText(title1, { x: centerX + 7, y: y + 7, size: 20, font: fontBold, color: rgb(0,0,0) });
    y -= 26;
    page.drawText(title2, { x: centerX + 7, y: y + 7, size: 20, font: fontBold, color: rgb(0,0,0) });
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
    page.drawText(fullName, { x: decalX, y: y, size: 15, font: fontBold, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(userFunction || '', { x: decalX, y: y, size: 13, font: fontBold, color: rgb(0,0,0) });
    // Affiche le nom de la société juste sous le rôle si exposant ou staff
    if (userFunction && userData.organisation && ["exposant","staff"].includes(userFunction.toLowerCase())) {
      y -= 15;
      page.drawText(userData.organisation, { x: decalX, y: y, size: 13, font: fontBold, color: rgb(0.11,0.32,0.67) });
    }
    y -= 16;
    page.drawText(city || '', { x: decalX, y: y, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 16;
    page.drawText(`Code : ${badgeCode || ''}`, { x: decalX, y: y, size: 13, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 22;
    // Séparateur horizontal
    page.drawLine({ start: { x: decalX, y: y+8 }, end: { x: traitHFin, y: y+8 }, thickness: 1, color: rgb(0.6,0.6,0.6) });
    y -= 32;
    // 6. Texte badge nominatif et URL
    y -= 70; // remonte de 5 points
    page.drawText("BADGE nominatif personnel – Présentez-le à l'entrée", { x: decalX, y: y + 10, size: 7, font: fontRegular, color: rgb(0.2,0.2,0.2) });
    y -= 29;
    page.drawText("www.app.cnol.ma", { x: decalX, y: y + 16 + 10, size: 12, font: fontBold, color: rgb(0.2,0.2,0.2) });
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
        page.drawImage(qrImage, { x: 210, y: infoY + 318 + 5, width: 86.9, height: 86.9 });
    }
}

// Fonction principale
async function generateBadgeUnified(userData) {
    try {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        const page = pdfDoc.addPage([595, 842]); // A4

        const fontRegularBytes = await loadAsset('fontRegular', readFileBytes(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf')));
        const fontBoldBytes = await loadAsset('fontBold', readFileBytes(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf')));
        const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
        const fontBold = await pdfDoc.embedFont(fontBoldBytes);

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
        // Logo centré au-dessus des conseils d'utilisation
        const logoBytes = await loadAsset('logoImage', readFileBytes(path.join(process.cwd(), 'public', 'logo-cnol.png')));
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoWidth = 70 * 2.5;
        const logoHeight = 35 * 2.5;
        const logoX = 20 + (300 - logoWidth) / 2 - 21;
        const logoY = conseilsY + 70;
        page.drawImage(logoImage, { x: logoX, y: logoY, width: logoWidth, height: logoHeight });
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