const fs = require('fs');
const path = require('path');

// URL Google Apps Script - DÉJÀ CONFIGURÉE
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3mtlER8VU1RfeJlPrv0CMiy-MOdrFioMODyGFt-74fA56rGbbHTak7MLkMyKAdPoF/exec';

console.log('🔧 Correction de App.jsx (comptage via backend)...\n');

// ===== 1. CORRIGER APP.JSX =====
let appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');

const oldLoadStats = `  const loadStats = async () => {
    try {
      const total = await db.detenteurs.count();
      const allDets = await db.detenteurs.toArray();
      const signes = allDets.filter(d => d.signature || d.docUrl).length;
      const allFiles = await db.files.toArray();
      const photos = allFiles.filter(f => f.type === 'photo').length;
      setStats({ total, signes, photos });
    } catch (e) {}
  };`;

const newLoadStats = `  const loadStats = async () => {
    try {
      let total = 0;
      let signes = 0;
      let photos = 0;

      // Essayer le backend d'abord si en ligne
      if (navigator.onLine) {
        try {
          const response = await fetch('https://hwendo-backend.onrender.com/api/detenteurs');
          if (response.ok) {
            const backendDets = await response.json();
            total = backendDets.length;
            signes = backendDets.filter(d => d.consentementSigne).length;
          }
        } catch (e) {
          console.warn('Backend indisponible, utilisation IndexedDB');
        }
      }

      // Fallback sur IndexedDB si backend indisponible
      if (total === 0) {
        total = await db.detenteurs.count();
        const allDets = await db.detenteurs.toArray();
        signes = allDets.filter(d => d.signature || d.docUrl).length;
      }

      // Photos toujours depuis IndexedDB (médias locaux)
      const allFiles = await db.files.toArray();
      photos = allFiles.filter(f => f.type === 'photo').length;

      setStats({ total, signes, photos });
    } catch (e) {
      console.error('Erreur stats:', e);
    }
  };`;

if (appContent.includes(oldLoadStats)) {
  appContent = appContent.replace(oldLoadStats, newLoadStats);
  fs.writeFileSync(path.join(__dirname, 'src/App.jsx'), appContent, 'utf8');
  console.log('✅ App.jsx corrigé (comptage via backend)');
} else {
  console.log('⚠️  App.jsx : pattern non trouvé, vérification nécessaire');
}

// ===== 2. AJOUTER GOOGLE APPS SCRIPT DANS DETENTEURFORM.JSX =====
console.log('\n🔧 Ajout de Google Apps Script dans DetenteurForm.jsx...\n');

let formContent = fs.readFileSync(path.join(__dirname, 'src/components/DetenteurForm.jsx'), 'utf8');

// Vérifier si déjà présent
if (formContent.includes('APPS_SCRIPT_URL')) {
  console.log('✓  DetenteurForm.jsx : Google Apps Script déjà présent');
} else {
  // Ajouter la constante et la fonction après les imports
  const importLine = "import { api } from '../services/api';";
  const insertCode = `import { api } from '../services/api';

// URL Google Apps Script pour la création des consentements
const APPS_SCRIPT_URL = '${APPS_SCRIPT_URL}';

// Fonction pour envoyer les données à Google Apps Script
async function sendToGoogleAppsScript(detenteur) {
  if (!APPS_SCRIPT_URL) {
    console.warn('URL Apps Script non configurée');
    return null;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('nomComplet', detenteur.nomComplet || '');
    formData.append('surnomRituel', detenteur.surnomRituel || '');
    formData.append('age', detenteur.age || '');
    formData.append('sexe', detenteur.sexe || '');
    formData.append('village', detenteur.village || '');
    formData.append('fonctionPalais', detenteur.fonctionPalais || '');
    formData.append('telephone', detenteur.telephone || '');
    formData.append('langue', detenteur.langue || '');
    formData.append('peutParler', detenteur.peutParler ? 'OUI' : 'NON');
    formData.append('peutChanter', detenteur.peutChanter ? 'OUI' : 'NON');
    formData.append('peutEtreFilme', detenteur.peutEtreFilme ? 'OUI' : 'NON');
    formData.append('peutFilmer', detenteur.peutFilmer ? 'OUI' : 'NON');
    formData.append('preterInstrument', detenteur.preterInstrument ? 'OUI' : 'NON');
    formData.append('montrerLieuSacre', detenteur.montrerLieuSacre ? 'OUI' : 'NON');
    formData.append('anonymiser', detenteur.anonymiser ? 'OUI' : 'NON');
    formData.append('nomTraditionnelJamaisEcrit', detenteur.nomTraditionnelJamaisEcrit ? 'OUI' : 'NON');
    formData.append('notes', detenteur.notes || '');
    formData.append('gps', detenteur.gps || '');
    formData.append('dateSignature', new Date().toLocaleDateString('fr-FR'));
    formData.append('lieuSignature', detenteur.lieuSignature || 'OUIDAH');

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('Données envoyées à Google Apps Script');
    return true;
  } catch (error) {
    console.error('Erreur Google Apps Script:', error);
    return null;
  }
}`;

  formContent = formContent.replace(importLine, insertCode);
  console.log('✅ Constante APPS_SCRIPT_URL et fonction ajoutées');

  // Ajouter l'appel à sendToGoogleAppsScript après la synchronisation backend
  const syncPattern = 'await db.detenteurs.update(localId, { synced: true, backendId: result.id });';
  
  if (formContent.includes(syncPattern)) {
    formContent = formContent.replace(
      syncPattern,
      syncPattern + `
          
          // Envoyer à Google Apps Script pour créer le consentement
          try {
            await sendToGoogleAppsScript(detenteur);
            console.log('Consentement envoyé à Google Docs');
          } catch (googleError) {
            console.warn('Erreur envoi Google:', googleError);
          }`
    );
    console.log('✅ Appel sendToGoogleAppsScript ajouté après sync backend');
  } else {
    console.log('⚠️  Pattern de synchronisation backend non trouvé');
    console.log('    Ajout manuel peut être nécessaire');
  }

  fs.writeFileSync(path.join(__dirname, 'src/components/DetenteurForm.jsx'), formContent, 'utf8');
  console.log('✅ DetenteurForm.jsx mis à jour');
}

console.log('\n🎉 Corrections appliquées avec succès !');
console.log('\n📋 Prochaines étapes :');
console.log('   1. npm run dev');
console.log('   2. Créer un nouveau détenteur');
console.log('   3. Vérifier le comptage dans la sidebar');
console.log('   4. Vérifier Google Drive');