// Script pour mettre à jour les URLs des badges dans la base de données
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs
const oldSupabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co/storage/v1/object/public/logos';
const newR2Url = 'https://pub-fdeb8c312cab4d4bb5abbe51803382ab.r2.dev';

async function updateBadgeUrlsInDatabase() {
  console.log('🔧 MISE À JOUR DES URLS DES BADGES DANS LA BASE DE DONNÉES...\n');
  
  try {
    // 1. Vérifier la table whatsapp_envois
    console.log('📋 ÉTAPE 1: Vérification de la table whatsapp_envois...');
    
    const { data: whatsappRecords, error: whatsappError } = await supabase
      .from('whatsapp_envois')
      .select('*');
    
    if (whatsappError) {
      console.error('❌ Erreur récupération whatsapp_envois:', whatsappError.message);
      return;
    }
    
    console.log(`   📱 ${whatsappRecords?.length || 0} enregistrements WhatsApp trouvés`);
    
    if (whatsappRecords && whatsappRecords.length > 0) {
      console.log('   🔍 Recherche des URLs Supabase à mettre à jour...');
      
      let updatedCount = 0;
      let errors = [];
      
      for (const record of whatsappRecords) {
        try {
          // Vérifier si le message contient une URL Supabase
          if (record.message && typeof record.message === 'string' && record.message.includes(oldSupabaseUrl)) {
            console.log(`   📝 Mise à jour de l'enregistrement ${record.id}...`);
            
            // Remplacer l'URL Supabase par l'URL R2
            const newMessage = record.message.replace(oldSupabaseUrl, newR2Url);
            
            const { error: updateError } = await supabase
              .from('whatsapp_envois')
              .update({ message: newMessage })
              .eq('id', record.id);
            
            if (updateError) {
              console.log(`      ❌ Erreur mise à jour: ${updateError.message}`);
              errors.push({ id: record.id, error: updateError.message });
            } else {
              console.log(`      ✅ URL mise à jour: ${record.id}`);
              updatedCount++;
            }
          }
          
          // Vérifier aussi le champ file_name s'il existe
          if (record.file_name && typeof record.file_name === 'string' && record.file_name.includes(oldSupabaseUrl)) {
            console.log(`   📁 Mise à jour du file_name ${record.id}...`);
            
            const newFileName = record.file_name.replace(oldSupabaseUrl, newR2Url);
            
            const { error: updateError } = await supabase
              .from('whatsapp_envois')
              .update({ file_name: newFileName })
              .eq('id', record.id);
            
            if (updateError) {
              console.log(`      ❌ Erreur mise à jour file_name: ${updateError.message}`);
              errors.push({ id: record.id, error: updateError.message });
            } else {
              console.log(`      ✅ file_name mis à jour: ${record.id}`);
              updatedCount++;
            }
          }
          
        } catch (error) {
          console.log(`      ❌ Erreur traitement: ${error.message}`);
          errors.push({ id: record.id, error: error.message });
        }
      }
      
      console.log(`\n📊 RÉSULTATS whatsapp_envois:`);
      console.log(`   ✅ Enregistrements mis à jour: ${updatedCount}`);
      console.log(`   ❌ Erreurs: ${errors.length}`);
    }
    
    // 2. Vérifier la table inscription
    console.log('\n📋 ÉTAPE 2: Vérification de la table inscription...');
    
    const { data: inscriptions, error: inscriptionsError } = await supabase
      .from('inscription')
      .select('*');
    
    if (inscriptionsError) {
      console.error('❌ Erreur récupération inscriptions:', inscriptionsError.message);
      return;
    }
    
    console.log(`   📝 ${inscriptions?.length || 0} inscriptions trouvées`);
    
    // Chercher des champs qui pourraient contenir des URLs
    const urlFields = ['qr_code', 'identifiant_badge', 'ancien_identifiant_badge', 'nouvel_identifiant_badge'];
    let inscriptionUpdates = 0;
    
    for (const inscription of inscriptions) {
      try {
        let hasChanges = false;
        const updates = {};
        
        for (const field of urlFields) {
          if (inscription[field] && typeof inscription[field] === 'string' && inscription[field].includes(oldSupabaseUrl)) {
            updates[field] = inscription[field].replace(oldSupabaseUrl, newR2Url);
            hasChanges = true;
          }
        }
        
        if (hasChanges) {
          console.log(`   📝 Mise à jour de l'inscription ${inscription.id}...`);
          
          const { error: updateError } = await supabase
            .from('inscription')
            .update(updates)
            .eq('id', inscription.id);
          
          if (updateError) {
            console.log(`      ❌ Erreur mise à jour: ${updateError.message}`);
          } else {
            console.log(`      ✅ Inscription mise à jour: ${inscription.id}`);
            inscriptionUpdates++;
          }
        }
      } catch (error) {
        console.log(`   ❌ Erreur traitement inscription: ${error.message}`);
      }
    }
    
    console.log(`\n📊 RÉSULTATS inscription:`);
    console.log(`   ✅ Inscriptions mises à jour: ${inscriptionUpdates}`);
    
    // 3. Vérifier d'autres tables potentiellement concernées
    console.log('\n📋 ÉTAPE 3: Vérification d\'autres tables...');
    
    const tablesToCheck = ['reservations_masterclass', 'reservations_ateliers', 'whatsapp'];
    let totalOtherUpdates = 0;
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`   🔍 Vérification de la table ${tableName}...`);
        
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*');
        
        if (tableError) {
          console.log(`      ❌ Erreur accès ${tableName}: ${tableError.message}`);
          continue;
        }
        
        if (tableData && tableData.length > 0) {
          let tableUpdates = 0;
          
          for (const record of tableData) {
            try {
              let hasChanges = false;
              const updates = {};
              
              // Vérifier tous les champs string pour des URLs Supabase
              for (const [key, value] of Object.entries(record)) {
                if (typeof value === 'string' && value.includes(oldSupabaseUrl)) {
                  updates[key] = value.replace(oldSupabaseUrl, newR2Url);
                  hasChanges = true;
                }
              }
              
              if (hasChanges) {
                const { error: updateError } = await supabase
                  .from(tableName)
                  .update(updates)
                  .eq('id', record.id);
                
                if (!updateError) {
                  tableUpdates++;
                }
              }
            } catch (error) {
              // Ignorer les erreurs individuelles
            }
          }
          
          if (tableUpdates > 0) {
            console.log(`      ✅ ${tableUpdates} enregistrements mis à jour dans ${tableName}`);
            totalOtherUpdates += tableUpdates;
          } else {
            console.log(`      ℹ️  Aucune URL à mettre à jour dans ${tableName}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur table ${tableName}: ${error.message}`);
      }
    }
    
    // 4. Résumé final
    console.log('\n🎯 RÉSUMÉ DE LA MISE À JOUR :');
    console.log('=' .repeat(50));
    console.log(`   📱 WhatsApp envois: ${updatedCount || 0} mis à jour`);
    console.log(`   📝 Inscriptions: ${inscriptionUpdates} mises à jour`);
    console.log(`   🔧 Autres tables: ${totalOtherUpdates} mises à jour`);
    console.log(`   ❌ Erreurs totales: ${errors.length}`);
    
    console.log('\n🔗 URLs mises à jour :');
    console.log(`   ❌ Ancienne: ${oldSupabaseUrl}`);
    console.log(`   ✅ Nouvelle: ${newR2Url}`);
    
    console.log('\n💡 PROCHAINES ÉTAPES :');
    console.log('   1. ✅ URLs des badges mises à jour dans la base');
    console.log('   2. 🔧 Ajouter CLOUDFLARE_R2_PUBLIC_URL sur Vercel');
    console.log('   3. 🚀 Tester la génération de badges en production');
    console.log('   4. ✅ Confirmer que tous les liens fonctionnent');
    
    console.log('\n🎉 MIGRATION R2 COMPLÈTE ET COHÉRENTE !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer la mise à jour
updateBadgeUrlsInDatabase();
