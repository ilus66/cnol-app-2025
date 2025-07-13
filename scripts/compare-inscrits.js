const fs = require('fs');
const path = require('path');

const csv1Path = path.join(__dirname, '../data/inscriptions-csv-clean.csv');
const csv2Path = path.join(__dirname, '../data/inscrits-valide.csv');

// Fonction pour normaliser nom/email : minuscules, sans accents, sans espaces superflus
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(';');
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('name'));
  const emailIdx = header.findIndex(h => h.toLowerCase().includes('email'));
  const set = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    if (!cols[nameIdx] || !cols[emailIdx]) continue;
    const key = normalize(cols[nameIdx]) + '|' + normalize(cols[emailIdx]);
    set.add(key);
  }
  return set;
}

const set1 = parseCSV(csv1Path);
const set2 = parseCSV(csv2Path);

const onlyIn1 = [...set1].filter(x => !set2.has(x));
const onlyIn2 = [...set2].filter(x => !set1.has(x));

// Nouvelle partie : écrire les non-validés dans un nouveau fichier CSV
const csv1Content = fs.readFileSync(csv1Path, 'utf8');
const csv1Lines = csv1Content.split(/\r?\n/).filter(Boolean);
const header = csv1Lines[0];
const nameIdx = header.split(';').findIndex(h => h.toLowerCase().includes('name'));
const emailIdx = header.split(';').findIndex(h => h.toLowerCase().includes('email'));
const nonValideLines = [header.replace(/(^|;)name(;|$)/i, '$1name$2') + ';name_lower;name_upper'];
let nonValideRows = [];
for (let i = 1; i < csv1Lines.length; i++) {
  const cols = csv1Lines[i].split(';');
  if (!cols[nameIdx] || !cols[emailIdx]) continue;
  const key = normalize(cols[nameIdx]) + '|' + normalize(cols[emailIdx]);
  if (onlyIn1.includes(key)) {
    nonValideRows.push(cols);
  }
}
// Tri par nom puis email
nonValideRows.sort((a, b) => {
  const nameA = a[nameIdx].toLowerCase();
  const nameB = b[nameIdx].toLowerCase();
  if (nameA < nameB) return -1;
  if (nameA > nameB) return 1;
  // Si noms égaux, trier par email
  const emailA = a[emailIdx].toLowerCase();
  const emailB = b[emailIdx].toLowerCase();
  if (emailA < emailB) return -1;
  if (emailA > emailB) return 1;
  return 0;
});
// Générer les lignes triées
for (const row of nonValideRows) {
  // Met le nom d'origine en majuscules sans accents ni espaces superflus
  const nameUpper = normalize(row[nameIdx]).toUpperCase();
  // Ajoute la colonne name_lower et name_upper à la fin
  const rowCopy = [...row];
  rowCopy[nameIdx] = nameUpper;
  nonValideLines.push(rowCopy.join(';') + ';' + normalize(row[nameIdx]) + ';' + nameUpper);
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-non-valides.csv'), nonValideLines.join('\n'), 'utf8');

// Fonction pour normaliser et mettre en MAJUSCULES
function normalizeUpper(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// On prépare les sets de noms en MAJUSCULES pour les deux fichiers
function getUpperNameSetStrict(filePath, nameCol) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(';');
  const nameIdx = header.findIndex(h => h.toLowerCase().includes(nameCol));
  const set = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    if (!cols[nameIdx]) continue;
    set.add(normalizeUpper(cols[nameIdx]));
  }
  return set;
}

const nameSetNonValidesMaj = getUpperNameSetStrict(path.join(__dirname, '../data/inscriptions-non-valides.csv'), 'name');
const nameSetValidesMaj = getUpperNameSetStrict(csv2Path, 'name');

const onlyInNonValidesNames = [...nameSetNonValidesMaj].filter(x => !nameSetValidesMaj.has(x));
const onlyInValidesNames = [...nameSetValidesMaj].filter(x => !nameSetNonValidesMaj.has(x));

console.log(`\nInscrits dans inscriptions-csv-clean.csv mais PAS validés : (${onlyIn1.length})`);
console.log(onlyIn1.join('\n'));
console.log(`\nInscrits validés mais PAS dans le CSV nettoyé : (${onlyIn2.length})`);
console.log(onlyIn2.join('\n'));
console.log('\nNOMS en MAJUSCULES dans inscriptions-non-valides.csv mais PAS dans inscrits-valide.csv : (' + onlyInNonValidesNames.length + ')');
console.log(onlyInNonValidesNames.join('\n'));
console.log('\nNOMS en MAJUSCULES dans inscrits-valide.csv mais PAS dans inscriptions-non-valides.csv : (' + onlyInValidesNames.length + ')');
console.log(onlyInValidesNames.join('\n'));

