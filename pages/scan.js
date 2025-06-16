import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const QRCodeScanner = dynamic(() => import('../components/QRCodeScanner'), { ssr: false });

export default function ScanPage() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const handleScan = async (decoded) => {
    setResult(decoded);
    setStatus({ type: 'loading', message: 'Vérification en cours...' });

    if (!decoded.startsWith('cnol2025-')) {
      playErrorSound();
      return setStatus({ type: 'error', message: 'QR Code non reconnu.' });
    }

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: decoded }),
      });

      const json = await res.json();

      if (res.ok) {
        const fullName = `${json.prenom || ''} ${json.nom || ''}`.trim();

        if (json.deja) {
          playWarningSound();
          setStatus({ type: 'warning', message: `Déjà scanné : ${fullName}` });
        } else {
          playSuccessSound();
          setStatus({ type: 'success', message: `✅ Scan validé : ${fullName}` });
        }

        setHistory(prev => [{ code: decoded, name: fullName, time: new Date() }, ...prev.slice(0, 9)]);
      } else {
        playErrorSound();
        setStatus({ type: 'error', message: json.message });
      }
    } catch (err) {
      playErrorSound();
      setStatus({ type: 'error', message: 'Erreur lors de la requête.' });
    }
  };

  const resetScanner = () => {
    setResult(null);
    setStatus(null);
  };

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play();
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const playWarningSound = () => {
    const audio = new Audio('/sounds/warning.mp3');
    audio.play();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  const playErrorSound = () => {
    const audio = new Audio('/sounds/error.mp3');
    audio.play();
    if (navigator.vibrate) navigator.vibrate([200]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Scanner QR Code</h1>

      <QRCodeScanner
        onScanSuccess={handleScan}
        onScanError={(err) => setStatus({ type: 'error', message: err })}
      />

      {status && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          borderRadius: '8px',
          backgroundColor:
            status.type === 'success' ? '#d1fae5' :
            status.type === 'warning' ? '#fef3c7' :
            '#fee2e2',
          color:
            status.type === 'success' ? '#065f46' :
            status.type === 'warning' ? '#92400e' :
            '#991b1b',
        }}>
          {status.message}
        </div>
      )}

      {result && (
        <button
          onClick={resetScanner}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Réinitialiser
        </button>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Derniers scans</h2>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>
                <strong>{entry.name}</strong> – {entry.code} à {entry.time.toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
