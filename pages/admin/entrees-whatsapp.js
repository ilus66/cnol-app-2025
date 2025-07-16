import { useEffect, useState } from 'react';

export default function EntreesWhatsAppAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Charger les inscrits WhatsApp à traiter
  useEffect(() => {
    fetch('/api/whatsapp/list-to-validate')
      .then(res => res.json())
      .then(data => setContacts(data.contacts || []));
  }, [refresh]);

  // Génère le message WhatsApp dynamique
  const buildWhatsappMessage = (contact, badgeUrl) => `\nBonjour ${contact.prenom} ${contact.nom},\n\nVotre badge nominatif CNOL 2025 est en pièce jointe (PDF).\n\nVous pouvez également le télécharger ici :\n${badgeUrl}\n\nPour accéder à l'application CNOL 2025 (programme, notifications, espace personnel…), téléchargez-la ici :\nhttps://www.app.cnol.ma\n\nVos identifiants d'accès :\nNuméro de téléphone : ${contact.telephone}\nCode badge : ${contact.code_badge || 'À compléter'}\n\nMerci d'imprimer ce badge et de l'apporter le jour de l'événement.\n\nÀ bientôt !\n\nSuivez CNOL sur Instagram @cnol_maroc\n`;

  // Handler pour valider et envoyer (après confirmation)
  const handleValidateAndSendConfirmed = async (contact) => {
    setLoadingId(contact.id);
    // 1. Générer le badge (API à créer si besoin)
    const badgeRes = await fetch('/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contact.id })
    });
    const badgeData = await badgeRes.json();
    if (!badgeData.success) {
      alert('Erreur génération badge');
      setLoadingId(null);
      return;
    }
    // 2. Générer le message WhatsApp
    const whatsappMessage = buildWhatsappMessage(contact, badgeData.badgeUrl);
    // 3. Envoyer via WhatsApp
    const sendRes = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact.telephone,
        text: whatsappMessage,
        documentUrl: badgeData.badgeUrl,
        fileName: `badge-${contact.nom}-${contact.prenom}.pdf`
      })
    });
    const sendData = await sendRes.json();
    if (sendData.success) {
      alert('Badge envoyé via WhatsApp !');
      // 4. Marquer comme envoyé
      await fetch('/api/whatsapp/mark-badge-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id })
      });
      setRefresh(r => !r);
    } else {
      alert('Erreur lors de l\'envoi WhatsApp');
    }
    setLoadingId(null);
    setShowPreview(false);
    setSelectedContact(null);
    setPreviewMessage('');
  };

  // Handler pour ouvrir le modal d'aperçu
  const handlePreview = async (contact) => {
    setLoadingId(contact.id);
    // Générer le badge pour obtenir l'URL (mais ne pas envoyer tout de suite)
    const badgeRes = await fetch('/api/whatsapp/generate-badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contact.id })
    });
    const badgeData = await badgeRes.json();
    if (!badgeData.success) {
      alert('Erreur génération badge');
      setLoadingId(null);
      return;
    }
    const whatsappMessage = buildWhatsappMessage(contact, badgeData.badgeUrl);
    setPreviewMessage(whatsappMessage);
    setSelectedContact(contact);
    setShowPreview(true);
    setLoadingId(null);
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
                  onClick={() => handlePreview(contact)}
                  disabled={loadingId === contact.id || contact.badge_envoye}
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
      {/* Modal d'aperçu du message WhatsApp */}
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, maxWidth: 500, width: '90%' }}>
            <h2>Aperçu du message WhatsApp</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f6f6f6', padding: 16, borderRadius: 4, maxHeight: 300, overflowY: 'auto' }}>{previewMessage}</pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowPreview(false)} style={{ padding: '6px 16px' }}>Annuler</button>
              <button onClick={() => handleValidateAndSendConfirmed(selectedContact)} style={{ padding: '6px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 4 }}>Confirmer l'envoi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 