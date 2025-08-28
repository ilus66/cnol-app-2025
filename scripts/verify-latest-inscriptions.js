// Script de vérification des derniers inscrits
// Vérifie si les inscriptions récentes figurent dans statistiques_participants

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function verifyLatestInscriptions() {
  console.log('🔍 Vérification des derniers inscrits...\n');
  
  try {
    // 1. Récupérer les 20 dernières inscriptions
    console.log('📊 Récupération des 20 dernières inscriptions...');
    const { data: latestInscriptions, error: inscriptionsError } = await supabase
      .from('inscription')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (inscriptionsError) {
      console.error('❌ Erreur récupération inscriptions:', inscriptionsError.message);
      return;
    }
    
    console.log(`   ✅ ${latestInscriptions.length} dernières inscriptions trouvées\n`);
    
    // 2. Vérifier chaque inscription dans statistiques_participants
    let found = 0;
    let missing = 0;
    const missingList = [];
    
    for (const inscription of latestInscriptions) {
      const email = normalizeEmail(inscription.email);
      const phone = normalizePhone(inscription.telephone);
      const identifiant = email || phone || `inscription_${inscription.id}`;
      
      // Rechercher dans statistiques_participants
      const { data: statsData } = await supabase
        .from('statistiques_participants')
        .select('*')
        .eq('identifiant', identifiant)
        .single();
      
      if (statsData) {
        found++;
        console.log(`   ✅ ${inscription.prenom} ${inscription.nom} (${inscription.created_at?.split('T')[0]})`);
      } else {
        missing++;
        missingList.push({
          id: inscription.id,
          nom: inscription.nom,
          prenom: inscription.prenom,
          email: inscription.email,
          telephone: inscription.telephone,
          created_at: inscription.created_at
        });
        console.log(`   ❌ ${inscription.prenom} ${inscription.nom} (${inscription.created_at?.split('T')[0]}) - MANQUANT`);
      }
    }
    
    // 3. Vérifier les 20 derniers WhatsApp
    console.log('\n📱 Vérification des 20 derniers WhatsApp...');
    const { data: latestWhatsapp, error: whatsappError } = await supabase
      .from('whatsapp')
      .select('*')
      .order('date_import', { ascending: false })
      .limit(20);
    
    if (whatsappError) {
      console.error('❌ Erreur récupération WhatsApp:', whatsappError.message);
      return;
    }
    
    console.log(`   ✅ ${latestWhatsapp.length} derniers WhatsApp trouvés\n`);
    
    let whatsappFound = 0;
    let whatsappMissing = 0;
    const whatsappMissingList = [];
    
    for (const whatsapp of latestWhatsapp) {
      const email = normalizeEmail(whatsapp.email);
      const phone = normalizePhone(whatsapp.telephone);
      const identifiant = email || phone || `whatsapp_${whatsapp.id}`;
      
      // Rechercher dans statistiques_participants
      const { data: statsData } = await supabase
        .from('statistiques_participants')
        .select('*')
        .eq('identifiant', identifiant)
        .single();
      
      if (statsData) {
        whatsappFound++;
        console.log(`   ✅ ${whatsapp.prenom} ${whatsapp.nom} (${whatsapp.date_import?.split('T')[0]})`);
      } else {
        whatsappMissing++;
        whatsappMissingList.push({
          id: whatsapp.id,
          nom: whatsapp.nom,
          prenom: whatsapp.prenom,
          email: whatsapp.email,
          telephone: whatsapp.telephone,
          date_import: whatsapp.date_import
        });
        console.log(`   ❌ ${whatsapp.prenom} ${whatsapp.nom} (${whatsapp.date_import?.split('T')[0]}) - MANQUANT`);
      }
    }
    
    // 4. Résumé final
    console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION:');
    console.log('   Inscriptions:');
    console.log(`     ✅ Trouvées: ${found}/${latestInscriptions.length}`);
    console.log(`     ❌ Manquantes: ${missing}/${latestInscriptions.length}`);
    
    console.log('   WhatsApp:');
    console.log(`     ✅ Trouvés: ${whatsappFound}/${latestWhatsapp.length}`);
    console.log(`     ❌ Manquants: ${whatsappMissing}/${latestWhatsapp.length}`);
    
    // 5. Détail des manquants
    if (missing > 0) {
      console.log('\n❌ Inscriptions manquantes dans statistiques:');
      missingList.forEach(item => {
        console.log(`   - ${item.prenom} ${item.nom} (ID: ${item.id}, ${item.created_at?.split('T')[0]})`);
      });
    }
    
    if (whatsappMissing > 0) {
      console.log('\n❌ WhatsApp manquants dans statistiques:');
      whatsappMissingList.forEach(item => {
        console.log(`   - ${item.prenom} ${item.nom} (ID: ${item.id}, ${item.date_import?.split('T')[0]})`);
      });
    }
    
    // 6. Vérification des totaux
    console.log('\n🔍 Vérification des totaux...');
    const [
      { count: inscriptionsCount },
      { count: whatsappCount },
      { count: statsCount }
    ] = await Promise.all([
      supabase.from('inscription').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp').select('*', { count: 'exact', head: true }),
      supabase.from('statistiques_participants').select('*', { count: 'exact', head: true })
    ]);
    
    console.log(`\n📊 Totaux:`);
    console.log(`   Inscriptions: ${inscriptionsCount}`);
    console.log(`   WhatsApp: ${whatsappCount}`);
    console.log(`   Statistiques: ${statsCount}`);
    
    const totalSource = (inscriptionsCount || 0) + (whatsappCount || 0);
    const difference = totalSource - (statsCount || 0);
    
    if (difference > 0) {
      console.log(`\n⚠️  Différence détectée: ${difference} participants manquants dans statistiques`);
    } else {
      console.log(`\n✅ Synchronisation parfaite!`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

verifyLatestInscriptions();
