const { createClient } = require('@supabase/supabase-js');
// Remplace ces valeurs par tes infos Supabase
const supabase = createClient('https://otmttpiqeehfquoqycol.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM');

function normalizePhone(phone) {
  if (!phone) return '';
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('212')) p = '+' + p;
  else if (p.startsWith('0')) p = '+212' + p.slice(1);
  else if (p.startsWith('6') || p.startsWith('7')) p = '+212' + p;
  else if (!p.startsWith('+')) p = '+' + p;
  return p;
}

function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

(async () => {
  // 1. Inscrits validés
  const { data: inscrits, error: errorInscrits } = await supabase
    .from('inscription')
    .select('email, telephone, nom, prenom, fonction, ville')
    .eq('valide', true);
  if (errorInscrits) {
    console.error('Erreur récupération inscrits:', errorInscrits);
  } else {
    console.log('Inscrits récupérés:', inscrits ? inscrits.length : 0);
  }

  // 2. WhatsApp succès
  const { data: whatsappEnvois, error: errorWhatsappEnvois } = await supabase
    .from('whatsapp_envois')
    .select('telephone')
    .eq('status', 'success');
  if (errorWhatsappEnvois) {
    console.error('Erreur récupération whatsapp_envois:', errorWhatsappEnvois);
  } else {
    console.log('WhatsApp envois succès récupérés:', whatsappEnvois ? whatsappEnvois.length : 0);
  }
  const successPhones = (whatsappEnvois || []).map(e => e.telephone);

  const { data: whats, error: errorWhats } = await supabase
    .from('whatsapp')
    .select('email, telephone, nom, prenom, fonction, ville');
  if (errorWhats) {
    console.error('Erreur récupération whatsapp:', errorWhats);
  } else {
    console.log('WhatsApp users récupérés:', whats ? whats.length : 0);
  }

  const whatsFiltered = (whats || []).filter(r => successPhones.includes(r.telephone));
  console.log('WhatsApp filtrés (succès):', whatsFiltered.length);

  // 3. Fusion/déduplication
  const uniques = {};
  [...(inscrits || []), ...whatsFiltered].forEach(r => {
    const email = normalizeEmail(r.email);
    const tel = normalizePhone(r.telephone);
    const key = email || tel;
    if (!key) return;
    if (!uniques[key]) {
      uniques[key] = {
        identifiant: key,
        email: r.email,
        telephone: r.telephone,
        nom: r.nom,
        prenom: r.prenom,
        fonction: r.fonction,
        ville: r.ville,
        source: inscrits.includes(r) ? 'inscription' : 'whatsapp'
      };
    }
  });

  const rows = Object.values(uniques);
  console.log('Total à injecter:', rows.length);
  if (rows.length > 0) {
    console.log('Première entrée à injecter:', rows[0]);
  }

  // 4. Injection (batch)
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase
      .from('statistiques_participants')
      .upsert(batch, { onConflict: 'identifiant' });
    if (error) {
      console.error('Erreur d’insertion:', error);
    } else {
      console.log(`Injecté ${i + batch.length} / ${rows.length}`);
    }
  }

  console.log('Migration terminée !');
})(); 