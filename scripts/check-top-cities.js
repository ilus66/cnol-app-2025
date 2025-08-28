// Script pour vérifier les chiffres des principales villes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopCities() {
  console.log('📊 Vérification des principales villes...\n');
  
  try {
    const cities = ['RABAT', 'CASABLANCA', 'MARRAKECH', 'SALÉ', 'AGADIR', 'KENITRA', 'TEMARA', 'TANGER', 'FES', 'MEKNES'];
    
    for (const city of cities) {
      const { data, error } = await supabase
        .from('statistiques_participants')
        .select('ville')
        .eq('ville', city);
      
      if (error) {
        console.error(`❌ Erreur pour ${city}:`, error.message);
      } else {
        console.log(`   ${city}: ${data?.length || 0}`);
      }
    }
    
    console.log('\n✅ Vérification terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkTopCities();
