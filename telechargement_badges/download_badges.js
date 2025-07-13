const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Remplace ici par tes infos :
const supabaseUrl = ' https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';
const bucket = 'badges'; // adapte si ton bucket a un autre nom
const outputDir = './badges';

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadAllBadges() {
  const { data, error } = await supabase.storage.from(bucket).list('', { limit: 10000 });
  if (error) throw error;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  for (const file of data) {
    if (!file.name.endsWith('.pdf')) continue; // on ne télécharge que les PDF
    const { data: fileData, error: fileError } = await supabase.storage.from(bucket).download(file.name);
    if (fileError) {
      console.error('Erreur sur', file.name, fileError);
      continue;
    }
    const filePath = path.join(outputDir, file.name);
    fs.writeFileSync(filePath, Buffer.from(await fileData.arrayBuffer()));
    console.log('Téléchargé:', file.name);
  }
}

downloadAllBadges();