const fs = require('fs');
const path = require('path');

// Table de correspondance avec codes hexadécimaux (100% fiable)
// Format: [sequence_corrompue, codepoint_correct]
const replacements = [
  // Accents francais
  ['\u00C3\u00A9', '\u00E9'],  // Ã© -> é
  ['\u00C3\u00A8', '\u00E8'],  // Ã¨ -> è
  ['\u00C3\u00A0', '\u00E0'],  // Ã  -> à
  ['\u00C3\u00B4', '\u00F4'],  // Ã´ -> ô
  ['\u00C3\u00B9', '\u00F9'],  // Ã¹ -> ù
  ['\u00C3\u00AE', '\u00EE'],  // Ã® -> î
  ['\u00C3\u00AF', '\u00EF'],  // Ã¯ -> ï
  ['\u00C3\u00BB', '\u00FB'],  // Ã» -> û
  ['\u00C3\u00A7', '\u00E7'],  // Ã§ -> ç
  ['\u00C3\u00A2', '\u00E2'],  // Ã¢ -> â
  ['\u00C3\u00AA', '\u00EA'],  // Ãª -> ê
  ['\u00C3\u00AB', '\u00EB'],  // Ã« -> ë
  ['\u00C3\u0089', '\u00C9'],  // Ã‰ -> É
  ['\u00C3\u0088', '\u00C8'],  // Ãˆ -> È
  ['\u00C3\u0080', '\u00C0'],  // Ã  -> À
  ['\u00C3\u0094', '\u00D4'],  // Ã" -> Ô
  ['\u00C3\u009B', '\u00DB'],  // Ã› -> Û
  ['\u00C3\u0099', '\u00D9'],  // Ã™ -> Ù
  ['\u00C3\u0087', '\u00C7'],  // Ã‡ -> Ç
  ['\u00C3\u008E', '\u00CE'],  // ÃŽ -> Î
  ['\u00C2\u00A0', '\u0020'],  // Â  -> espace
  ['\u00C2\u00B0', '\u00B0'],  // Â° -> °
  ['\u00C2\u00A9', '\u00A9'],  // Â© -> ©
  ['\u00C2\u00AE', '\u00AE'],  // Â® -> ®
  ['\u00C2\u00AB', '\u00AB'],  // Â« -> «
  ['\u00C2\u00BB', '\u00BB'],  // Â» -> »
  ['\u00E2\u0080\u0099', '\u0027'],  // â€™ -> '
  ['\u00E2\u0080\u0098', '\u0027'],  // â€˜ -> '
  ['\u00E2\u0080\u009C', '\u0022'],  // â€œ -> "
  ['\u00E2\u0080\u009D', '\u0022'],  // â€ -> "
  ['\u00E2\u0080\u0094', '\u002D'],  // â€” -> -
  ['\u00E2\u0080\u0093', '\u002D'],  // â€“ -> -
  ['\u00C5\u0093', '\u0153'],  // Å“ -> œ
  ['\u00C5\u0092', '\u0152'],  // Å" -> Œ
  
  // Emojis (sequences UTF-8 corrompues)
  ['\u00F0\u009F\u008E\u00B5', '\u{1F3B5}'],  // 🎵
  ['\u00F0\u009F\u0093\u008A', '\u{1F4CA}'],  // 📊
  ['\u00F0\u009F\u0093\u009D', '\u{1F4DD}'],  // 📝
  ['\u00F0\u009F\u0091\u00A5', '\u{1F465}'],  // 👥
  ['\u00F0\u009F\u0094\u0092', '\u{1F512}'],  // 🔒
  ['\u00F0\u009F\u0093\u00B1', '\u{1F4F1}'],  // 📱
  ['\u00F0\u009F\u0093\u00B8', '\u{1F4F8}'],  // 📸
  ['\u00F0\u009F\u008E\u00A5', '\u{1F3A5}'],  // 🎥
  ['\u00F0\u009F\u008E\u00A4', '\u{1F3A4}'],  // 🎤
  ['\u00F0\u009F\u008E\u00AF', '\u{1F3AF}'],  // 🎯
  ['\u00F0\u009F\u0093\u00A5', '\u{1F4E5}'],  // 📥
  ['\u00F0\u009F\u0093\u00A7', '\u{1F4E7}'],  // 📧
  ['\u00F0\u009F\u0093\u0085', '\u{1F4C5}'],  // 📅
  ['\u00F0\u009F\u0093\u0086', '\u{1F4C6}'],  // 📆
  ['\u00F0\u009F\u0093\u008B', '\u{1F4CB}'],  // 📋
  ['\u00F0\u009F\u0093\u008D', '\u{1F4CD}'],  // 📍
  ['\u00F0\u009F\u0093\u00A6', '\u{1F4E6}'],  // 📦
  ['\u00F0\u009F\u0094\u0084', '\u{1F504}'],  // 🔄
  ['\u00F0\u009F\u008F\u0086', '\u{1F3C6}'],  // 🏆
  ['\u00F0\u009F\u008F\u009B\u00EF\u00B8\u008F', '\u{1F3DB}\uFE0F'],  // 🏛️
  ['\u00F0\u009F\u008F\u009B', '\u{1F3DB}'],  // 🏛
  ['\u00F0\u009F\u0097\u00BA\u00EF\u00B8\u008F', '\u{1F5FA}\uFE0F'],  // 🗺️
  ['\u00F0\u009F\u0097\u00BA', '\u{1F5FA}'],  // 🗺
  ['\u00F0\u009F\u0095\u00B6\u00EF\u00B8\u008F', '\u{1F576}\uFE0F'],  // 🕶️
  ['\u00F0\u009F\u0095\u00B6', '\u{1F576}'],  // 🕶
  ['\u00F0\u009F\u00A5\u0087', '\u{1F947}'],  // 🥇
  ['\u00F0\u009F\u00A5\u0088', '\u{1F948}'],  // 🥈
  ['\u00F0\u009F\u00A5\u0089', '\u{1F949}'],  // 🥉
  ['\u00F0\u009F\u008E\u00AD', '\u{1F3AD}'],  // 🎭
  ['\u00F0\u009F\u00AA\u0098', '\u{1FA98}'],  // 🪘
  ['\u00F0\u009F\u00A4\u0090', '\u{1F910}'],  // 🤐
  
  // Symboles
  ['\u00E2\u009C\u0085', '\u2705'],  // ✅
  ['\u00E2\u009C\u008D\u00EF\u00B8\u008F', '\u270D\uFE0F'],  // ✍️
  ['\u00E2\u009C\u008D', '\u270D'],  // ✍
  ['\u00E2\u009A\u00A5', '\u26A5'],  // ⚥
  ['\u00E2\u0099\u0082', '\u2642'],  // ♂
  ['\u00E2\u0099\u0080', '\u2640'],  // ♀
  ['\u00E2\u009C\u0093', '\u2713'],  // ✓
  ['\u00E2\u009C\u0097', '\u2717'],  // ✗
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
  'src/components/SignatureCanvas.jsx',
  'src/App.jsx',
  'src/main.jsx',
  'src/styles.css',
  'src/db/localDB.js',
  'src/services/api.js'
];

console.log('🔧 Correction UTF-8 finale avec codes hexadécimaux...\n');

let totalFixed = 0;
let totalReplacements = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  ${filePath} (n'existe pas)`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;
    
    replacements.forEach(([bad, good]) => {
      while (content.includes(bad)) {
        content = content.replace(bad, good);
        fileReplacements++;
      }
    });
    
    if (fileReplacements > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath} (${fileReplacements} remplacements)`);
      totalFixed++;
      totalReplacements += fileReplacements;
    } else {
      console.log(`✓  ${filePath} (déjà OK)`);
    }
  } catch (e) {
    console.log(`❌ ${filePath} : ${e.message}`);
  }
});

console.log(`\n🎉 Terminé !`);
console.log(`📊 ${totalFixed} fichiers corrigés`);
console.log(`🔄 ${totalReplacements} remplacements effectués`);