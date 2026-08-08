const fs = require('fs');

// Contenu avec codes Unicode JavaScript (garanti sans corruption)
const content = `import { useState, useEffect } from 'react';
import { db } from './db/localDB';
import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';
import Statistiques from './components/Statistiques';
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';

function App() {
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
              <span className="icon">{"\u{1F4DD}"}</span> Nouveau {"\u00e9"}tenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">{"\u{1F465}"}</span> D{"\u00e9"}tenteurs ({stats.total})
            </button>
          </li>
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
console.log('OK: App.jsx rewritten');

// Check index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('charset="UTF-8"')) {
  html = html.replace('<head>', '<head>\n    <meta charset="UTF-8">');
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('OK: index.html charset added');
} else {
  console.log('OK: index.html already has charset');
}