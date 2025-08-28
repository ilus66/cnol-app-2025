// Script de nettoyage et uniformisation des noms de villes
// Uniformise les variations d'orthographe et supprime les doublons

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping des variations de noms de villes vers les noms standardisés
const cityMapping = {
  // Variations RABAT
  'RABAT': 'RABAT',
  'SALE': 'RABAT',
  
  // SALÉ reste SALÉ (ville distincte)
  'SALÉ': 'SALÉ',
  
  // SALA AL JADIDA reste SALA AL JADIDA (ville distincte)
  'SALA AL JADIDA': 'SALA AL JADIDA',
  
  // Variations CASABLANCA
  'CASABLANCA': 'CASABLANCA',
  'CASA': 'CASABLANCA',
  
  // Variations MARRAKECH
  'MARRAKECH': 'MARRAKECH',
  'MARRAKESH': 'MARRAKECH',
  
  // Variations AGADIR
  'AGADIR': 'AGADIR',
  
  // Variations KENITRA
  'KENITRA': 'KENITRA',
  'KÉNITRA': 'KENITRA',
  
  // Variations TEMARA
  'TEMARA': 'TEMARA',
  'SKHIRATE-TÉMARA': 'TEMARA',
  
  // Variations TANGER
  'TANGER': 'TANGER',
  'TANGA': 'TANGER',
  
  // Variations FES
  'FES': 'FES',
  'FEZ': 'FES',
  
  // Variations MEKNES
  'MEKNES': 'MEKNES',
  'MEKNÈS': 'MEKNES',
  
  // Variations EL JADIDA
  'EL JADIDA': 'EL JADIDA',
  'EL JADID': 'EL JADIDA',
  
  // Variations OUJDA
  'OUJDA': 'OUJDA',
  'OUJDAH': 'OUJDA',
  
  // Variations MOHAMMEDIA
  'MOHAMMEDIA': 'MOHAMMEDIA',
  'MOHAMMADIA': 'MOHAMMEDIA',
  
  // Variations TETOUAN
  'TETOUAN': 'TETOUAN',
  'TETUAN': 'TETOUAN',
  
  // Variations TIZNIT
  'TIZNIT': 'TIZNIT',
  
  // Variations KHEMISSET
  'KHEMISSET': 'KHEMISSET',
  
  // Variations INZEGANE
  'INZEGANE': 'INZEGANE',
  'INZEGAN': 'INZEGANE',
  
  // Variations BENI MELLAL
  'BENI MELLAL': 'BENI MELLAL',
  'BENI-MELLAL': 'BENI MELLAL',
  
  // Variations TAROUDANT
  'TAROUDANT': 'TAROUDANT',
  'TAROUDAN': 'TAROUDANT',
  
  // Variations AIT MELLOUL
  'AIT MELLOUL': 'AIT MELLOUL',
  'AIT-MELLOUL': 'AIT MELLOUL',
  
  // Variations KHENIFRA
  'KHENIFRA': 'KHENIFRA',
  
  // Variations GUELMIM
  'GUELMIM': 'GUELMIM',
  
  // Variations LAAYOUNE
  'LAAYOUNE': 'LAAYOUNE',
  'LAÂYOUNE': 'LAAYOUNE',
  
  // Variations LARACHE
  'LARACHE': 'LARACHE',
  'EL ARAICH': 'LARACHE',
  
  // Variations TIFLET
  'TIFLET': 'TIFLET',
  
  // Variations BERRECHID
  'BERRECHID': 'BERRECHID',
  'BER RECHID': 'BERRECHID',
  
  // Variations SETTAT
  'SETTAT': 'SETTAT',
  
  // Variations ESSAOUIRA
  'ESSAOUIRA': 'ESSAOUIRA',
  'ESSAOUIR': 'ESSAOUIRA',
  
  // Variations SAFI
  'SAFI': 'SAFI',
  
  // Variations BERKANE
  'BERKANE': 'BERKANE',
  
  // Variations SKHIRAT
  'SKHIRAT': 'SKHIRAT',
  'SKHIRATE': 'SKHIRAT',
  
  // Variations BIOUGRA
  'BIOUGRA': 'BIOUGRA',
  
  // Variations OULED TEIMA
  'OULED TEIMA': 'OULED TEIMA',
  'OULED-TEIMA': 'OULED TEIMA',
  
  // Variations KHOURIBGA
  'KHOURIBGA': 'KHOURIBGA',
  'KHOURIBGHA': 'KHOURIBGA',
  
  // Variations BOUZNIKA
  'BOUZNIKA': 'BOUZNIKA',
  
  // Variations GUERCIF
  'GUERCIF': 'GUERCIF',
  
  // Variations TAZA
  'TAZA': 'TAZA',
  
  // Variations KSAR EL KEBIR
  'KSAR EL KEBIR': 'KSAR EL KEBIR',
  'KSAR-EL-KEBIR': 'KSAR EL KEBIR',
  
  // Variations BENGUERIR
  'BENGUERIR': 'BENGUERIR',
  'BENGUIRIR': 'BENGUERIR',
  
  // Variations ERRACHIDIA
  'ERRACHIDIA': 'ERRACHIDIA',
  'ER-RACHIDIA': 'ERRACHIDIA',
  
  // Variations NADOR
  'NADOR': 'NADOR',
  
  // Variations EL KELAA DE SRAGHNA
  'EL KELAA DE SRAGHNA': 'EL KELAA DE SRAGHNA',
  'EL KELAA DES SRAGHNA': 'EL KELAA DE SRAGHNA',
  
  // Variations OUAZZANE
  'OUAZZANE': 'OUAZZANE',
  
  // Variations TINGHIR
  'TINGHIR': 'TINGHIR',
  
  // Variations BOUSKOURA
  'BOUSKOURA': 'BOUSKOURA',
  'BOUSKOUR': 'BOUSKOURA',
  
  // Variations TAN-TAN
  'TAN-TAN': 'TAN-TAN',
  'TANTAN': 'TAN-TAN',
  
  // Variations SIDI SLIMANE
  'SIDI SLIMANE': 'SIDI SLIMANE',
  'SIDI-SLIMANE': 'SIDI SLIMANE',
  
  // Variations SIDI KACEM
  'SIDI KACEM': 'SIDI KACEM',
  'SIDI-KACEM': 'SIDI KACEM',
  
  // Variations TAOUNATE
  'TAOUNATE': 'TAOUNATE',
  
  // Variations SEFROU
  'SEFROU': 'SEFROU',
  
  // Variations MIDELT
  'MIDELT': 'MIDELT',
  
  // Variations FKIH BEN SALAH
  'FKIH BEN SALAH': 'FKIH BEN SALAH',
  'FKIH-BEN-SALAH': 'FKIH BEN SALAH',
  
  // Variations YOUSSOUFIA
  'YOUSSOUFIA': 'YOUSSOUFIA',
  
  // Variations MEKNÈS
  'MEKNÈS': 'MEKNES',
  
  // Variations BENSLIMAN
  'BENSLIMAN': 'BENSLIMAN',
  'BEN SLIMAN': 'BENSLIMAN',
  
  // Variations TAMENSOURT
  'TAMENSOURT': 'TAMENSOURT',
  
  // Variations OUED ZEM
  'OUED ZEM': 'OUED ZEM',
  'OUED-ZEM': 'OUED ZEM',
  
  // Variations DAKAR
  'DAKAR': 'DAKAR',
  
  // Variations ALGER
  'ALGER': 'ALGER',
  
  // Variations ZAGORA
  'ZAGORA': 'ZAGORA',
  
  // Variations TAOURIRT
  'TAOURIRT': 'TAOURIRT',
  
  // Variations DOHA
  'DOHA': 'DOHA',
  
  // Variations SEMARA
  'SEMARA': 'SEMARA',
  
  // Variations ER-RICH
  'ER-RICH': 'ER-RICH',
  
  // Variations TAMESNA
  'TAMESNA': 'TAMESNA',
  
  // Variations AL HOCEIMA
  'AL HOCEIMA': 'AL HOCEIMA',
  'AL-HOCEIMA': 'AL HOCEIMA',
  
  // Variations SIDI ALLAL EL BAHRAOUI
  'SIDI ALLAL EL BAHRAOUI': 'SIDI ALLAL EL BAHRAOUI',
  'SIDI-ALLAL-EL-BAHRAOUI': 'SIDI ALLAL EL BAHRAOUI',
  
  // Variations SIDI YAHYA EL GHARB
  'SIDI YAHYA EL GHARB': 'SIDI YAHYA EL GHARB',
  'SIDI-YAHYA-EL-GHARB': 'SIDI YAHYA EL GHARB',
  
  // Variations IMINTANOUT
  'IMINTANOUT': 'IMINTANOUT',
  
  // Variations MARTIL
  'MARTIL': 'MARTIL',
  
  // Variations BIR JDID
  'BIR JDID': 'BIR JDID',
  'BIR-JDID': 'BIR JDID',
  
  // Variations ELATTAOUIA
  'ELATTAOUIA': 'ELATTAOUIA',
  
  // Variations TITMELLIL
  'TITMELLIL': 'TITMELLIL',
  
  // Variations AIT OURIR
  'AIT OURIR': 'AIT OURIR',
  'AIT-OURIR': 'AIT OURIR',
  
  // Variations IFRANE
  'IFRANE': 'IFRANE',
  
  // Variations KPALIMÉ
  'KPALIMÉ': 'KPALIMÉ',
  
  // Variations JERADA
  'JERADA': 'JERADA',
  
  // Variations AGOURAI
  'AGOURAI': 'AGOURAI',
  
  // Variations DAKHLA
  'DAKHLA': 'DAKHLA',
  
  // Variations KELAAT M'GOUNA
  'KELAAT M\'GOUNA': 'KELAAT M\'GOUNA',
  'KELAAT MGOUNA': 'KELAAT M\'GOUNA',
  
  // Variations MDIQ
  'MDIQ': 'MDIQ',
  
  // Variations OUARZAZATE
  'OUARZAZATE': 'OUARZAZATE',
  
  // Variations TAMELLALET
  'TAMELLALET': 'TAMELLALET',
  
  // Variations ERFOUD
  'ERFOUD': 'ERFOUD',
  
  // Variations BOUJDOUR
  'BOUJDOUR': 'BOUJDOUR',
  
  // Variations CHICHAOUA
  'CHICHAOUA': 'CHICHAOUA',
  
  // Variations ORAN
  'ORAN': 'ORAN',
  
  // Variations TAHENAOUT
  'TAHENAOUT': 'TAHENAOUT',
  
  // Variations ESPAGNE
  'ESPAGNE': 'ESPAGNE',
  
  // Variations MISSOUR
  'MISSOUR': 'MISSOUR',
  
  // Variations AZROU
  'AZROU': 'AZROU',
  
  // Variations WURTZBOURG
  'WURTZBOURG': 'WURTZBOURG',
  
  // Variations RISSANI
  'RISSANI': 'RISSANI',
  
  // Variations ZAIO
  'ZAIO': 'ZAIO',
  
  // Variations CHILLY MAZARIN
  'CHILLY MAZARIN': 'CHILLY MAZARIN',
  
  // Variations BEJAAD
  'BEJAAD': 'BEJAAD',
  
  // Variations DEROUA
  'DEROUA': 'DEROUA',
  
  // Variations AIN ATIQ
  'AIN ATIQ': 'AIN ATIQ',
  'AIN-ATIQ': 'AIN ATIQ',
  
  // Variations OUAGADOUGOU
  'OUAGADOUGOU': 'OUAGADOUGOU',
  'OUAGADOUGOU BURKINA FASO': 'OUAGADOUGOU',
  
  // Variations ELHAJEB
  'ELHAJEB': 'ELHAJEB',
  'EL HAJEB': 'ELHAJEB',
  
  // Variations BEN AHMED
  'BEN AHMED': 'BEN AHMED',
  'BEN-AHMED': 'BEN AHMED',
  
  // Variations SIDI BENNOUR
  'SIDI BENNOUR': 'SIDI BENNOUR',
  'SIDI-BENNOUR': 'SIDI BENNOUR',
  
  // Variations GOMEL
  'GOMEL': 'GOMEL',
  
  // Variations AOULOUZ
  'AOULOUZ': 'AOULOUZ',
  
  // Variations SOUK LARBAA
  'SOUK LARBAA': 'SOUK LARBAA',
  'SOUK-LARBAA': 'SOUK LARBAA',
  
  // Variations SKHOUR RHAMNA
  'SKHOUR RHAMNA': 'SKHOUR RHAMNA',
  'SKHOUR-RHAMNA': 'SKHOUR RHAMNA',
  
  // Variations BOUKNADEL
  'BOUKNADEL': 'BOUKNADEL',
  
  // Variations PARIS
  'PARIS': 'PARIS',
  
  // Variations BANGUI RÉPUBLIQUE CENTRAFRICAINE
  'BANGUI RÉPUBLIQUE CENTRAFRICAINE': 'BANGUI RÉPUBLIQUE CENTRAFRICAINE',
  
  // Variations AIN TAOUJDAT
  'AIN TAOUJDAT': 'AIN TAOUJDAT',
  'AIN-TAOUJDAT': 'AIN TAOUJDAT',
  
  // Variations SIDI IFNI
  'SIDI IFNI': 'SIDI IFNI',
  'SIDI-IFNI': 'SIDI IFNI',
  
  // Variations FNIDEQ
  'FNIDEQ': 'FNIDEQ',
  
  // Variations MOULAY BOUSSELHAM
  'MOULAY BOUSSELHAM': 'MOULAY BOUSSELHAM',
  'MOULAY-BOUSSELHAM': 'MOULAY BOUSSELHAM',
  
  // Valeurs NULL ou vides
  'NULL': null,
  '': null,
  'OPTICIEN': null,
  'ORTHOPTISTE': null
};