// Générer un CSV avec uniquement les noms non présents dans les validés
const csv1ContentUnique = fs.readFileSync(csv1Path, 'utf8');
const csv1LinesUnique = csv1ContentUnique.split(/\r?\n/).filter(Boolean);
const headerUnique = csv1LinesUnique[0];
const nameIdxUnique = headerUnique.split(';').findIndex(h => h.toLowerCase().includes('name'));
const uniquesLines = [headerUnique];
for (let i = 1; i < csv1LinesUnique.length; i++) {
  const cols = csv1LinesUnique[i].split(';');
  if (!cols[nameIdxUnique]) continue;
  const nameNorm = normalize(cols[nameIdxUnique]).toUpperCase();
  if (!nameSetValidesMaj.has(nameNorm)) {
    uniquesLines.push(csv1LinesUnique[i]);
  }
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-non-valides-uniques.csv'), uniquesLines.join('\n'), 'utf8');
console.log('\nFichier inscriptions-non-valides-uniques.csv généré avec uniquement les noms absents des validés.');

// Générer un CSV avec uniquement les emails non présents dans les validés
const csv1ContentUniqueEmail = fs.readFileSync(csv1Path, 'utf8');
const csv1LinesUniqueEmail = csv1ContentUniqueEmail.split(/\r?\n/).filter(Boolean);
const headerUniqueEmail = csv1LinesUniqueEmail[0];
const emailIdxUnique = headerUniqueEmail.split(';').findIndex(h => h.toLowerCase().includes('email'));
const emailSetValides = getUpperNameSetStrict(csv2Path, 'email');
const uniquesLinesEmail = [headerUniqueEmail];
for (let i = 1; i < csv1LinesUniqueEmail.length; i++) {
  const cols = csv1LinesUniqueEmail[i].split(';');
  if (!cols[emailIdxUnique]) continue;
  const emailNorm = normalize(cols[emailIdxUnique]).toLowerCase();
  if (!emailSetValides.has(emailNorm)) {
    uniquesLinesEmail.push(csv1LinesUniqueEmail[i]);
  }
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-non-valides-uniques-email.csv'), uniquesLinesEmail.join('\n'), 'utf8');
console.log('\nFichier inscriptions-non-valides-uniques-email.csv généré avec uniquement les emails absents des validés.');

// Générer un CSV dédupliqué par nom MAJUSCULE, uniquement pour les noms absents des validés
const csv1ContentMaj = fs.readFileSync(csv1Path, 'utf8');
const csv1LinesMaj = csv1ContentMaj.split(/\r?\n/).filter(Boolean);
const headerMaj = csv1LinesMaj[0];
const nameIdxMaj = headerMaj.split(';').findIndex(h => h.toLowerCase().includes('name'));
const seenNamesMaj = new Set();
const uniquesLinesDedupMaj = [headerMaj];
for (let i = 1; i < csv1LinesMaj.length; i++) {
  const cols = csv1LinesMaj[i].split(';');
  if (!cols[nameIdxMaj]) continue;
  const nameNormMaj = normalizeUpper(cols[nameIdxMaj]);
  if (!nameSetValidesMaj.has(nameNormMaj) && !seenNamesMaj.has(nameNormMaj)) {
    // On remplace la colonne name par sa version MAJUSCULE normalisée
    cols[nameIdxMaj] = nameNormMaj;
    uniquesLinesDedupMaj.push(cols.join(';'));
    seenNamesMaj.add(nameNormMaj);
  }
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-non-valides-uniques.csv'), uniquesLinesDedupMaj.join('\n'), 'utf8');
console.log('\nFichier inscriptions-non-valides-uniques.csv généré (noms en MAJUSCULES, dédupliqué, absents des validés).');

// Fonction de normalisation ultra-stricte
function normalizeName(str) {
  return str
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^A-Z ]/g, '') // garder que lettres et espaces
    .replace(/\s+/g, ' ')    // espaces multiples en un seul
    .trim();
}

// Set de noms validés (normalisés)
function getStrictNameSet(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(';');
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('name'));
  const set = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    if (!cols[nameIdx]) continue;
    set.add(normalizeName(cols[nameIdx]));
  }
  return set;
}

const nameSetValidesStrict = getStrictNameSet(csv2Path);

