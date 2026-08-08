const fs = require('fs');
const path = require('path');

// Fonction pour corriger le double encoding UTF-8
function fixDoubleEncoding(content) {
  try {
    // Decoder la chaine comme si c'etait du Latin-1
    // puis reinterpreter comme UTF-8
    const fixed = Buffer.from(content, 'latin1').toString('utf8');
    return fixed;
  } catch (e) {
    return content;
  }
}

// Liste des fichiers a corriger
const filesToFix = [
  'src/components/Statistiques.jsx',
  'src/components/DetenteurForm.jsx',
  'src/components/DetenteurList.jsx',
  'src/components/MediaCapture.jsx',
  'src/components/MediaDisplay.jsx',
  'src/components/PDFGenerator.jsx',
  'src/components/PolitiqueConfidentialite.jsx',
  'src/components/CarteVillages.jsx',
  'src/components/RapportPDF.jsx'
];

console.log('🔧 Correction du double encoding UTF-8...\n');

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  ${filePath} (n'existe pas)`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Verifier si le fichier contient des sequences corrompues
    if (content.includes('Ã') || content.includes('Â°') || content.includes('ð')) {
      const fixed = fixDoubleEncoding(content);
      fs.writeFileSync(fullPath, fixed, 'utf8');
      console.log(`✅ ${filePath} (corrigé)`);
    } else {
      console.log(`✓  ${filePath} (déjà OK)`);
    }
  } catch (e) {
    console.log(`❌ ${filePath} : ${e.message}`);
  }
});

console.log('\n🎉 Terminé !');