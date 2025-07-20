const { generateMinimalPdf } = require('./lib/generateBadgeUnified');
const fs = require('fs');

(async () => {
  const pdfBuffer = await generateMinimalPdf();
  fs.writeFileSync('test-minimal.pdf', pdfBuffer);
  console.log('PDF écrit dans test-minimal.pdf');
})(); 