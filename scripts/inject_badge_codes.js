const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// À compléter avec tes infos Supabase
const supabase = createClient('https://otmttpiqeehfquoqycol.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM');

const inputFile = path.join(__dirname, '../badges_extraits.csv');
const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n').filter(Boolean);
const header = lines[0].split(',');
const telIdx = header.indexOf('telephone');
const codeIdx = header.indexOf('identifiant_badge');

(async () => {
  let updated = 0, skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(s => s.replace(/"/g, '').trim());
    const telephone = cols[telIdx];
    const code = cols[codeIdx];
    if (!telephone || !code) continue;
    // Vérifier si identifiant_badge est déjà renseigné
    const { data, error } = await supabase
      .from('whatsapp')
      .select('id, identifiant_badge')
      .eq('telephone', telephone)
      .maybeSingle();
    if (error || !data) { skipped++; continue; }
    if (data.identifiant_badge && data.identifiant_badge.trim() !== '') {
      skipped++;
      continue;
    }
    // Mettre à jour
    const { error: updateError } = await supabase
      .from('whatsapp')
      .update({ identifiant_badge: code })
      .eq('id', data.id);
    if (!updateError) updated++;
  }
  console.log(`Injection terminée. ${updated} lignes mises à jour, ${skipped} ignorées (déjà remplies ou non trouvées).`);
})(); 