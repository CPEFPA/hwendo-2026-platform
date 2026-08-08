const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des statistiques (sync complète)...\n');

let appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');

// Ancienne fonction loadStats
const oldLoadStats = `  const loadStats = async () => {
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

// Nouvelle fonction : stats synchronisées depuis le backend + médias locaux
const newLoadStats = `  const loadStats = async () => {
    try {
      let total = 0;
      let signes = 0;
      let photos = 0;
      let localPhotos = 0;
      let localSignatures = 0;

      // Toujours charger depuis le backend si en ligne
      if (navigator.onLine) {
        try {
          const response = await fetch('https://hwendo-backend.onrender.com/api/detenteurs');
          if (response.ok) {
            const backendDets = await response.json();
            total = backendDets.length;
            signes = backendDets.filter(d => d.consentementSigne).length;
            console.log('Stats backend:', { total, signes });
          }
        } catch (e) {
          console.warn('Backend indisponible');
        }
      }

      // Fallback sur IndexedDB si backend vide ou indisponible
      if (total === 0) {
        total = await db.detenteurs.count();
        const allDets = await db.detenteurs.toArray();
        signes = allDets.filter(d => d.signature || d.docUrl).length;
      }

      // Compter les médias LOCAUX (photos et signatures dans IndexedDB)
      try {
        const allDets = await db.detenteurs.toArray();
        localPhotos = 0;
        localSignatures = 0;
        
        allDets.forEach(d => {
          // Photos
          if (d.photos && Array.isArray(d.photos) && d.photos.length > 0) {
            localPhotos += d.photos.length;
          }
          // Signatures
          if (d.signature && d.signature.startsWith('data:image')) {
            localSignatures++;
          }
        });
        
        // Aussi chercher dans db.files (ancienne structure)
        const allFiles = await db.files.toArray();
        const filePhotos = allFiles.filter(f => f.type === 'photo').length;
        photos = localPhotos + filePhotos;
        
        console.log('Stats médias locaux:', { localPhotos, filePhotos, localSignatures });
      } catch (e) {
        console.warn('Erreur comptage médias:', e);
        const allFiles = await db.files.toArray();
        photos = allFiles.filter(f => f.type === 'photo').length;
      }

      setStats({ 
        total, 
        signes, 
        photos,
        localSignatures
      });
    } catch (e) {
      console.error('Erreur stats:', e);
    }
  };`;

if (appContent.includes(oldLoadStats)) {
  appContent = appContent.replace(oldLoadStats, newLoadStats);
  console.log('✅ Fonction loadStats mise à jour');
} else {
  console.log('⚠️  Fonction loadStats non trouvée (structure différente)');
}

// Mettre à jour l'affichage des statistiques dans le dashboard
const oldStatCard = `              <div className="stat-card">
                <div className="stat-icon">{icon.camera}</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos capturées</div>
              </div>`;

const newStatCard = `              <div className="stat-card">
                <div className="stat-icon">{icon.camera}</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos capturées</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{icon.pen}</div>
                <div className="stat-value">{stats.localSignatures || 0}</div>
                <div className="stat-label">Signatures locales</div>
              </div>`;

if (appContent.includes(oldStatCard)) {
  appContent = appContent.replace(oldStatCard, newStatCard);
  console.log('✅ Nouvelle carte "Signatures locales" ajoutée');
}

fs.writeFileSync(path.join(__dirname, 'src/App.jsx'), appContent, 'utf8');
console.log('\n🎉 Statistiques synchronisées avec succès !');