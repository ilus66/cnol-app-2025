const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://otmttpiqeehfquoqycol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXR0cGlxZWVoZnF1b3F5Y29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyNzM0OSwiZXhwIjoyMDY1MzAzMzQ5fQ.apn4cVizZwJ79WoIfHOGHuVAyfR90YRs8wXloFsNLNM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping des villes à uniformiser
const villeMapping = {
  // Variations de RABAT
  'RABAT ( TEMARA )': 'RABAT',
  'RABAT YACOUB EL MANSOUR': 'RABAT',
  'RABAT SALE': 'RABAT',
  'RABAT AGDAL': 'RABAT',
  'RABAT (TEMARA)': 'RABAT',
  
  // Variations de CASABLANCA
  'CASA': 'CASABLANCA',
  'CASBLANCA': 'CASABLANCA',
  'CASA BLANCA': 'CASABLANCA',
  'CASABLANCA/RAHMA': 'CASABLANCA',
  'ERRAHMA CASABLANCA': 'CASABLANCA',
  
  // Variations de MARRAKECH
  'MARRAKESH': 'MARRAKECH',
  
  // Variations de AGADIR
  'AGADIRE': 'AGADIR',
  'DCHEIRA,AGADIR': 'AGADIR',
  
  // Variations de KENITRA
  'KÉNITRA': 'KENITRA',
  
  // Variations de TEMARA
  'TÉMARA': 'TEMARA',
  'TEMERA': 'TEMARA',
  'MERS LKHIR TEMARA': 'TEMARA',
  
  // Variations de SALE
  'SALÉ': 'SALE',
  
  // Variations de TANGER
  'TANGER.': 'TANGER',
  'TÁNGER': 'TANGER',
  
  // Variations de FES
  'FÈS': 'FES',
  'FEZ': 'FES',
  
  // Variations de MEKNES
  'MEKNÈS': 'MEKNES',
  
  // Variations de EL JADIDA
  'ELJADIDA': 'EL JADIDA',
  'SALA EL JADIDA': 'EL JADIDA',
  
  // Variations de TETOUAN
  'TÉTOUAN': 'TETOUAN',
  
  // Variations de KHEMISSET
  'KHEMISSET': 'KHEMISSET',
  
  // Variations de SALA AL JADIDA
  'SALA ALJADIDA': 'SALA AL JADIDA',
  
  // Variations de MOHAMMEDIA
  'MOHAMMADIA': 'MOHAMMEDIA',
  'MOHAMEDIA': 'MOHAMMEDIA',
  'MOHAMADIA': 'MOHAMMEDIA',
  'MOHAMMÉDIA': 'MOHAMMEDIA',
  
  // Variations de BENI MELLAL
  'BÉNI MELLAL': 'BENI MELLAL',
  'BENI MELLAM': 'BENI MELLAL',
  'BENIMELLAL': 'BENI MELLAL',
  
  // Variations de TAN-TAN
  'TAN TAN': 'TAN-TAN',
  'TANTAN': 'TAN-TAN',
  
  // Variations de OUAZZANE
  'OUZZANE': 'OUAZZANE',
  'OUEZZANE': 'OUAZZANE',
  
  // Variations de EL KELAA DE SRAGHNA
  'KALAA SRAGHNA': 'EL KELAA DE SRAGHNA',
  'KELAAT M\'GOUNA': 'EL KELAA DE SRAGHNA',
  
  // Variations de TAROUDANT
  'TAROUDANNT': 'TAROUDANT',
  
  // Variations de GUELMIM
  'GUELMIM': 'GUELMIM',
  
  // Variations de LARACHE
  'LARACHE': 'LARACHE',
  
  // Variations de BERRECHID
  'BERRECHID': 'BERRECHID',
  
  // Variations de TIFLET
  'TIFLET': 'TIFLET',
  
  // Variations de SETTAT
  'SETTAT': 'SETTAT',
  
  // Variations de ESSAOUIRA
  'ESSAOUIRA': 'ESSAOUIRA',
  
  // Variations de SAFI
  'SAFI': 'SAFI',
  
  // Variations de BERKANE
  'BERKANE': 'BERKANE',
  
  // Variations de BIOUGRA
  'BIOUGRA': 'BIOUGRA',
  
  // Variations de KHOURIBGA
  'KHOURIBGA': 'KHOURIBGA',
  
  // Variations de BOUZNIKA
  'BOUZNIKA': 'BOUZNIKA',
  
  // Variations de TAZA
  'TAZA': 'TAZA',
  
  // Variations de SKHIRAT
  'SKHIRAT': 'SKHIRAT',
  
  // Variations de KSAR EL KEBIR
  'KSAR EL KEBIR': 'KSAR EL KEBIR',
  
  // Variations de ERRACHIDIA
  'ERRACHIDIA': 'ERRACHIDIA',
  
  // Variations de NADOR
  'NADOR': 'NADOR',
  
  // Variations de GUERCIF
  'GUERCIF': 'GUERCIF',
  'GUERSIF': 'GUERCIF',
  
  // Variations de TINGHIR
  'TINGHIR': 'TINGHIR',
  
  // Variations de OULED TEIMA
  'OULED TEIMA': 'OULED TEIMA',
  'OULAD TEIMA': 'OULED TEIMA',
  'OULAD NEMMA': 'OULED TEIMA',
  
  // Variations de BOUSKOURA
  'BOUSKOURA': 'BOUSKOURA',
  
  // Variations de SIDI SLIMANE
  'SIDI SLIMANE': 'SIDI SLIMANE',
  
  // Variations de SIDI KACEM
  'SIDI KACEM': 'SIDI KACEM',
  
  // Variations de TAOUNATE
  'TAOUNATE': 'TAOUNATE',
  
  // Variations de SEFROU
  'SEFROU': 'SEFROU',
  
  // Variations de MIDELT
  'MIDELT': 'MIDELT',
  
  // Variations de BENGUERIR
  'BENGUERIR': 'BENGUERIR',
  'BENGRIR': 'BENGUERIR',
  'BEN GUERIR': 'BENGUERIR',
  
  // Variations de OUAZZANE
  'OUAZZANE': 'OUAZZANE',
  
  // Variations de OUED ZEM
  'OUED ZEM': 'OUED ZEM',
  
  // Variations de DAKAR
  'DAKAR': 'DAKAR',
  
  // Variations de TAOURIRT
  'TAOURIRT': 'TAOURIRT',
  
  // Variations de ZAGORA
  'ZAGORA': 'ZAGORA',
  
  // Variations de FKIH BEN SALAH
  'FKIH BEN SALAH': 'FKIH BEN SALAH',
  'FQIH BENSALEH': 'FKIH BEN SALAH',
  'FQIH BENSALEH': 'FKIH BEN SALAH',
  
  // Variations de DOHA
  'DOHA': 'DOHA',
  
  // Variations de SEMARA
  'SEMARA': 'SEMARA',
  
  // Variations de TAMESNA
  'TAMESNA': 'TAMESNA',
  
  // Variations de SIDI YAHYA EL GHARB
  'SIDI YAHYA EL GHARB': 'SIDI YAHYA EL GHARB',
  
  // Variations de SIDI ALLAL EL BAHRAOUI
  'SIDI ALLAL EL BAHRAOUI': 'SIDI ALLAL EL BAHRAOUI',
  
  // Variations de YOUSSOUFIA
  'YOUSSOUFIA': 'YOUSSOUFIA',
  'YOUSOUFIA': 'YOUSSOUFIA',
  
  // Variations de MARTIL
  'MARTIL': 'MARTIL',
  
  // Variations de TAN-TAN
  'TAN-TAN': 'TAN-TAN',
  
  // Variations de BIR JDID
  'BIR JDID': 'BIR JDID',
  
  // Variations de BENSLIMAN
  'BENSLIMAN': 'BENSLIMAN',
  'BENSLIMANE': 'BENSLIMAN',
  
  // Variations de TANGA
  'TANGA': 'TANGA',
  
  // Variations de TAMENSOURT
  'TAMENSOURT': 'TAMENSOURT',
  'TAMENSOURET': 'TAMENSOURT',
  
  // Variations de ELATTAOUIA
  'ELATTAOUIA': 'ELATTAOUIA',
  
  // Variations de TITMELLIL
  'TITMELLIL': 'TITMELLIL',
  
  // Variations de AIT OURIR
  'AIT OURIR': 'AIT OURIR',
  
  // Variations de JERADA
  'JERADA': 'JERADA',
  
  // Variations de OPTICIEN
  'OPTICIEN': 'OPTICIEN',
  
  // Variations de AGOURAI
  'AGOURAI': 'AGOURAI',
  
  // Variations de ORTHOPTISTE
  'ORTHOPTISTE': 'ORTHOPTISTE',
  
  // Variations de FEZ
  'FEZ': 'FES',
  
  // Variations de KELAAT M'GOUNA
  'KELAAT M\'GOUNA': 'KELAAT M\'GOUNA',
  
  // Variations de DAKHLA
  'DAKHLA': 'DAKHLA',
  
  // Variations de MDIQ
  'MDIQ': 'MDIQ',
  
  // Variations de OUARZAZATE
  'OUARZAZATE': 'OUARZAZATE',
  
  // Variations de ER-RICH
  'ER-RICH': 'ER-RICH',
  'ERRICH': 'ER-RICH',
  
  // Variations de TAMELLALET
  'TAMELLALET': 'TAMELLALET',
  
  // Variations de ERFOUD
  'ERFOUD': 'ERFOUD',
  
  // Variations de BOUJDOUR
  'BOUJDOUR': 'BOUJDOUR',
  
  // Variations de CHICHAOUA
  'CHICHAOUA': 'CHICHAOUA',
  
  // Variations de AL HOCEIMA
  'AL HOCEIMA': 'AL HOCEIMA',
  'HOCEIMA': 'AL HOCEIMA',
  
  // Variations de ESPAGNE
  'ESPAGNE': 'ESPAGNE',
  
  // Variations de ORAN
  'ORAN': 'ORAN',
  
  // Variations de TAHENAOUT
  'TAHENAOUT': 'TAHENAOUT',
  
  // Variations de MISSOUR
  'MISSOUR': 'MISSOUR',
  
  // Variations de AZROU
  'AZROU': 'AZROU',
  
  // Variations de WURTZBOURG
  'WURTZBOURG': 'WURTZBOURG',
  
  // Variations de IMINTANOUT
  'IMINTANOUT': 'IMINTANOUT',
  'IMINTANOUTE': 'IMINTANOUT',
  
  // Variations de RISSANI
  'RISSANI': 'RISSANI',
  
  // Variations de INZEGANE
  'INZEGANE': 'INZEGANE',
  'INEZGANE': 'INZEGANE',
  
  // Variations de ZAIO
  'ZAIO': 'ZAIO',
  
  // Variations de CHILLY MAZARIN
  'CHILLY MAZARIN': 'CHILLY MAZARIN',
  
  // Variations de BEJAAD
  'BEJAAD': 'BEJAAD',
  
  // Variations de AIN ATIQ
  'AIN ATIQ': 'AIN ATIQ',
  
  // Variations de DEROUA
  'DEROUA': 'DEROUA',
  
  // Variations de ELHAJEB
  'ELHAJEB': 'ELHAJEB',
  
  // Variations de BEN AHMED
  'BEN AHMED': 'BEN AHMED',
  
  // Variations de GOMEL
  'GOMEL': 'GOMEL',
  
  // Variations de SIDI BENNOUR
  'SIDI BENNOUR': 'SIDI BENNOUR',
  
  // Variations de SKHOUR RHAMNA
  'SKHOUR RHAMNA': 'SKHOUR RHAMNA',
  
  // Variations de AOULOUZ
  'AOULOUZ': 'AOULOUZ',
  
  // Variations de SOUK LARBAA
  'SOUK LARBAA': 'SOUK LARBAA',
  
  // Variations de BOUKNADEL
  'BOUKNADEL': 'BOUKNADEL',
  
  // Variations de PARIS
  'PARIS': 'PARIS',
  
  // Variations de BANGUI RÉPUBLIQUE CENTRAFRICAINE
  'BANGUI RÉPUBLIQUE CENTRAFRICAINE': 'BANGUI RÉPUBLIQUE CENTRAFRICAINE',
  
  // Variations de AIN TAOUJDAT
  'AIN TAOUJDAT': 'AIN TAOUJDAT',
  
  // Variations de SIDI IFNI
  'SIDI IFNI': 'SIDI IFNI',
  
  // Variations de MOULAY BOUSSELHAM
  'MOULAY BOUSSELHAM': 'MOULAY BOUSSELHAM',
  
  // Variations de FNIDEQ
  'FNIDEQ': 'FNIDEQ',
  
  // Variations de ALGER
  'ALGER': 'ALGER',
  
  // Variations de OUAGADOUGOU BURKINA FASO
  'OUAGADOUGOU BURKINA FASO': 'OUAGADOUGOU BURKINA FASO',
  
  // Valeurs NULL ou vides
  'NULL': null,
  '': null,
  'null': null,
  'undefined': null
};

