const fs = require('fs');
const path = require('path');

console.log('🔧 Optimisation du bouton Réinitialiser...\n');

let content = fs.readFileSync(path.join(__dirname, 'src/components/DetenteurList.jsx'), 'utf8');

// Ancienne logique : suppression 1 par 1
const oldReset = `      // 2. Vider le backend si en ligne
      if (navigator.onLine) {
        try {
          const backendDets = await api.getDetenteurs();
          for (const d of backendDets) {
            try {
              await fetch(API_BASE + '/detenteurs/' + d.id, { method: 'DELETE' });
            } catch (e) {
              console.warn('Erreur suppression backend pour', d.id, e);
              backendOk = false;
            }
          }
          console.log('Backend vidé:', backendDets.length, 'détenteurs supprimés');
        } catch (e) {
          console.warn('Erreur lecture backend:', e);
          backendOk = false;
        }
      }`;

// Nouvelle logique : suppression en une seule requête
const newReset = `      // 2. Vider le backend si en ligne (une seule requête DELETE)
      if (navigator.onLine) {
        try {
          const response = await fetch(API_BASE + '/detenteurs', { method: 'DELETE' });
          if (response.ok) {
            const result = await response.json();
            console.log('Backend vidé:', result.count, 'détenteurs supprimés');
          } else {
            console.warn('Erreur suppression backend:', response.status);
            backendOk = false;
          }
        } catch (e) {
          console.warn('Erreur suppression backend:', e);
          backendOk = false;
        }
      }`;

if (content.includes(oldReset)) {
  content = content.replace(oldReset, newReset);
  fs.writeFileSync(path.join(__dirname, 'src/components/DetenteurList.jsx'), content, 'utf8');
  console.log('✅ Bouton Réinitialiser optimisé (suppression en masse)');
} else {
  console.log('⚠️  Ancien pattern non trouvé');
}