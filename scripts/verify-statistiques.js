// Script de vérification pour diagnostiquer la synchro statistiques_participants
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStatistiques() {
  console.log('🔍 Vérification de la synchro statistiques_participants\n');

  try {
    // 1. Compter les inscriptions
    const { count: inscriptionCount } = await supabase
      .from('inscription')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Inscriptions totales: ${inscriptionCount}`);

    // 2. Compter les WhatsApp
    const { count: whatsappCount } = await supabase
      .from('whatsapp')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📱 WhatsApp totales: ${whatsappCount}`);

    // 3. Compter les statistiques_participants
    const { count: statsCount } = await supabase
      .from('statistiques_participants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Statistiques_participants: ${statsCount}`);

    // 4. Vérifier les doublons potentiels
    const { data: statsData } = await supabase
      .from('statistiques_participants')
      .select('identifiant')
      .limit(10);
    
    console.log(`🔍 Exemples d'identifiants dans stats:`, statsData?.map(s => s.identifiant));

    // 5. Vérifier les inscriptions récentes
    const { data: recentInscriptions } = await supabase
      .from('inscription')
      .select('id, nom, prenom, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`🆕 5 inscriptions les plus récentes:`);
    recentInscriptions?.forEach(ins => {
      console.log(`   - ${ins.nom} ${ins.prenom} (${ins.email}) - ${ins.created_at}`);
    });

    // 6. Vérifier si ces inscriptions récentes sont dans stats
    if (recentInscriptions) {
      for (const ins of recentInscriptions) {
        const identifiant = ins.email?.toLowerCase().trim() || `phone_${ins.id}`;
        const { data: existing } = await supabase
          .from('statistiques_participants')
          .select('id')
          .eq('identifiant', identifiant)
          .limit(1);
        
        if (!existing || existing.length === 0) {
          console.log(`❌ Inscription manquante dans stats: ${ins.nom} ${ins.prenom} (${identifiant})`);
        } else {
          console.log(`✅ Inscription présente dans stats: ${ins.nom} ${ins.prenom}`);
        }
      }
    }

    // 7. Calculer la différence
    const totalExpected = (inscriptionCount || 0) + (whatsappCount || 0);
    const difference = totalExpected - (statsCount || 0);
    
    console.log(`\n📊 Résumé:`);
    console.log(`   - Inscriptions: ${inscriptionCount}`);
    console.log(`   - WhatsApp: ${whatsappCount}`);
    console.log(`   - Total attendu: ${totalExpected}`);
    console.log(`   - Statistiques actuelles: ${statsCount}`);
    console.log(`   - Différence: ${difference}`);

    if (difference > 0) {
      console.log(`\n⚠️  Il manque ${difference} enregistrements dans statistiques_participants`);
      console.log(`💡 Relance le script de backfill ou vérifie les permissions`);
    } else {
      console.log(`\n✅ Synchronisation OK !`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

verifyStatistiques(); 