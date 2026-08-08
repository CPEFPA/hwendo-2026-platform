const fs = require('fs');
const path = require('path');

// Remplacements des emojis corrompus (caracteres litteraux tels qu'affiches)
const replacements = [
  // Emojis manquants (sequences litterales)
  ['ðŸ“¥', '📥'],
  ['ðŸ“§', '📧'],
  ['ðŸ‘¥', '👥'],
  ['ðŸ“¸', '📸'],
  ['ðŸŽ¥', '🎥'],
  ['ðŸŽ¤', '🎤'],
  ['ðŸ“…', '📅'],
  ['ðŸ—ºï¸', '🗺️'],
  ['ðŸ—º', '🗺️'],
  ['ðŸ†', '🏆'],
  ['ðŸ¥‡', '🥇'],
  ['ðŸ¥ˆ', '🥈'],
  ['ðŸ¥‰', '🥉'],
  ['ðŸŽ­', '🎭'],
  ['ðŸŽµ', '🎵'],
  ['ðŸ“Š', '📊'],
  ['ðŸ“', '📝'],
  ['ðŸ”’', '🔒'],
  ['ðŸ“±', '📱'],
  ['ðŸŽ¯', '🎯'],
  ['ðŸ”„', '🔄'],
  ['ðŸ“‹', '📋'],
  ['ðŸ“', '📍'],
  ['ðŸ“†', '📆'],
  ['ðŸª˜', '🪘'],
  ['ðŸ›ï¸', '🏛️'],
  ['ðŸ›', '🏛️'],
  ['ðŸ•¶ï¸', '🕶️'],
  ['ðŸ•¶', '🕶️'],
  ['ðŸ¤', '🤐'],
  ['ðŸ“¦', '📦'],
  
  // Emojis avec variation selectors
  ['âœï¸', '✍️'],
  ['âœ', '✍️'],
  ['âš¥', '⚥'],
  ['â™‚', '♂'],
  ['â™€', '♀'],
  ['âœ…', '✅'],
  
  // Caracteres speciaux
  ['À‰', 'É'],
  ['Ã‰', 'É'],
  ['Ã', 'À'],
  ['Ã¨', 'è'],
  ['Ã©', 'é'],
  ['Ã ', 'à'],
  ['Ã´', 'ô'],
  ['Ã¹', 'ù'],
  ['Ã®', 'î'],
  ['Ã¯', 'ï'],
  ['Ã»', 'û'],
  ['Ã§', 'ç'],
  ['Ã¢', 'â'],
  ['Ãª', 'ê'],
  ['Ã‹', 'ë'],
  ['Å“', 'œ'],
  ['Å"', 'Œ'],
  ['â€™', "'"],
  ['â€˜', "'"],
  ['â€œ', '"'],
  ['â€', '"'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['Â ', ' '],
  ['Â°', '°'],
  ['Â©', '©'],
  ['Â®', '®'],
  ['Â«', '«'],
  ['Â»', '»'],
  ['Ãˆ', 'È'],
  ['Ã‡', 'Ç'],
  ['Ã"', 'Ô'],
  ['Ã›', 'Û'],
  ['Ã™', 'Ù'],
  ['ÃŽ', 'Î'],
];

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
  'src/App.jsx',
  'src/styles.css'
];

console.log('🔧 Correction des emojis et caracteres restants...\n');

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  ${filePath} (n'existe pas)`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    replacements.forEach(([bad, good]) => {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`✓  ${filePath} (déjà OK)`);
    }
  } catch (e) {
    console.log(`❌ ${filePath} : ${e.message}`);
  }
});

console.log('\n🎉 Terminé !');