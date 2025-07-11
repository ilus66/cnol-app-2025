import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { to, text, documentUrl, fileName } = req.body;
  const apiKey = '110f5e951d8effdf46eb4e3ddce932b5b3f48f4d31c9992e30d5c25e3ad4c030'; // Remplace par ta clé API valide

  try {
    console.log('Wasender: tentative envoi', { to, text, documentUrl, fileName });
    const response = await fetch('https://wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, text, documentUrl, fileName })
    });
    const data = await response.json();
    console.log('Wasender response:', JSON.stringify(data));
    console.log('Wasender status:', response.status, response.statusText);
    if (!response.ok) {
      console.error('Wasender error:', data);
      throw new Error(data.error || data.message || JSON.stringify(data) || 'Erreur Wasender');
    }
    console.log('Wasender: envoi terminé');
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Erreur send-whatsapp:', err);
    res.status(500).json({ error: err.message, debug: err });
  }
} 
