const fs = require('fs');
const path = require('path');

// Script de diagnostic pour vérifier le PDFGenerator
let pdfContent = fs.readFileSync(path.join(__dirname, 'src/components/PDFGenerator.jsx'), 'utf8');

// Ajouter des logs de diagnostic dans loadLocalMedia
const oldLoad = `  const loadLocalMedia = async () => {
    try {
      // Chercher par nom complet OU par ID backend
      let localDet = null;
      
      if (detenteur.nomComplet) {
        localDet = await db.detenteurs.where('nomComplet').equals(detenteur.nomComplet).first();
      }
      
      if (!localDet && detenteur.backendId) {
        localDet = await db.detenteurs.where('backendId').equals(detenteur.backendId).first();
      }`;

const newLoad = `  const loadLocalMedia = async () => {
    try {
      console.log('🔍 Recherche médias pour:', detenteur.nomComplet);
      
      // Chercher par nom complet OU par ID backend
      let localDet = null;
      
      if (detenteur.nomComplet) {
        localDet = await db.detenteurs.where('nomComplet').equals(detenteur.nomComplet).first();
        console.log('📋 Trouvé par nom:', localDet ? 'OUI' : 'NON');
      }
      
      if (!localDet && detenteur.backendId) {
        localDet = await db.detenteurs.where('backendId').equals(detenteur.backendId).first();
        console.log('📋 Trouvé par backendId:', localDet ? 'OUI' : 'NON');
      }
      
      // Fallback : chercher dans tous les détenteurs
      if (!localDet) {
        const allDets = await db.detenteurs.toArray();
        console.log('📋 Total détenteurs locaux:', allDets.length);
        allDets.forEach(d => console.log('  -', d.nomComplet));
        localDet = allDets.find(d => 
          d.nomComplet && detenteur.nomComplet && 
          d.nomComplet.toLowerCase().includes(detenteur.nomComplet.toLowerCase())
        );
        if (localDet) console.log('📋 Trouvé par recherche floue:', localDet.nomComplet);
      }`;

if (pdfContent.includes(oldLoad)) {
  pdfContent = pdfContent.replace(oldLoad, newLoad);
  console.log('✅ Logs de diagnostic ajoutés (partie 1)');
} else {
  console.log('⚠️  Pattern partie 1 non trouvé');
}

// Ajouter des logs pour la photo et signature
const oldMedia = `      if (localDet) {
        const signature = localDet.signature || null;
        let photo = null;
        
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
        } else if (localDet.id) {`;

const newMedia = `      if (localDet) {
        console.log('📦 Détenteur local trouvé:', {
          nom: localDet.nomComplet,
          hasSignature: !!localDet.signature,
          hasPhotos: !!(localDet.photos && localDet.photos.length > 0),
          photosCount: localDet.photos ? localDet.photos.length : 0
        });
        
        const signature = localDet.signature || null;
        let photo = null;
        
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
          console.log('📸 Photo trouvée dans detenteur.photos');
        } else if (localDet.id) {`;

if (pdfContent.includes(oldMedia)) {
  pdfContent = pdfContent.replace(oldMedia, newMedia);
  console.log('✅ Logs de diagnostic ajoutés (partie 2)');
} else {
  console.log('⚠️  Pattern partie 2 non trouvé');
}

fs.writeFileSync(path.join(__dirname, 'src/components/PDFGenerator.jsx'), pdfContent, 'utf8');
console.log('\n🎉 Diagnostic ajouté au PDFGenerator !');