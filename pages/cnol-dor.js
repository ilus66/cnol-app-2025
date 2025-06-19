import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CnolDorHome() {
  return (
    <div style={styles.container}>
      <div style={styles.contentBox}>
        <h1 style={styles.title}>CNOL d'Or 2025</h1>
        <p style={styles.intro}>
          Les CNOL d'Or récompensent les opticiens et vitrines les plus remarquables.<br />
          Sélectionnez la catégorie pour candidater.
        </p>
        <div style={styles.buttonGroup}>
          <a href="/cnol-dor/opticien" style={styles.button}>Candidater Opticien de l'année</a>
          <a href="/cnol-dor/vitrine" style={styles.button}>Candidater Meilleure vitrine</a>
        </div>
        <div style={styles.datesBox}>
          <p>📅 Clôture des candidatures : 15 septembre 2025</p>
          <p>📍 Remise des trophées : 12 octobre 2025 à Rabat</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #0d47a1, #1976d2)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 1rem',
  },
  contentBox: {
    maxWidth: 600,
    width: '100%',
    textAlign: 'center',
    marginTop: 48,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  intro: {
    fontSize: '1.1rem',
    marginBottom: 24,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#fff',
    color: '#0d47a1',
    padding: '12px 24px',
    borderRadius: 6,
    fontWeight: 'bold',
    border: 'none',
    fontSize: '1rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: '0.2s',
  },
  datesBox: {
    marginTop: 24,
    fontSize: '1.1rem',
  },
}; 