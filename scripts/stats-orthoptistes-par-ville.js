// Script pour afficher les statistiques des orthoptistes par ville

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getOrthoptistesByCity() {
  console.log('👁️ Statistiques des orthoptistes par ville...\n');
  
  try {
    // Récupérer tous les orthoptistes
    const { data: orthoptistes, error } = await supabase
      .from('statistiques_participants')
      .select('ville')
      .ilike('fonction', '%orthopt%');
    
    if (error) {
      console.error('❌ Erreur récupération orthoptistes:', error.message);
      return;
    }
    
    // Compter par ville
    const cityCounts = {};
    orthoptistes.forEach(record => {
      const city = record.ville || 'Non renseigné';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    // Afficher les résultats triés par nombre
    console.log('📊 Orthoptistes par ville:');
    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count}`);
      });
    
    const total = orthoptistes.length;
    console.log(`\n🎯 Total orthoptistes: ${total}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

getOrthoptistesByCity();
