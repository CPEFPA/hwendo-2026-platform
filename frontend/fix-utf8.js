const fs = require('fs');
const path = require('path');

console.log('🔧 Réécriture complète des fichiers en UTF-8...');

// ============ APP.JSX ============
const appJsx = import { useState, useEffect } from 'react';
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
          <h1>\u{1F3B5} HWENDO</h1>
          <p>Mission 2026</p>
          <p style={{fontSize: '9px', marginTop: '5px', opacity: 0.6}}>Patrimoine Sonore</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="icon">\u{1F4CA}</span> Tableau de bord
            </button>
          </li>
          <li>
            <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
              <span className="icon">\u{1F4CA}</span> Statistiques
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">\u{1F4DD}</span> Nouveau d\u00e9tenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">\u{1F465}</span> D\u00e9tenteurs ({stats.total})
            </button>
          </li>
          <li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button className={view === 'politique' ? 'active' : ''} onClick={() => setView('politique')}>
              <span className="icon">\u{1F512}</span> Confidentialit\u00e9
            </button>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>\u{1F4CA} Tableau de bord</h2>
              <p>Vue d'ensemble de la mission de collecte patrimoniale</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">\u{1F465}</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">D\u00e9tenteurs enregistr\u00e9s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">\u270D\uFE0F</div>
                <div className="stat-value">{stats.signes}</div>
                <div className="stat-label">Consentements sign\u00e9s</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">\u{1F4F8}</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos captur\u00e9es</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">\u{1F3AF}</div>
                <div className="stat-value">{stats.total > 0 ? Math.round((stats.signes / stats.total) * 100) : 0}%</div>
                <div className="stat-label">Taux de signature</div>
              </div>
            </div>
            <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
              <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>\u{1F3B5} Bienvenue dans HWENDO 2026</h3>
              <p style={{color: 'var(--gris)', lineHeight: '1.6'}}>
                Cette plateforme vous accompagne dans votre mission de sauvegarde du patrimoine musical
                du royaume Hwendo au Palais Royal DADA DA AGBO HOUNON HOUNAN.
              </p>
              <p style={{color: 'var(--gris)', lineHeight: '1.6', marginTop: '10px'}}>
                <strong>Commencez par :</strong>
              </p>
              <ul style={{color: 'var(--gris)', lineHeight: '1.8', marginLeft: '20px'}}>
                <li>\u{1F4DD} Cr\u00e9er un nouveau d\u00e9tenteur</li>
                <li>\u{1F4F8} Capturer des photos et m\u00e9dias</li>
                <li>\u270D\uFE0F Obtenir le consentement sign\u00e9</li>
                <li>\u{1F4E5} T\u00e9l\u00e9charger le PDF \u00e0 remettre</li>
              </ul>
            </div>
          </>
        )}
        {view === 'stats' && (
          <>
            <div className="page-header">
              <h2>\u{1F4CA} Statistiques de l'\u00e9v\u00e9nement</h2>
              <p>Analyse en temps r\u00e9el de la mission de collecte</p>
            </div>
            <Statistiques />
          </>
        )}
        {view === 'form' && (
          <>
            <div className="page-header">
              <h2>\u{1F4DD} Nouveau d\u00e9tenteur</h2>
              <p>Enregistrer un nouveau d\u00e9tenteur de savoirs traditionnels</p>
            </div>
            <DetenteurForm onSaved={() => { loadStats(); setView('list'); }} />
          </>
        )}
        {view === 'list' && (
          <>
            <div className="page-header">
              <h2>\u{1F465} D\u00e9tenteurs enregistr\u00e9s</h2>
              <p>Liste compl\u00e8te des personnes ayant particip\u00e9 \u00e0 la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
        {view === 'politique' && (
          <>
            <div className="page-header">
              <h2>\u{1F512} Politique de confidentialit\u00e9</h2>
              <p>Engagement de protection des donn\u00e9es et des savoirs traditionnels</p>
            </div>
            <PolitiqueConfidentialite />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
;

fs.writeFileSync('src/App.jsx', appJsx, 'utf8');
console.log('  \u2705 src/App.jsx');

// ============ STYLES.CSS ============
const stylesCss = :root {
  --ocre: #C65D2C;
  --terre: #8B4513;
  --or: #DAA520;
  --or-clair: #F4C430;
  --rouge-rituel: #8B0000;
  --vert-savane: #556B2F;
  --sable: #FAEBD7;
  --sable-clair: #FDF5E6;
  --noir: #2C1810;
  --gris: #6B5D54;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #FDF5E6 0%, #FAEBD7 100%);
  min-height: 100vh;
  color: var(--noir);
}

.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, var(--terre) 0%, var(--noir) 100%);
  color: white;
  padding: 30px 20px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--or);
}

.sidebar-logo h1 {
  font-size: 28px;
  color: var(--or-clair);
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.sidebar-logo p {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-menu { list-style: none; }
.sidebar-menu li { margin-bottom: 8px; }

.sidebar-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: white;
  border-radius: 8px;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-menu button:hover,
.sidebar-menu button.active {
  background: rgba(244, 196, 48, 0.2);
  color: var(--or-clair);
}

.sidebar-menu .icon { font-size: 18px; }

.main-content {
  padding: 30px 40px;
  overflow-y: auto;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  border-left: 4px solid var(--or);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.15);
}

.stat-card .stat-icon { font-size: 32px; margin-bottom: 10px; }
.stat-card .stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--terre);
  margin-bottom: 5px;
}
.stat-card .stat-label {
  font-size: 13px;
  color: var(--gris);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--or);
}