async function uniformiserVilles() {
  console.log('🚀 Début de l\'uniformisation des villes...');
  
  let totalUpdated = 0;
  let errors = [];
  
  // 1. Traiter la table inscription
  console.log('\n📋 Traitement de la table inscription...');
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: inscriptions, error } = await supabase
      .from('inscription')
      .select('id, ville')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des inscriptions:', error);
      break;
    }
    
    if (!inscriptions || inscriptions.length === 0) break;
    
    for (const inscription of inscriptions) {
      if (inscription.ville && villeMapping[inscription.ville.toUpperCase()]) {
        const nouvelleVille = villeMapping[inscription.ville.toUpperCase()];
        try {
          const { error: updateError } = await supabase
            .from('inscription')
            .update({ ville: nouvelleVille })
            .eq('id', inscription.id);
          
          if (updateError) {
            errors.push(`Erreur mise à jour inscription ${inscription.id}: ${updateError.message}`);
          } else {
            totalUpdated++;
            console.log(`✅ Inscription ${inscription.id}: "${inscription.ville}" → "${nouvelleVille}"`);
          }
        } catch (e) {
          errors.push(`Exception mise à jour inscription ${inscription.id}: ${e.message}`);
        }
      }
    }
    
    from += pageSize;
    hasMore = inscriptions.length === pageSize;
  }
  
  // 2. Traiter la table whatsapp
  console.log('\n📱 Traitement de la table whatsapp...');
  from = 0;
  hasMore = true;
  
  while (hasMore) {
    const { data: whatsapp, error } = await supabase
      .from('whatsapp')
      .select('id, ville')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des whatsapp:', error);
      break;
    }
    
    if (!whatsapp || whatsapp.length === 0) break;
    
    for (const contact of whatsapp) {
      if (contact.ville && villeMapping[contact.ville.toUpperCase()]) {
        const nouvelleVille = villeMapping[contact.ville.toUpperCase()];
        try {
          const { error: updateError } = await supabase
            .from('whatsapp')
            .update({ ville: nouvelleVille })
            .eq('id', contact.id);
          
          if (updateError) {
            errors.push(`Erreur mise à jour whatsapp ${contact.id}: ${updateError.message}`);
          } else {
            totalUpdated++;
            console.log(`✅ WhatsApp ${contact.id}: "${contact.ville}" → "${nouvelleVille}"`);
          }
        } catch (e) {
          errors.push(`Exception mise à jour whatsapp ${contact.id}: ${e.message}`);
        }
      }
    }
    
    from += pageSize;
    hasMore = whatsapp.length === pageSize;
  }
  
  // 3. Traiter la table statistiques_participants
  console.log('\n📊 Traitement de la table statistiques_participants...');
  from = 0;
  hasMore = true;
  
  while (hasMore) {
    const { data: stats, error } = await supabase
      .from('statistiques_participants')
      .select('identifiant, ville')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      break;
    }
    
    if (!stats || stats.length === 0) break;
    
    for (const stat of stats) {
      if (stat.ville && villeMapping[stat.ville.toUpperCase()]) {
        const nouvelleVille = villeMapping[stat.ville.toUpperCase()];
        try {
          const { error: updateError } = await supabase
            .from('statistiques_participants')
            .update({ ville: nouvelleVille })
            .eq('identifiant', stat.identifiant);
          
          if (updateError) {
            errors.push(`Erreur mise à jour stats ${stat.identifiant}: ${updateError.message}`);
          } else {
            totalUpdated++;
            console.log(`✅ Stats ${stat.identifiant}: "${stat.ville}" → "${nouvelleVille}"`);
          }
        } catch (e) {
          errors.push(`Exception mise à jour stats ${stat.identifiant}: ${e.message}`);
        }
      }
    }
    
    from += pageSize;
    hasMore = stats.length === pageSize;
  }
  
  // Résumé
  console.log('\n🎯 Résumé de l\'uniformisation:');
  console.log(`✅ Total des mises à jour: ${totalUpdated}`);
  
  if (errors.length > 0) {
    console.log(`❌ Erreurs rencontrées: ${errors.length}`);
    errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log('✅ Aucune erreur rencontrée');
  }
  
  console.log('\n🏁 Uniformisation terminée !');
}

// Exécution du script
uniformiserVilles().catch(console.error); 