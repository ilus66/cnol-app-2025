// Fonction d'upload vers Cloudflare R2
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('./r2Client');

async function uploadToR2(fileName, fileBuffer, contentType = 'application/pdf') {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol',
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    const result = await r2Client.send(command);
    
    // Utiliser la nouvelle URL publique R2 qui fonctionne
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-fdeb8c312cab4d4bb5abbe51803382ab.r2.dev'}/${fileName}`;
    
    console.log(`✅ Upload R2 réussi: ${fileName}`);
    console.log(`🔗 URL publique: ${publicUrl}`);
    
    return {
      success: true,
      publicUrl,
      etag: result.ETag
    };
  } catch (error) {
    console.error('❌ Erreur upload R2:', error);
    throw error;
  }
}

// Fonction pour obtenir l'URL publique d'un fichier
function getR2PublicUrl(fileName) {
  // Utiliser la nouvelle URL publique R2 qui fonctionne
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-fdeb8c312cab4d4bb5abbe51803382ab.r2.dev'}/${fileName}`;
}

module.exports = {
  uploadToR2,
  getR2PublicUrl
};
