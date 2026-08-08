const fs = require('fs');
const path = require('path');

console.log('🔧 Correction de sendToGoogleAppsScript (envoi JSON)...\n');

let formContent = fs.readFileSync(path.join(__dirname, 'src/components/DetenteurForm.jsx'), 'utf8');

// Ancienne fonction (form-urlencoded)
const oldFunction = `// Fonction pour envoyer les données à Google Apps Script
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

// Nouvelle fonction (JSON avec structure attendue)
const newFunction = `// Fonction pour envoyer les données à Google Apps Script (format JSON)
async function sendToGoogleAppsScript(detenteur, signature, photos) {
  if (!APPS_SCRIPT_URL) {
    console.warn('URL Apps Script non configurée');
    return null;
  }

  try {
    // Structure attendue par le script Google :
    // { detenteur: {...}, signature: "...", photos: [...] }
    const payload = {
      detenteur: {
        nomComplet: detenteur.nomComplet || '',
        surnomRituel: detenteur.surnomRituel || '',
        age: detenteur.age || '',
        sexe: detenteur.sexe || '',
        village: detenteur.village || '',
        fonctionPalais: detenteur.fonctionPalais || '',
        telephone: detenteur.telephone || '',
        langue: detenteur.langue || '',
        peutParler: detenteur.peutParler ? 'OUI' : 'NON',
        peutChanter: detenteur.peutChanter ? 'OUI' : 'NON',
        peutEtreFilme: detenteur.peutEtreFilme ? 'OUI' : 'NON',
        peutFilmer: detenteur.peutFilmer ? 'OUI' : 'NON',
        preterInstrument: detenteur.preterInstrument ? 'OUI' : 'NON',
        montrerLieuSacre: detenteur.montrerLieuSacre ? 'OUI' : 'NON',
        anonymiser: detenteur.anonymiser ? 'OUI' : 'NON',
        nomTraditionnelJamaisEcrit: detenteur.nomTraditionnelJamaisEcrit ? 'OUI' : 'NON',
        notes: detenteur.notes || '',
        gps: detenteur.gps || '',
        dateSignature: new Date().toLocaleDateString('fr-FR'),
        lieuSignature: detenteur.lieuSignature || 'OUIDAH'
      },
      signature: signature || null,
      photos: photos || []
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Consentement créé dans Google Docs:', result);
      return result;
    } else {
      console.warn('Erreur Google Apps Script:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Erreur envoi Google Apps Script:', error);
    return null;
  }
}`;

if (formContent.includes(oldFunction)) {
  formContent = formContent.replace(oldFunction, newFunction);
  console.log('✅ Fonction sendToGoogleAppsScript remplacée (JSON)');
} else {
  console.log('⚠️  Ancienne fonction non trouvée, recherche alternative...');
  
  // Essayer de trouver et remplacer par pattern plus flexible
  const funcStart = formContent.indexOf('async function sendToGoogleAppsScript');
  if (funcStart !== -1) {
    const funcEnd = formContent.indexOf('}', formContent.indexOf('}', funcStart) + 1) + 1;
    // Trouver la fin réelle de la fonction (accolade fermante au niveau 0)
    let braceCount = 0;
    let realEnd = funcStart;
    for (let i = funcStart; i < formContent.length; i++) {
      if (formContent[i] === '{') braceCount++;
      if (formContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          realEnd = i + 1;
          break;
        }
      }
    }
    
    formContent = formContent.substring(0, funcStart) + newFunction + formContent.substring(realEnd);
    console.log('✅ Fonction remplacée via recherche flexible');
  } else {
    console.log('❌ Fonction introuvable');
  }
}

// Mettre à jour l'appel pour passer signature et photos
const oldCall = `// Envoyer à Google Apps Script pour créer le consentement
          try {
            await sendToGoogleAppsScript(detenteur);
            console.log('Consentement envoyé à Google Docs');
          } catch (googleError) {
            console.warn('Erreur envoi Google:', googleError);
          }`;

const newCall = `// Envoyer à Google Apps Script pour créer le consentement
          try {
            const googleResult = await sendToGoogleAppsScript(detenteur, signature, photos);
            if (googleResult && googleResult.success) {
              console.log('Consentement créé dans Google Docs');
              // Sauvegarder le lien du document Google
              if (googleResult.docUrl) {
                await db.detenteurs.update(localId, { docUrl: googleResult.docUrl });
              }
            }
          } catch (googleError) {
            console.warn('Erreur envoi Google:', googleError);
          }`;

if (formContent.includes(oldCall)) {
  formContent = formContent.replace(oldCall, newCall);
  console.log('✅ Appel sendToGoogleAppsScript mis à jour (avec signature et photos)');
} else {
  console.log('⚠️  Appel non trouvé, vérification nécessaire');
}

fs.writeFileSync(path.join(__dirname, 'src/components/DetenteurForm.jsx'), formContent, 'utf8');

console.log('\n🎉 Correction appliquée !');
console.log('📋 Le script envoie maintenant du JSON avec la structure attendue.');