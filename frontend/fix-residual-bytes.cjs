const fs = require('fs');
const path = require('path');

// Fonction pour nettoyer les bytes résiduels après les emojis
function cleanResidualBytes(content) {
  // Pattern: emoji valide + variation selector + bytes résiduels (U+80-U+9F, U+A0-U+FF)
  // Ces bytes résiduels sont les bytes UTF-8 de l'emoji mal interprétés
  
  let cleaned = content;
  let replacements = 0;
  
  // Liste des emojis courants avec leur séquence correcte
  const emojiPatterns = [
    // ✍️ (writing hand)
    { correct: '\u270D\uFE0F', residual: /[\u008D\u00EF\u00B8\u008F]/g },
    // ✅ (check mark)
    { correct: '\u2705', residual: /[\u0085\u00C2]/g },
    // ⚥ (gender)
    { correct: '\u26A5', residual: /[\u009A\u00A5]/g },
    // ♂ (male)
    { correct: '\u2642', residual: /[\u0082\u0099]/g },
    // ♀ (female)
    { correct: '\u2640', residual: /[\u0080\u0099]/g },
    // ✓ (check)
    { correct: '\u2713', residual: /[\u0093\u00E2]/g },
    // ✗ (cross)
    { correct: '\u2717', residual: /[\u0097\u00E2]/g },
  ];
  
  emojiPatterns.forEach(({ correct, residual }) => {
    // Chercher l'emoji suivi de bytes résiduels
    const pattern = new RegExp(escapeRegExp(correct) + '[\u0080-\u00FF]+', 'g');
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, correct);
      replacements++;
    }
  });
  
  // Nettoyage général: enlever les caractères de contrôle (U+80-U+9F) qui suivent un emoji
  const controlCharsPattern = /([\u270D\u2705\u26A5\u2642\u2640\u2713\u2717\uFE0F])[\u0080-\u009F]+/g;
  cleaned = cleaned.replace(controlCharsPattern, '$1');
  
  return { cleaned, replacements };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const filesToFix = [
  'src/components/Statistiques.jsx',
  'src/components/DetenteurForm.jsx',
  'src/components/DetenteurList.jsx',
  'src/components/MediaCapture.jsx',
  'src/components/MediaDisplay.jsx',
  'src/components/PDFGenerator.jsx',
  'src/components/PolitiqueConfidentialite.jsx',
  'src/components/CarteVillages.jsx',
  'src/components/RapportPDF.jsx',
  'src/components/SignatureCanvas.jsx',
  'src/App.jsx',
  'src/main.jsx',
  'src/styles.css'
];

console.log('🔧 Nettoyage des bytes résiduels après emojis...\n');

let totalFixed = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  ${filePath} (n'existe pas)`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const { cleaned, replacements } = cleanResidualBytes(content);
    
    if (cleaned !== content) {
      fs.writeFileSync(fullPath, cleaned, 'utf8');
      console.log(`✅ ${filePath}`);
      totalFixed++;
    } else {
      console.log(`✓  ${filePath} (déjà OK)`);
    }
  } catch (e) {
    console.log(`❌ ${filePath} : ${e.message}`);
  }
});

console.log(`\n🎉 Terminé ! ${totalFixed} fichiers nettoyés.`);