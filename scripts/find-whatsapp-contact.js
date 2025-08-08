// Script pour trouver le contact WhatsApp le plus proche de l'ID 2557
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findWhatsAppContact() {
  console.log('🔍 Recherche du contact WhatsApp le plus proche de l\'ID 2557\n');

  try {
    // 1. Chercher dans une plage large autour de 2557
    const { data: nearbyContacts } = await supabase
      .from('whatsapp')
      .select('id, nom, prenom, email, telephone, date_import')
      .gte('id', 2500)
      .lte('id', 2600)
      .order('id');
    
    if (nearbyContacts && nearbyContacts.length > 0) {
      console.log(`📊 Contacts trouvés entre 2500 et 2600:`);
      nearbyContacts.forEach(contact => {
        const distance = Math.abs(contact.id - 2557);
        console.log(`   - ID ${contact.id} (distance: ${distance}): ${contact.nom} ${contact.prenom} (${contact.email || contact.telephone}) - ${contact.date_import}`);
      });
      
      // Trouver le plus proche
      const closest = nearbyContacts.reduce((prev, curr) => {
        const prevDistance = Math.abs(prev.id - 2557);
        const currDistance = Math.abs(curr.id - 2557);
        return currDistance < prevDistance ? curr : prev;
      });
      
      console.log(`\n🎯 Contact le plus proche de 2557:`);
      console.log(`   - ID ${closest.id} (distance: ${Math.abs(closest.id - 2557)}): ${closest.nom} ${closest.prenom}`);
      
    } else {
      console.log(`❌ Aucun contact trouvé entre 2500 et 2600`);
      
      // 2. Chercher les derniers contacts ajoutés
      const { data: recentContacts } = await supabase
        .from('whatsapp')
        .select('id, nom, prenom, email, telephone, date_import')
        .order('date_import', { ascending: false })
        .limit(10);
      
      if (recentContacts && recentContacts.length > 0) {
        console.log(`\n📅 10 derniers contacts ajoutés:`);
        recentContacts.forEach(contact => {
          console.log(`   - ID ${contact.id}: ${contact.nom} ${contact.prenom} (${contact.email || contact.telephone}) - ${contact.date_import}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error.message);
  }
}

findWhatsAppContact(); 