function normalizeCityName(cityName) {
  if (!cityName) return null;
  
  const normalized = cityName.trim().toUpperCase();
  return cityMapping[normalized] || normalized;
}

async function cleanCities() {
  console.log('🧹 Début du nettoyage des noms de villes...\n');
  
  let totalUpdated = 0;
  let errors = 0;
  
  try {
    // 1. Récupérer toutes les villes uniques actuelles
    console.log('📊 Récupération des villes actuelles...');
    const { data: cities, error } = await supabase
      .from('statistiques_participants')
      .select('id, ville')
      .not('ville', 'is', null);
    
    if (error) {
      console.error('❌ Erreur récupération villes:', error.message);
      return;
    }
    
    console.log(`   ✅ ${cities.length} enregistrements avec ville trouvés\n`);
    
    // 2. Traiter chaque ville
    for (const record of cities) {
      try {
        const oldCity = record.ville;
        const newCity = normalizeCityName(oldCity);
        
        if (newCity !== oldCity) {
          const { error: updateError } = await supabase
            .from('statistiques_participants')
            .update({ ville: newCity })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`❌ Erreur mise à jour ville ${record.id}:`, updateError.message);
            errors++;
          } else {
            totalUpdated++;
            console.log(`   🔄 ${oldCity} → ${newCity}`);
          }
        }
      } catch (e) {
        console.error(`❌ Erreur traitement ville ${record.id}:`, e.message);
        errors++;
      }
    }
    
    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: finalCities } = await supabase
      .from('statistiques_participants')
      .select('ville')
      .not('ville', 'is', null);
    
    const cityCounts = {};
    finalCities.forEach(record => {
      const city = record.ville;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    console.log('\n📊 Résumé des villes après nettoyage:');
    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count}`);
      });
    
    console.log(`\n🎉 Nettoyage terminé !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Total mis à jour: ${totalUpdated}`);
    console.log(`   - Erreurs: ${errors}`);
    console.log(`   - Villes uniques finales: ${Object.keys(cityCounts).length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

cleanCities();
