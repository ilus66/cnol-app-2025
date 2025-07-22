import { supabase } from '../../lib/supabaseClient';
import { stringify } from 'csv-stringify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const [inscriptionRes, whatsappRes] = await Promise.all([
      supabase.from('inscription').select('*'),
      supabase.from('whatsapp').select('*')
    ]);

    if (inscriptionRes.error) throw inscriptionRes.error;
    if (whatsappRes.error) throw whatsappRes.error;

    const inscriptionsData = (inscriptionRes.data || []).map(item => ({ ...item, source: 'Inscription' }));
    const whatsappData = (whatsappRes.data || []).map(item => ({ ...item, source: 'WhatsApp' }));
    const combinedData = [...inscriptionsData, ...whatsappData];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inscriptions.csv"');

    const stringifier = stringify({ header: true });
    stringifier.pipe(res);

    combinedData.forEach(row => {
      stringifier.write(row);
    });

    stringifier.end();

  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du CSV', error: error.message });
  }
}