const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/inscriptions-csv.csv');
const outputPath = path.join(__dirname, '../data/inscriptions-csv-clean.csv');

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split(/\r?\n/);
const header = lines[0];
const seen = new Set();
const cleaned = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.split(';').length < 2) continue; // ignore lignes vides ou incomplètes
  const [name, email] = line.split(';');
  const key = (name.trim().toLowerCase() + '|' + email.trim().toLowerCase());
  if (!seen.has(key)) {
    seen.add(key);
    cleaned.push(line);
  }
}

fs.writeFileSync(outputPath, cleaned.join('\n'), 'utf8');
console.log(`Fichier nettoyé écrit dans ${outputPath} (${cleaned.length - 1} inscrits uniques)`); 