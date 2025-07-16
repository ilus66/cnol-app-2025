const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Remplace par l'URL de ton projet Supabase
const SUPABASE_URL = 'https://otmttpiqeehfquoqycol.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // Crée un buffer PDF fictif (ou charge un vrai PDF si tu veux)
  const fakePdfBuffer = Buffer.from('%PDF-1.4\n%Fake PDF for test\n', 'utf-8');
  const fileName = `test-upload-badge-${Date.now()}.pdf`;

  console.log('Tentative d\'upload dans le bucket logos...');
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(fileName, fakePdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });
  if (error) {
    console.error('Erreur upload:', error);
  } else {
    console.log('Upload réussi !', data);
    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
    console.log('URL publique:', publicUrlData?.publicUrl);
  }
}

main(); 