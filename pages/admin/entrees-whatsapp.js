import { useEffect, useState } from 'react';

export default function EntreesWhatsAppAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Charger les inscrits WhatsApp à traiter
  useEffect(() => {
    fetch('/api/whatsapp/list-to-validate')
      .then(res => res.json())
      .then(data => setContacts(data.contacts || []));
  }, [refresh]);

  const handleValidateAndSend = async (contact) => {
    setLoading(true);
    // 1. Générer le badge (API à créer si besoin)
    const badgeRes = await fetch('/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contact.id })
    });
    const badgeData = await badgeRes.json();
    if (!badgeData.success) {
      alert('Erreur génération badge');
      setLoading(false);
      return;
    }
    // 2. Envoyer via WhatsApp
    const sendRes = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact.telephone,
        text: `Bonjour ${contact.prenom} ${contact.nom}, voici votre badge CNOL 2025.`,
        documentUrl: badgeData.badgeUrl,
        fileName: `badge-${contact.nom}-${contact.prenom}.pdf`
      })
    });
    const sendData = await sendRes.json();
    if (sendData.success) {
      alert('Badge envoyé via WhatsApp !');
      // 3. Marquer comme envoyé
      await fetch('/api/whatsapp/mark-badge-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id })
      });
      setRefresh(r => !r);
    } else {
      alert('Erreur lors de l\'envoi WhatsApp');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h1>Validation & Envoi badge WhatsApp</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Action</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id} style={{ background: contact.badge_envoye ? '#e0ffe0' : 'inherit' }}>
              <td>{contact.nom}</td>
              <td>{contact.prenom}</td>
              <td>{contact.telephone}</td>
              <td>
                <button
                  onClick={() => handleValidateAndSend(contact)}
                  disabled={loading || contact.badge_envoye}
                  style={{ padding: '6px 12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 4 }}
                >
                  Valider & Envoyer badge WhatsApp
                </button>
              </td>
              <td>
                {contact.badge_envoye ? 'Envoyé' : 'À traiter'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 