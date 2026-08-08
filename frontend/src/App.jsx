import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { db } from './db/localDB';
import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';
import Statistiques from './components/Statistiques';

function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, signes: 0, photos: 0 });

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
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
  };

  const icon = {
    music: String.fromCodePoint(0x1F3B5),
    chart: String.fromCodePoint(0x1F4CA),
    memo: String.fromCodePoint(0x1F4DD),
    people: String.fromCodePoint(0x1F465),
    lock: String.fromCodePoint(0x1F512),
    phone: String.fromCodePoint(0x1F4F1),
    check: String.fromCodePoint(0x2705),
    refresh: String.fromCodePoint(0x1F504),
    camera: String.fromCodePoint(0x1F4F8),
    target: String.fromCodePoint(0x1F3AF),
    pen: String.fromCodePoint(0x270D) + String.fromCodePoint(0xFE0F),
    download: String.fromCodePoint(0x1F4E5)
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>{icon.music} HWENDO</h1>
          <p>Mission 2026</p>
          <p style={{fontSize: '9px', marginTop: '5px', opacity: 0.6}}>Patrimoine Sonore</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="icon">{icon.chart}</span> Tableau de bord
            </button>
          </li>
          <li>
            <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
              <span className="icon">{icon.chart}</span> Statistiques
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">{icon.memo}</span> Nouveau détenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">{icon.people}</span> Détenteurs ({stats.total})
            </button>
          </li>
          {installPrompt && !isInstalled && (
            <li style={{marginTop: '20px'}}>
              <button onClick={handleInstall} style={{background: 'linear-gradient(135deg, #DAA520, #C65D2C)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold'}}>
                <span className="icon">{icon.phone}</span> Installer l'app
              </button>
            </li>
          )}
          {isInstalled && (
            <li style={{marginTop: '20px'}}>
              <div style={{padding: '12px', background: 'rgba(72, 187, 120, 0.2)', borderRadius: '8px', textAlign: 'center', fontSize: '12px'}}>
                {icon.check} App installée
              </div>
            </li>
          )}
          {needRefresh && (
            <li style={{marginTop: '10px'}}>
              <button onClick={() => updateServiceWorker(true)} style={{background: '#4299e1', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontSize: '12px'}}>
                {icon.refresh} Mise à jour disponible
              </button>
            </li>
          )}
          <li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button className={view === 'politique' ? 'active' : ''} onClick={() => setView('politique')}>
              <span className="icon">{icon.lock}</span> Confidentialité
            </button>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>{icon.chart} Tableau de bord</h2>
              <p>Vue d'ensemble de la mission de collecte patrimoniale</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">{icon.people}</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Détenteurs enregistrés</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{icon.pen}</div>
                <div className="stat-value">{stats.signes}</div>
                <div className="stat-label">Consentements signés</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{icon.camera}</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos capturées</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{icon.pen}</div>
                <div className="stat-value">{stats.localSignatures || 0}</div>
                <div className="stat-label">Signatures locales</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{icon.target}</div>
                <div className="stat-value">{stats.total > 0 ? Math.round((stats.signes / stats.total) * 100) : 0}%</div>
                <div className="stat-label">Taux de signature</div>
              </div>
            </div>
            <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
              <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>{icon.music} Bienvenue dans HWENDO 2026</h3>
              <p style={{color: 'var(--gris)', lineHeight: '1.6'}}>
                Cette plateforme vous accompagne dans votre mission de sauvegarde du patrimoine musical
                du royaume Hwendo au Palais Royal DADA DA AGBO HOUNON HOUNAN.
              </p>
              <p style={{color: 'var(--gris)', lineHeight: '1.6', marginTop: '10px'}}>
                <strong>Commencez par :</strong>
              </p>
              <ul style={{color: 'var(--gris)', lineHeight: '1.8', marginLeft: '20px'}}>
                <li>{icon.memo} Créer un nouveau détenteur</li>
                <li>{icon.camera} Capturer des photos et médias</li>
                <li>{icon.pen} Obtenir le consentement signé</li>
                <li>{icon.download} Télécharger le PDF à remettre</li>
              </ul>
            </div>
          </>
        )}
        {view === 'stats' && (
          <>
            <div className="page-header">
              <h2>{icon.chart} Statistiques de l'événement</h2>
              <p>Analyse en temps réel de la mission de collecte</p>
            </div>
            <Statistiques />
          </>
        )}
        {view === 'form' && (
          <>
            <div className="page-header">
              <h2>{icon.memo} Nouveau détenteur</h2>
              <p>Enregistrer un nouveau détenteur de savoirs traditionnels</p>
            </div>
            <DetenteurForm onSaved={() => { loadStats(); setView('list'); }} />
          </>
        )}
        {view === 'list' && (
          <>
            <div className="page-header">
              <h2>{icon.people} Détenteurs enregistrés</h2>
              <p>Liste complète des personnes ayant participé à la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
        {view === 'politique' && (
          <>
            <div className="page-header">
              <h2>{icon.lock} Politique de confidentialité</h2>
              <p>Engagement de protection des données et des savoirs traditionnels</p>
            </div>
            <PolitiqueConfidentialite />
          </>
        )}
      </main>
    </div>
  );
}

export default App;