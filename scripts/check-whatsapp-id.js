// Script pour vérifier l'ID 2557 dans la table whatsapp
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWhatsAppId() {
  console.log('🔍 Vérification de l\'ID 2557 dans la table whatsapp\n');

  try {
    // 1. Vérifier si l'ID 2557 existe
    const { data: contact, error } = await supabase
      .from('whatsapp')
      .select('*')
      .eq('id', 2557)
      .single();
    
    if (error) {
      console.log(`❌ ID 2557 non trouvé dans whatsapp:`, error.message);
      
      // 2. Vérifier les IDs autour de 2557
      const { data: nearbyIds } = await supabase
        .from('whatsapp')
        .select('id, nom, prenom, email, telephone')
        .gte('id', 2550)
        .lte('id', 2560)
        .order('id');
      
      console.log(`🔍 IDs autour de 2557:`);
      nearbyIds?.forEach(item => {
        console.log(`   - ID ${item.id}: ${item.nom} ${item.prenom} (${item.email || item.telephone})`);
      });
      
      // 3. Vérifier le dernier ID
      const { data: lastId } = await supabase
        .from('whatsapp')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      console.log(`📊 Dernier ID dans whatsapp: ${lastId?.[0]?.id || 'Aucun'}`);
      
      // 4. Compter le total
      const { count } = await supabase
        .from('whatsapp')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📈 Total d'enregistrements dans whatsapp: ${count}`);
      
    } else {
      console.log(`✅ ID 2557 trouvé:`, contact);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkWhatsAppId(); 