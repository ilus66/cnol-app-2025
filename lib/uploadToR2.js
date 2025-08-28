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
    const publicUrl = `${process.env.CLOUDFLARE_R2_ENDPOINT || 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com'}/${process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol'}/${fileName}`;
    
    console.log(`✅ Upload R2 réussi: ${fileName}`);
    
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
  return `${process.env.CLOUDFLARE_R2_ENDPOINT || 'https://23ca20c57ea5bdbe4dbe3efc5df73c1d.r2.cloudflarestorage.com'}/${process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cnol'}/${fileName}`;
}

module.exports = {
  uploadToR2,
  getR2PublicUrl
};
