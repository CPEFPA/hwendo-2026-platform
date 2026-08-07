const fs = require('fs');

// URL de votre script Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt361jCljRmwDNhbfATncABZCYQMWQrn2vTBxU8cK6KwF9ldF6MiGBZyo14VB2vhNt/exec';

// 1. Mettre à jour la base de données pour stocker l'URL du document
fs.writeFileSync('src/db/localDB.js', `import Dexie from 'dexie';

export const db = new Dexie('HWENDO2026DB');

db.version(1).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus, docUrl'
});

db.version(2).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus, docUrl',
  files: '++id, detenteurId, type, name'
});
`);

// 2. Ajouter une fonction dans api.js pour appeler Apps Script
const apiContent = fs.readFileSync('src/services/api.js', 'utf8');
const newApiContent = apiContent.replace(
  'export const api = {',
  `export const APPS_SCRIPT_URL = '${APPS_SCRIPT_URL}';

export const api = {
  async generateConsentementDoc(detenteur, signature) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detenteur, signature })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur génération doc:', error);
      return { success: false, error: error.message };
    }
  },
`
);
fs.writeFileSync('src/services/api.js', newApiContent);

// 3. Mettre à jour le formulaire pour générer le doc
const formContent = fs.readFileSync('src/components/DetenteurForm.jsx', 'utf8');
const newFormContent = formContent
  .replace(
    'import { api } from \'../services/api\';',
    'import { api } from \'../services/api\';'
  )
  .replace(
    /const data = \{ \.\.\.form, age: form\.age \? parseInt\(form\.age\) : null, signature \};\s+const id = await db\.detenteurs\.add\(\{ \.\.\.data, syncStatus: 'pending' \}\);\s+setMsg\('✅ Sauvegardé localement !'\);/,
    `const data = { ...form, age: form.age ? parseInt(form.age) : null, signature };
    const id = await db.detenteurs.add({ ...data, syncStatus: 'pending' });
    setMsg('✅ Sauvegardé localement ! Génération du document...');
    
    // Générer le document de consentement
    const docResult = await api.generateConsentementDoc(data, signature);
    let docUrl = null;
    if (docResult.success) {
      docUrl = docResult.docUrl;
      await db.detenteurs.update(id, { docUrl, syncStatus: 'synced' });
      setMsg('✅ Document de consentement généré !');
    } else {
      setMsg('⚠️ Sauvegardé mais document non généré');
    }`
  );

fs.writeFileSync('src/components/DetenteurForm.jsx', newFormContent);

// 4. Mettre à jour la liste pour afficher le lien du document
const listContent = fs.readFileSync('src/components/DetenteurList.jsx', 'utf8');
const newListContent = listContent.replace(
  /<p><b>Âge:<\/b> \{d\.age \|\| '\?'\}<\/p>/,
  `<p><b>Âge:</b> {d.age || '?'}</p>
            {d.docUrl && (
              <a href={d.docUrl} target="_blank" rel="noopener noreferrer" 
                style={{display:'inline-block', marginTop:'10px', padding:'5px 10px', background:'#4299e1', color:'white', textDecoration:'none', borderRadius:'4px', fontSize:'12px'}}>
                📄 Voir le consentement
              </a>
            )}`
);
fs.writeFileSync('src/components/DetenteurList.jsx', newListContent);

console.log('🎉 Connexion à Google Docs configurée !');
