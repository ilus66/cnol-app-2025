const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const API_URL = 'https://cnol-2025.vercel.app/api/validate';
const SUPABASE_URL = 'https://otmttpiqeehfquoqycol.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getNonValidatedInscriptions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/inscription?valide=eq.false`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  });
  return await res.json();
}

async function validateInscription(id) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: `cnol2025-${id}` })
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Inscription ${id} validée et email/WhatsApp envoyés`);
  } else {
    console.error(`❌ Erreur validation ${id}:`, data.message || data.error);
  }
}

async function getState() {
  const { data } = await supabase
    .from('bulk_validate_state')
    .select('running')
    .eq('id', 1)
    .single();
  return { running: data?.running || false };
}

async function setState(state) {
  await supabase
    .from('bulk_validate_state')
    .update({ running: state.running, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

async function main() {
  await setState({ running: true });
  const inscriptions = await getNonValidatedInscriptions();
  console.log('Inscriptions à valider:', inscriptions.length, inscriptions);
  for (const inscrit of inscriptions) {
    const state = await getState();
    console.log('État courant:', state);
    if (!state.running) {
      console.log('⏸️ Script mis en pause.');
      break;
    }
    try {
      await validateInscription(inscrit.id);
    } catch (err) {
      console.error('Erreur lors de la validation de', inscrit.id, err);
    }
    console.log('⏳ Attente 90 secondes avant le prochain...');
    await new Promise(r => setTimeout(r, 90000));
  }
  await setState({ running: false });
  console.log('🎉 Toutes les inscriptions ont été traitées ou script mis en pause !');
}

if (require.main === module) {
  main();
} 
