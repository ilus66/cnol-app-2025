import { generateMinimalPdf } from '../../lib/generateBadgeUnified';

export default async function handler(req, res) {
  try {
    const pdfBuffer = await generateMinimalPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="minimal-test.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(Buffer.from(pdfBuffer));
  } catch (e) {
    res.status(500).json({ message: 'Erreur lors de la génération du PDF minimal', error: e.message });
  }
} 