.page-header h2 {
  color: var(--terre);
  font-size: 26px;
  margin-bottom: 5px;
}

.page-header p {
  color: var(--gris);
  font-size: 14px;
}

.hwendo-form {
  background: white;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.1);
}

.hwendo-form h2 {
  color: var(--terre);
  margin-bottom: 25px;
  font-size: 24px;
  text-align: center;
}

.hwendo-form h3 {
  color: var(--ocre);
  margin: 20px 0 12px 0;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--sable);
}

.hwendo-form input,
.hwendo-form select,
.hwendo-form textarea {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 12px;
  border: 2px solid var(--sable);
  border-radius: 8px;
  font-size: 14px;
  background: var(--sable-clair);
  font-family: inherit;
}

.hwendo-form input:focus,
.hwendo-form select:focus,
.hwendo-form textarea:focus {
  outline: none;
  border-color: var(--or);
  background: white;
}

.hwendo-form textarea { min-height: 80px; resize: vertical; }

.hwendo-form .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hwendo-form .checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.hwendo-form .checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--sable-clair);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.hwendo-form .checkbox-group input[type="checkbox"] {
  width: 18px; height: 18px; margin: 0;
}

.hwendo-form .btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--ocre) 0%, var(--rouge-rituel) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.hwendo-form .btn-gps {
  padding: 10px 16px;
  background: var(--vert-savane);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 10px;
}

.hwendo-form .btn-clear {
  padding: 6px 12px;
  background: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
}

.hwendo-form .message {
  text-align: center;
  padding: 12px;
  margin-top: 15px;
  background: var(--sable-clair);
  border-left: 4px solid var(--or);
  border-radius: 6px;
  font-weight: bold;
  color: var(--terre);
}

.detenteurs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.detenteur-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  display: flex;
  flex-direction: column;
}

.detenteur-card-header {
  background: linear-gradient(135deg, var(--ocre) 0%, var(--terre) 100%);
  color: white;
  padding: 16px 20px;
  position: relative;
}

.detenteur-card-header h3 { font-size: 18px; margin-bottom: 3px; }

.detenteur-card-header .village {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detenteur-card-body { padding: 18px 20px; flex: 1; }

.detenteur-card-body .info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--sable);
  font-size: 13px;
}

.detenteur-card-body .info-label { color: var(--gris); font-weight: 600; }
.detenteur-card-body .info-value { color: var(--noir); }

.detenteur-card-actions {
  padding: 12px 20px;
  background: var(--sable-clair);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.btn-action.doc { background: #4299e1; color: white; }
.btn-action.pdf { background: var(--ocre); color: white; }

.media-capture {
  margin-top: 20px;
  padding: 20px;
  background: var(--sable-clair);
  border-radius: 12px;
  border: 2px dashed var(--or);
}

.media-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.media-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  min-width: 100px;
}

.media-btn.photo { background: #4299e1; }
.media-btn.video { background: #ed8936; }
.media-btn.audio { background: #48bb78; }

.media-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.media-item {
  background: white;
  padding: 8px;
  border-radius: 8px;
}

.media-item img, .media-item video {
  width: 100%;
  border-radius: 4px;
  display: block;
}

.signature-box {
  border: 2px solid var(--sable);
  border-radius: 8px;
  background: white;
  padding: 5px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .app-layout { grid-template-columns: 1fr; }
  .sidebar { height: auto; padding: 15px; }
  .sidebar-menu { display: flex; gap: 10px; overflow-x: auto; }
  .main-content { padding: 20px; }
}
;

fs.writeFileSync('src/styles.css', stylesCss, 'utf8');
console.log('  \u2705 src/styles.css');

// ============ INDEX.HTML ============
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('charset="UTF-8"')) {
  indexHtml = indexHtml.replace('<head>', '<head>\n    <meta charset="UTF-8">');
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('  \u2705 index.html (charset ajout\u00e9)');
} else {
  console.log('  \u2705 index.html (d\u00e9j\u00e0 OK)');
}

console.log('\n\ud83c\udf89 Tous les fichiers sont maintenant en UTF-8 propre !');