// Générer un CSV dédupliqué par nom strict, uniquement pour les noms absents des validés
const csv1ContentStrict = fs.readFileSync(csv1Path, 'utf8');
const csv1LinesStrict = csv1ContentStrict.split(/\r?\n/).filter(Boolean);
const headerStrict = csv1LinesStrict[0];
const nameIdxStrict = headerStrict.split(';').findIndex(h => h.toLowerCase().includes('name'));
const seenNamesStrict = new Set();
const uniquesLinesStrict = [headerStrict];
const debugNomsCommunsStrict = [];
for (let i = 1; i < csv1LinesStrict.length; i++) {
  const cols = csv1LinesStrict[i].split(';');
  if (!cols[nameIdxStrict]) continue;
  const nameNormStrict = normalizeName(cols[nameIdxStrict]);
  if (nameSetValidesStrict.has(nameNormStrict)) {
    debugNomsCommunsStrict.push(cols[nameIdxStrict]);
    continue;
  }
  if (!seenNamesStrict.has(nameNormStrict)) {
    cols[nameIdxStrict] = nameNormStrict;
    uniquesLinesStrict.push(cols.join(';'));
    seenNamesStrict.add(nameNormStrict);
  }
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-non-valides-uniques.csv'), uniquesLinesStrict.join('\n'), 'utf8');
console.log('\nFichier inscriptions-non-valides-uniques.csv généré (normalisation stricte, dédupliqué, absents des validés).');
if (debugNomsCommunsStrict.length > 0) {
  fs.writeFileSync(path.join(__dirname, '../data/debug-noms-communs-strict.csv'), debugNomsCommunsStrict.join('\n'), 'utf8');
  console.log('\nNOMS PRÉSENTS DANS LES DEUX LISTES (normalisation stricte) :');
  console.log(debugNomsCommunsStrict.join('\n'));
} else {
  console.log('\nAucun nom commun trouvé après normalisation stricte.');
}

// Fonction utilitaire pour générer la clé nom+email normalisés
function makeKey(cols, nameIdx, emailIdx) {
  return normalizeName(cols[nameIdx]) + '|' + (cols[emailIdx] ? normalizeName(cols[emailIdx]) : '');
}
// Fusionner les deux listes en une seule, dédupliquée par nom ET email stricts (on garde tous les inscrits, même s'ils sont dans les deux fichiers)
const csv1ContentFusion = fs.readFileSync(csv1Path, 'utf8');
const csv2ContentFusion = fs.readFileSync(csv2Path, 'utf8');
const csv1LinesFusion = csv1ContentFusion.split(/\r?\n/).filter(Boolean);
const csv2LinesFusion = csv2ContentFusion.split(/\r?\n/).filter(Boolean);
const headerFusion = csv1LinesFusion[0]; // On prend l'en-tête du premier fichier
const nameIdxFusion = headerFusion.split(';').findIndex(h => h.toLowerCase().includes('name'));
const emailIdxFusion = headerFusion.split(';').findIndex(h => h.toLowerCase().includes('email'));
const seenNamesEmailsFusion = new Set();
const allLinesNoDup = [headerFusion];
// Ajout des lignes du premier fichier
for (let i = 1; i < csv1LinesFusion.length; i++) {
  const cols = csv1LinesFusion[i].split(';');
  if (!cols[nameIdxFusion]) continue;
  const key = makeKey(cols, nameIdxFusion, emailIdxFusion);
  if (!seenNamesEmailsFusion.has(key)) {
    cols[nameIdxFusion] = normalizeName(cols[nameIdxFusion]);
    if (cols[emailIdxFusion]) cols[emailIdxFusion] = normalizeName(cols[emailIdxFusion]);
    allLinesNoDup.push(cols.join(';'));
    seenNamesEmailsFusion.add(key);
  }
}
const header2Fusion = csv2LinesFusion[0];
const nameIdx2Fusion = header2Fusion.split(';').findIndex(h => h.toLowerCase().includes('name'));
const emailIdx2Fusion = header2Fusion.split(';').findIndex(h => h.toLowerCase().includes('email'));
for (let i = 1; i < csv2LinesFusion.length; i++) {
  const cols = csv2LinesFusion[i].split(';');
  if (!cols[nameIdx2Fusion]) continue;
  const key = makeKey(cols, nameIdx2Fusion, emailIdx2Fusion);
  if (!seenNamesEmailsFusion.has(key)) {
    const newCols = Array(headerFusion.split(';').length).fill('');
    newCols[nameIdxFusion] = normalizeName(cols[nameIdx2Fusion]);
    if (cols[emailIdx2Fusion]) newCols[emailIdxFusion] = normalizeName(cols[emailIdx2Fusion]);
    allLinesNoDup.push(newCols.join(';'));
    seenNamesEmailsFusion.add(key);
  }
}
fs.writeFileSync(path.join(__dirname, '../data/inscriptions-toutes-uniques.csv'), allLinesNoDup.join('\n'), 'utf8');
console.log('\nFichier inscriptions-toutes-uniques.csv généré (fusion simple, dédupliqué par nom ET email stricts, aucun inscrit supprimé).'); 