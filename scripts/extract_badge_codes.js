const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../messages_whatsapp.txt');
const outputFile = path.join(__dirname, '../badges_extraits.csv');

const content = fs.readFileSync(inputFile, 'utf-8');
const messages = content.split(/\n(?=Sent)/g); // chaque message commence par 'Sent'

const results = [];

messages.forEach(msg => {
  // Chercher le numéro de téléphone (première ligne commençant par + ou chiffre après la date)
  const lines = msg.split('\n');
  let telephone = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^\+?\d{8,}/.test(l)) { // au moins 8 chiffres, commence par + ou chiffre
      telephone = l;
      break;
    }
  }
  // URL badge
  let url = '';
  const urlMatch = msg.match(/https?:\/\/[^\s"']+\.pdf/);
  if (urlMatch) url = urlMatch[0];
  // Code badge
  const codeMatch = msg.match(/Code badge\s*:\s*([A-Z0-9]+)/);
  const code = codeMatch ? codeMatch[1].trim() : '';
  if (telephone && url && code) {
    results.push([telephone, url, code]);
  }
});

// Générer le CSV
const header = 'telephone,badge_url,identifiant_badge';
const csv = [header, ...results.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
fs.writeFileSync(outputFile, csv, 'utf-8');

console.log(`Extraction terminée. ${results.length} lignes extraites. Fichier : ${outputFile}`); 