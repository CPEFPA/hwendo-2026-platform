const fs = require('fs');
const path = require('path');

// Remplacements EXACTS des sequences corrompues
// Ces replacements ne touchent PAS aux expressions JSX
const replacements = [
  // Accents
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
  
  // Emojis courants (sequences UTF-8 corrompues)
  ['\u00F0\u009F\u008E\u00B5', '🎵'],  // musical note
  ['\u00F0\u009F\u0093\u008A', '📊'],  // chart
  ['\u00F0\u009F\u0093\u009D', '📝'],  // memo
  ['\u00F0\u009F\u0091\u00A5', '👥'],  // people
  ['\u00F0\u009F\u0094\u0092', '🔒'],  // lock
  ['\u00F0\u009F\u0093\u00B1', '📱'],  // phone
  ['\u00F0\u009F\u0093\u00B8', '📸'],  // camera
  ['\u00F0\u009F\u008E\u00A5', '🎥'],  // video
  ['\u00F0\u009F\u008E\u00A4', '🎤'],  // mic
  ['\u00F0\u009F\u008E\u00AF', '🎯'],  // target
  ['\u00F0\u009F\u0093\u00A5', '📥'],  // download
  ['\u00F0\u009F\u0093\u0085', '📅'],  // calendar
  ['\u00F0\u009F\u0097\u00BA\u00EF\u00B8\u008F', '🗺️'],  // map
  ['\u00F0\u009F\u008F\u0086', '🏆'],  // trophy
  ['\u00F0\u009F\u0097\u0093\u00EF\u00B8\u008F', '🗓️'],
  ['\u00F0\u009F\u008F\u0098\u00EF\u00B8\u008F', '🏘️'],  // houses
  ['\u00F0\u009F\u008E\u00AD', '🎭'],  // masks
  ['\u00F0\u009F\u0093\u008B', '📋'],  // clipboard
  ['\u00F0\u009F\u0093\u008D', '📍'],  // pin
  ['\u00F0\u009F\u0093\u0086', '📆'],
  ['\u00F0\u009F\u0094\u0084', '🔄'],  // refresh
  ['\u00E2\u009C\u0085', '✅'],  // check
  ['\u00E2\u009C\u008D\u00EF\u00B8\u008F', '✍️'],  // writing
  ['\u00E2\u009A\u00A5', '⚥'],  // gender
  ['\u00E2\u0099\u0082', '♂'],  // male
  ['\u00E2\u0099\u0080', '♀'],  // female
  ['\u00F0\u009F\u00A5\u0087', '🥇'],  // gold
  ['\u00F0\u009F\u00A5\u0088', '🥈'],  // silver
  ['\u00F0\u009F\u00A5\u0089', '🥉'],  // bronze
  ['\u00F0\u009F\u00AA\u0098', '🪘'],  // drum
  ['\u00F0\u009F\u008F\u009B\u00EF\u00B8\u008F', '🏛️'],  // building
  ['\u00F0\u009F\u0095\u00B6\u00EF\u00B8\u008F', '🕶️'],  // glasses
  ['\u00F0\u009F\u00A4\u0090', '🤐'],  // zip mouth
  ['\u00F0\u009F\u0093\u00A7', '📧'],  // email
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

console.log('🔧 Correction par remplacements ciblés...\n');

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