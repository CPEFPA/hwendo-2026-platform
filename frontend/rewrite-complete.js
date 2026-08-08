const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
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
          <h1>{"\u{1F3B5}"} HWENDO</h1>
          <p>Mission 2026</p>
          <p style={{fontSize: '9px', marginTop: '5px', opacity: 0.6}}>Patrimoine Sonore</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="icon">{"\u{1F4CA}"}</span> Tableau de bord
            </button>
          </li>
          <li>
            <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
              <span className="icon">{"\u{1F4CA}"}</span> Statistiques
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">{"\u{1F4DD}"}</span> Nouveau d{"\u00e9"}tenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">{"\u{1F465}"}</span> D{"\u00e9"}tenteurs ({stats.total})
            </button>
          </li>
          {installPrompt && !isInstalled && (
            <li style={{marginTop: '20px'}}>
              <button onClick={handleInstall} style={{background: 'linear-gradient(135deg, #DAA520, #C65D2C)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold'}}>
                <span className="icon">{"\u{1F4F1}"}</span> Installer l'app
              </button>
            </li>
          )}
          {isInstalled && (
            <li style={{marginTop: '20px'}}>
              <div style={{padding: '12px', background: 'rgba(72, 187, 120, 0.2)', borderRadius: '8px', textAlign: 'center', fontSize: '12px'}}>
                {"\u2705"} App install{"\u00e9"}e
              </div>
            </li>
          )}
          {needRefresh && (
            <li style={{marginTop: '10px'}}>
              <button onClick={() => updateServiceWorker(true)} style={{background: '#4299e1', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontSize: '12px'}}>
                {"\u{1F504}"} Mise {"\u00e0"} jour disponible
              </button>
            </li>
          )}
          <li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button className={view === 'politique' ? 'active' : ''} onClick={() => setView('politique')}>
              <span className="icon">{"\u{1F512}"}</span> Confidentialit{"\u00e9"}
            </button>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>{"\u{1F4CA}"} Tableau de bord</h2>
              <p>Vue d'ensemble de la mission de collecte patrimoniale</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">{"\u{1F465}"}</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">D{"\u00e9"}tenteurs enregistr{"\u00e9"}s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{"\u270D\uFE0F"}</div>
                <div className="stat-value">{stats.signes}</div>
                <div className="stat-label">Consentements sign{"\u00e9"}s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{"\u{1F4F8}"}</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos captur{"\u00e9"}es</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{"\u{1F3AF}"}</div>
                <div className="stat-value">{stats.total > 0 ? Math.round((stats.signes / stats.total) * 100) : 0}%</div>
                <div className="stat-label">Taux de signature</div>
              </div>
            </div>
            <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
              <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>{"\u{1F3B5}"} Bienvenue dans HWENDO 2026</h3>
              <p style={{color: 'var(--gris)', lineHeight: '1.6'}}>
                Cette plateforme vous accompagne dans votre mission de sauvegarde du patrimoine musical
                du royaume Hwendo au Palais Royal DADA DA AGBO HOUNON HOUNAN.
              </p>
              <p style={{color: 'var(--gris)', lineHeight: '1.6', marginTop: '10px'}}>
                <strong>Commencez par :</strong>
              </p>
              <ul style={{color: 'var(--gris)', lineHeight: '1.8', marginLeft: '20px'}}>
                <li>{"\u{1F4DD}"} Cr{"\u00e9"}er un nouveau d{"\u00e9"}tenteur</li>
                <li>{"\u{1F4F8}"} Capturer des photos et m{"\u00e9"}dias</li>
                <li>{"\u270D\uFE0F"} Obtenir le consentement sign{"\u00e9"}</li>
                <li>{"\u{1F4E5}"} T{"\u00e9"}l{"\u00e9"}charger le PDF {"\u00e0"} remettre</li>
              </ul>
            </div>
          </>
        )}
        {view === 'stats' && (
          <>
            <div className="page-header">
              <h2>{"\u{1F4CA}"} Statistiques de l'{"\u00e9"}v{"\u00e9"}nement</h2>
              <p>Analyse en temps r{"\u00e9"}el de la mission de collecte</p>
            </div>
            <Statistiques />
          </>
        )}
        {view === 'form' && (
          <>
            <div className="page-header">
              <h2>{"\u{1F4DD}"} Nouveau d{"\u00e9"}tenteur</h2>
              <p>Enregistrer un nouveau d{"\u00e9"}tenteur de savoirs traditionnels</p>
            </div>
            <DetenteurForm onSaved={() => { loadStats(); setView('list'); }} />
          </>
        )}
        {view === 'list' && (
          <>
            <div className="page-header">
              <h2>{"\u{1F465}"} D{"\u00e9"}tenteurs enregistr{"\u00e9"}s</h2>
              <p>Liste compl{"\u00e8"}te des personnes ayant particip{"\u00e9"} {"\u00e0"} la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
        {view === 'politique' && (
          <>
            <div className="page-header">
              <h2>{"\u{1F512}"} Politique de confidentialit{"\u00e9"}</h2>
              <p>Engagement de protection des donn{"\u00e9"}es et des savoirs traditionnels</p>
            </div>
            <PolitiqueConfidentialite />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
`;

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('DONE: App.jsx rewritten with Unicode escapes');