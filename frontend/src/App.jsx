import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { db } from './db/localDB';
import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';
import Statistiques from './components/Statistiques';

function App() {
  // Hook PWA pour l'installation
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Vérifier si déjà installée
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

  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, signes: 0, photos: 0 });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const total = await db.detenteurs.count();
      const allDets = await db.detenteurs.toArray();
      const signes = allDets.filter(d => d.signature || d.docUrl).length;
      const allFiles = await db.files.toArray();
      const photos = allFiles.filter(f => f.type === 'photo').length;
      setStats({ total, signes, photos });
    } catch (e) {}
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>ðŸŽµ HWENDO</h1>
          <p>Mission 2026</p>
          <p style={{fontSize: '9px', marginTop: '5px', opacity: 0.6}}>Patrimoine Sonore</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="icon">ðŸ“Š</span> Tableau de bord
            </button>
          </li>
          <li>
            <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
              <span className="icon">ðŸ“Š</span> Statistiques
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">ðŸ“</span> Nouveau dÃ©tenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">ðŸ‘¥</span> DÃ©tenteurs ({stats.total})
            </button>
          </li>
          <li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button className={view === 'politique' ? 'active' : ''} onClick={() => setView('politique')}>
              <span className="icon">ðŸ”’</span> ConfidentialitÃ©
            </button>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>ðŸ“Š Tableau de bord</h2>
              <p>Vue d'ensemble de la mission de collecte patrimoniale</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">ðŸ‘¥</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">DÃ©tenteurs enregistrÃ©s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">âœï¸</div>
                <div className="stat-value">{stats.signes}</div>
                <div className="stat-label">Consentements signÃ©s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">ðŸ“¸</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos capturÃ©es</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">ðŸŽ¯</div>
                <div className="stat-value">{stats.total > 0 ? Math.round((stats.signes / stats.total) * 100) : 0}%</div>
                <div className="stat-label">Taux de signature</div>
              </div>
            </div>
            <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
              <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸŽµ Bienvenue dans HWENDO 2026</h3>
              <p style={{color: 'var(--gris)', lineHeight: '1.6'}}>
                Cette plateforme vous accompagne dans votre mission de sauvegarde du patrimoine musical 
                du royaume Hwendo au Palais Royal DADA DA AGBO HOUNON HOUNAN.
              </p>
              <p style={{color: 'var(--gris)', lineHeight: '1.6', marginTop: '10px'}}>
                <strong>Commencez par :</strong>
              </p>
              <ul style={{color: 'var(--gris)', lineHeight: '1.8', marginLeft: '20px'}}>
                <li>ðŸ“ CrÃ©er un nouveau dÃ©tenteur</li>
                <li>ðŸ“¸ Capturer des photos et mÃ©dias</li>
                <li>âœï¸ Obtenir le consentement signÃ©</li>
                <li>ðŸ“¥ TÃ©lÃ©charger le PDF Ã  remettre</li>
              </ul>
            </div>
          </>
        )}
        {view === 'form' && (
          <>
            <div className="page-header">
              <h2>ðŸ“ Nouveau dÃ©tenteur</h2>
              <p>Enregistrer un nouveau dÃ©tenteur de savoirs traditionnels</p>
            </div>
            <DetenteurForm onSaved={() => { loadStats(); setView('list'); }} />
          </>
        )}
        {view === 'list' && (
          <>
            <div className="page-header">
              <h2>ðŸ‘¥ DÃ©tenteurs enregistrÃ©s</h2>
              <p>Liste complÃ¨te des personnes ayant participÃ© Ã  la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
        {view === 'stats' && (
          <>
            <div className="page-header">
              <h2>ðŸ“Š Statistiques de l'Ã©vÃ©nement</h2>
              <p>Analyse en temps rÃ©el de la mission de collecte</p>
            </div>
            <Statistiques />
          </>
        )}
        {view === 'politique' && (
          <>
            <div className="page-header">
              <h2>ðŸ”’ Politique de confidentialitÃ©</h2>
              <p>Engagement de protection des donnÃ©es et des savoirs traditionnels</p>
            </div>
            <PolitiqueConfidentialite />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

