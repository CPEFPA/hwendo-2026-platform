const fs = require('fs');
const path = require('path');

const replacements = [
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
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
  ['Ã', 'À'],
  ['Ã‰', 'É'],
  ['Ãˆ', 'È'],
  ['Ã‡', 'Ç'],
  ['Ã"', 'Ô'],
  ['Ã›', 'Û'],
  ['Ã™', 'Ù'],
  ['ÃŽ', 'Î'],
  ['Å"', 'œ'],
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
  ['À‰', 'É'],
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
  ['âœï¸', '✍️'],
  ['âœ', '✍️'],
  ['âš¥', '⚥'],
  ['â™‚', '♂'],
  ['â™€', '♀'],
  ['âœ…', '✅']
];

const filesToFix = [
  'src/components/Statistiques.jsx',
  'src/components/DetenteurForm.jsx',
  'src/components/DetenteurList.jsx',
  'src/components/MediaCapture.jsx',
  'src/components/MediaDisplay.jsx',
  'src/components/PolitiqueConfidentialite.jsx',
  'src/components/CarteVillages.jsx',
  'src/components/RapportPDF.jsx',
  'src/components/SignatureCanvas.jsx',
  'src/App.jsx',
  'src/main.jsx',
  'src/styles.css'
];

console.log('🔧 Correction UTF-8 de tous les composants...\n');

let totalFixed = 0;

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
      totalFixed++;
    } else {
      console.log(`✓  ${filePath} (déjà OK)`);
    }
  } catch (e) {
    console.log(`❌ ${filePath} : ${e.message}`);
  }
});

console.log(`\n🎉 Terminé ! ${totalFixed} fichiers corrigés.`);