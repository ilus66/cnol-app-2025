import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Récupérer toutes les données
    const { data: scans } = await supabaseAdmin
      .from('leads')
      .select(`
        *,
        exposant:exposants(nom)
      `)
      .order('created_at', { ascending: false });

    const { data: exposants } = await supabaseAdmin
      .from('exposants')
      .select('*')
      .order('nom');

    // Créer le PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    // Titre
    page.drawText('Rapport Global - CNOL 2025', {
      x: 50, y, size: 20, font: fontBold, color: rgb(0, 0, 0)
    });
    y -= 40;

    // Date du rapport
    page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 50, y, size: 12, font: fontRegular, color: rgb(0.5, 0.5, 0.5)
    });
    y -= 30;

    // Statistiques globales
    page.drawText('Statistiques Globales', {
      x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0)
    });
    y -= 25;

    const totalScans = scans?.length || 0;
    const totalExposants = exposants?.length || 0;
    const exposantsActifs = [...new Set(scans?.map(s => s.exposant_id) || [])].length;

    page.drawText(`Total scans : ${totalScans}`, { x: 50, y, size: 12, font: fontRegular });
    y -= 20;
    page.drawText(`Total exposants : ${totalExposants}`, { x: 50, y, size: 12, font: fontRegular });
    y -= 20;
    page.drawText(`Exposants actifs : ${exposantsActifs}`, { x: 50, y, size: 12, font: fontRegular });
    y -= 30;

    // Classement des exposants
    page.drawText('Classement des Exposants', {
      x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0)
    });
    y -= 25;

    // Calculer le classement
    const classement = {};
    scans?.forEach(scan => {
      const nom = scan.exposant?.nom || 'Inconnu';
      classement[nom] = (classement[nom] || 0) + 1;
    });

    const classementTrié = Object.entries(classement)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10

    classementTrié.forEach(([nom, count], index) => {
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }
      
      page.drawText(`${index + 1}. ${nom} : ${count} scans`, {
        x: 50, y, size: 12, font: fontRegular
      });
      y -= 20;
    });

    y -= 20;

    // Détails par exposant
    page.drawText('Détails par Exposant', {
      x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0)
    });
    y -= 25;

    exposants?.forEach(exp => {
      if (y < 150) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      const scansExposant = scans?.filter(s => s.exposant_id === exp.id) || [];
      
      page.drawText(`${exp.nom}`, {
        x: 50, y, size: 14, font: fontBold
      });
      y -= 20;
      
      page.drawText(`  - Email : ${exp.email_responsable}`, {
        x: 50, y, size: 10, font: fontRegular
      });
      y -= 15;
      
      page.drawText(`  - Scans : ${scansExposant.length}`, {
        x: 50, y, size: 10, font: fontRegular
      });
      y -= 15;
      
      if (exp.description) {
        page.drawText(`  - Description : ${exp.description.substring(0, 50)}...`, {
          x: 50, y, size: 10, font: fontRegular
        });
        y -= 15;
      }
      
      y -= 10;
    });

    // Générer le PDF
    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-global-cnol-${new Date().toISOString().slice(0, 10)}.pdf"`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Erreur génération rapport:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
  }
} 