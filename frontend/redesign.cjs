const fs = require('fs');

// 1. Créer les styles globaux africains
fs.writeFileSync('src/styles.css', `
:root {
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

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #FDF5E6 0%, #FAEBD7 100%);
  min-height: 100vh;
  color: var(--noir);
}

/* Layout principal */
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

/* Sidebar */
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

.sidebar-menu {
  list-style: none;
}

.sidebar-menu li {
  margin-bottom: 8px;
}

.sidebar-menu a, .sidebar-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-menu a:hover, .sidebar-menu button:hover,
.sidebar-menu a.active, .sidebar-menu button.active {
  background: rgba(244, 196, 48, 0.2);
  color: var(--or-clair);
}

.sidebar-menu .icon {
  font-size: 18px;
}

/* Main content */
.main-content {
  padding: 30px 40px;
  overflow-y: auto;
}

/* Dashboard */
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

.stat-card .stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

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

/* Header page */
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

/* Formulaire */
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
  transition: all 0.2s;
  font-family: inherit;
}

.hwendo-form input:focus,
.hwendo-form select:focus,
.hwendo-form textarea:focus {
  outline: none;
  border-color: var(--or);
  background: white;
  box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
}

.hwendo-form textarea {
  min-height: 80px;
  resize: vertical;
}

.hwendo-form .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hwendo-form .form-grid input,
.hwendo-form .form-grid select {
  margin-bottom: 0;
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
  transition: background 0.2s;
  font-size: 13px;
}

.hwendo-form .checkbox-group label:hover {
  background: var(--sable);
}

.hwendo-form .checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--ocre);
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
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(198, 93, 44, 0.3);
}

.hwendo-form .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(198, 93, 44, 0.4);
}

.hwendo-form .btn-gps {
  padding: 10px 16px;
  background: var(--vert-savane);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
}

.hwendo-form .btn-clear {
  padding: 6px 12px;
  background: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 5px;
}

.hwendo-form .message {
  text-align: center;
  padding: 12px;
  margin-top: 15px;
  background: linear-gradient(135deg, var(--sable-clair) 0%, var(--sable) 100%);
  border-left: 4px solid var(--or);
  border-radius: 6px;
  font-weight: bold;
  color: var(--terre);
}

/* Liste des détenteurs */
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
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.detenteur-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.15);
}

.detenteur-card-header {
  background: linear-gradient(135deg, var(--ocre) 0%, var(--terre) 100%);
  color: white;
  padding: 16px 20px;
  position: relative;
}

.detenteur-card-header h3 {
  font-size: 18px;
  margin-bottom: 3px;
}

.detenteur-card-header .village {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detenteur-card-header .sync-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--or-clair);
  color: var(--noir);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.detenteur-card-body {
  padding: 18px 20px;
  flex: 1;
}

.detenteur-card-body .info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--sable);
  font-size: 13px;
}

.detenteur-card-body .info-row:last-child {
  border-bottom: none;
}

.detenteur-card-body .info-label {
  color: var(--gris);
  font-weight: 600;
}

.detenteur-card-body .info-value {
  color: var(--noir);
}

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
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-action.doc {
  background: #4299e1;
  color: white;
}

.btn-action.pdf {
  background: var(--ocre);
  color: white;
}

.btn-action:hover {
  transform: scale(1.05);
}

/* Capture médias */
.media-capture {
  margin-top: 20px;
  padding: 20px;
  background: var(--sable-clair);
  border-radius: 12px;
  border: 2px dashed var(--or);
}

.media-capture h3 {
  margin-top: 0 !important;
  color: var(--ocre) !important;
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
  font-size: 14px;
  font-weight: bold;
  flex: 1;
  min-width: 100px;
  transition: all 0.2s;
}

.media-btn.photo { background: #4299e1; }
.media-btn.video { background: #ed8936; }
.media-btn.audio { background: #48bb78; }

.media-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

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
  border: 1px solid var(--sable);
}

.media-item img, .media-item video {
  width: 100%;
  border-radius: 4px;
  display: block;
}

.media-item audio {
  width: 100%;
}

.media-item .media-info {
  font-size: 11px;
  color: var(--gris);
  margin-top: 5px;
  text-align: center;
}

/* Signature */
.signature-box {
  border: 2px solid var(--sable);
  border-radius: 8px;
  background: white;
  padding: 5px;
  margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: relative;
    height: auto;
    padding: 15px;
  }
  .sidebar-menu {
    display: flex;
    gap: 10px;
    overflow-x: auto;
  }
  .sidebar-menu li {
    margin: 0;
  }
  .sidebar-logo {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
  .hwendo-form .form-grid,
  .hwendo-form .checkbox-group {
    grid-template-columns: 1fr;
  }
  .main-content {
    padding: 20px;
  }
}
`);

// 2. Mettre à jour index.css pour importer nos styles
fs.writeFileSync('src/index.css', `@import './styles.css';`);

// 3. Mettre à jour App.jsx avec le layout sidebar + dashboard
fs.writeFileSync('src/App.jsx', `import { useState, useEffect } from 'react';
import { db } from './db/localDB';
import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';

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
          <h1>🎵 HWENDO</h1>
          <p>Mission 2026</p>
          <p style={{fontSize: '9px', marginTop: '5px', opacity: 0.6}}>Patrimoine Sonore</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="icon">📊</span> Tableau de bord
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">📝</span> Nouveau détenteur
            </button>
          </li>
          <li>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="icon">👥</span> Détenteurs ({stats.total})
            </button>
          </li>
          <li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button disabled style={{opacity: 0.6, cursor: 'default'}}>
              <span className="icon">⚙️</span> Paramètres
            </button>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>📊 Tableau de bord</h2>
              <p>Vue d'ensemble de la mission de collecte patrimoniale</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Détenteurs enregistrés</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✍️</div>
                <div className="stat-value">{stats.signes}</div>
                <div className="stat-label">Consentements signés</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📸</div>
                <div className="stat-value">{stats.photos}</div>
                <div className="stat-label">Photos capturées</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.total > 0 ? Math.round((stats.signes / stats.total) * 100) : 0}%</div>
                <div className="stat-label">Taux de signature</div>
              </div>
            </div>
            <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
              <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🎵 Bienvenue dans HWENDO 2026</h3>
              <p style={{color: 'var(--gris)', lineHeight: '1.6'}}>
                Cette plateforme vous accompagne dans votre mission de sauvegarde du patrimoine musical 
                du royaume Hwendo au Palais Royal DADA DA AGBO HOUNON HOUNAN.
              </p>
              <p style={{color: 'var(--gris)', lineHeight: '1.6', marginTop: '10px'}}>
                <strong>Commencez par :</strong>
              </p>
              <ul style={{color: 'var(--gris)', lineHeight: '1.8', marginLeft: '20px'}}>
                <li>📝 Créer un nouveau détenteur</li>
                <li>📸 Capturer des photos et médias</li>
                <li>✍️ Obtenir le consentement signé</li>
                <li>📥 Télécharger le PDF à remettre</li>
              </ul>
            </div>
          </>
        )}
        {view === 'form' && (
          <>
            <div className="page-header">
              <h2>📝 Nouveau détenteur</h2>
              <p>Enregistrer un nouveau détenteur de savoirs traditionnels</p>
            </div>
            <DetenteurForm onSaved={() => { loadStats(); setView('list'); }} />
          </>
        )}
        {view === 'list' && (
          <>
            <div className="page-header">
              <h2>👥 Détenteurs enregistrés</h2>
              <p>Liste complète des personnes ayant participé à la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
`);

// 4. Mettre à jour DetenteurForm avec le nouveau design
fs.writeFileSync('src/components/DetenteurForm.jsx', `import { useState, useRef, useMemo, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import MediaCapture from './MediaCapture';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function DetenteurForm({ onSaved }) {
  const tempId = useMemo(() => 'temp_' + Date.now(), []);
  
  const [form, setForm] = useState({ 
    nomComplet: '', village: '', sexe: 'M', age: '',
    surnomRituel: '', fonctionPalais: '', telephone: '', langue: 'Fon',
    peutParler: false, peutChanter: false, peutEtreFilme: false,
    peutFilmer: false, preterInstrument: false, montrerLieuSacre: false,
    anonymiser: false, nomTraditionnelJamaisEcrit: false,
    coordonneesGPS: '', notes: ''
  });
  const [msg, setMsg] = useState('');
  const sigCanvas = useRef(null);

  const capturerGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm({...form, coordonneesGPS: pos.coords.latitude + ',' + pos.coords.longitude});
          setMsg('📍 Position GPS capturée !');
        },
        (err) => setMsg('❌ GPS refusé')
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('⏳ Sauvegarde en cours...');
    
    const signature = sigCanvas.current && !sigCanvas.current.isEmpty() 
      ? sigCanvas.current.toDataURL('image/png') 
      : null;
    
    const data = { ...form, age: form.age ? parseInt(form.age) : null };
    const localId = await db.detenteurs.add({ ...data, signature, syncStatus: 'pending' });
    
    const files = await db.files.where('detenteurId').equals(tempId).toArray();
    const photos = [];
    for (const file of files) {
      if (file.type === 'photo' && file.blob) {
        try {
          const base64 = await blobToBase64(file.blob);
          photos.push({ name: file.name, mimeType: file.mimeType, data: base64 });
          await db.files.update(file.id, { detenteurId: localId });
        } catch (err) { console.error(err); }
      }
    }
    
    setMsg('✅ Sauvegardé localement ! Envoi à Google Drive...');
    
    try {
      const saved = await api.createDetenteur(data);
      await db.detenteurs.update(localId, { id: saved.id, syncStatus: 'synced' });
    } catch (err) { console.error(err); }
    
    try {
      const docResult = await api.generateConsentementDoc(data, signature, photos);
      if (docResult.success) {
        if (docResult.docUrl) await db.detenteurs.update(localId, { docUrl: docResult.docUrl });
        setMsg('✅ Document de consentement généré avec photos !');
      }
    } catch (err) {
      setMsg('⚠️ Détenteur sauvegardé, doc en attente');
    }
    
    setForm({ 
      nomComplet: '', village: '', sexe: 'M', age: '',
      surnomRituel: '', fonctionPalais: '', telephone: '', langue: 'Fon',
      peutParler: false, peutChanter: false, peutEtreFilme: false,
      peutFilmer: false, preterInstrument: false, montrerLieuSacre: false,
      anonymiser: false, nomTraditionnelJamaisEcrit: false,
      coordonneesGPS: '', notes: ''
    });
    sigCanvas.current?.clear();
    window.dispatchEvent(new Event('detenteur-added'));
    if (onSaved) setTimeout(onSaved, 1500);
  };

  return (
    <form onSubmit={submit} className="hwendo-form">
      <h2>📝 Nouveau Détenteur</h2>
      
      <h3>👤 Identité</h3>
      <input placeholder="Nom complet *" value={form.nomComplet} onChange={e=>setForm({...form, nomComplet:e.target.value})} required />
      <input placeholder="Surnom rituel" value={form.surnomRituel} onChange={e=>setForm({...form, surnomRituel:e.target.value})} />
      <div className="form-grid">
        <input type="number" placeholder="Âge" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} />
        <select value={form.sexe} onChange={e=>setForm({...form, sexe:e.target.value})}>
          <option value="M">Masculin</option><option value="F">Féminin</option>
        </select>
      </div>
      <input placeholder="Village *" value={form.village} onChange={e=>setForm({...form, village:e.target.value})} required />
      <input placeholder="Fonction au palais" value={form.fonctionPalais} onChange={e=>setForm({...form, fonctionPalais:e.target.value})} />
      <div className="form-grid">
        <input placeholder="Téléphone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})} />
        <select value={form.langue} onChange={e=>setForm({...form, langue:e.target.value})}>
          <option value="Fon">Fon</option><option value="Goun">Goun</option>
          <option value="Mina">Mina</option><option value="Français">Français</option>
        </select>
      </div>

      <h3>🎭 Permissions</h3>
      <div className="checkbox-group">
        {[
          ['peutParler', '🎤 Être interviewé(e)'],
          ['peutChanter', '🎵 Chanter / Jouer'],
          ['peutEtreFilme', '🎥 Être filmé(e)'],
          ['peutFilmer', '📸 Être photographié(e)'],
          ['preterInstrument', '🪘 Prêter un instrument'],
          ['montrerLieuSacre', '🏛️ Montrer un lieu sacré']
        ].map(([key, label]) => (
          <label key={key}>
            <input type="checkbox" checked={form[key]} onChange={e=>setForm({...form, [key]:e.target.checked})} />
            {label}
          </label>
        ))}
      </div>

      <h3>🔒 Spécificités Vodun</h3>
      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={form.anonymiser} onChange={e=>setForm({...form, anonymiser:e.target.checked})} />
          🕶️ Anonymiser mon nom
        </label>
        <label>
          <input type="checkbox" checked={form.nomTraditionnelJamaisEcrit} onChange={e=>setForm({...form, nomTraditionnelJamaisEcrit:e.target.checked})} />
          🤐 Nom traditionnel jamais écrit
        </label>
      </div>

      <h3>📍 Localisation</h3>
      <button type="button" onClick={capturerGPS} className="btn-gps">
        📍 Capturer GPS
      </button>
      {form.coordonneesGPS && <p style={{fontSize:'12px', color:'var(--gris)', marginBottom: '10px'}}>📍 {form.coordonneesGPS}</p>}

      <h3>📝 Notes terrain</h3>
      <textarea placeholder="Observations, contexte..." value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />

      <h3>✍️ Signature manuscrite</h3>
      <div className="signature-box">
        <SignatureCanvas 
          ref={sigCanvas}
          penColor="#2C1810"
          canvasProps={{style:{width:'100%', height:'150px'}}}
        />
      </div>
      <button type="button" onClick={()=>sigCanvas.current?.clear()} className="btn-clear">
        Effacer
      </button>

      <MediaCapture tempDetenteurId={tempId} />

      <button type="submit" className="btn-primary">
        ✅ Enregistrer le détenteur
      </button>
      {msg && <div className="message">{msg}</div>}
    </form>
  );
}
`);

// 5. Mettre à jour DetenteurList avec le nouveau design
fs.writeFileSync('src/components/DetenteurList.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import MediaDisplay from './MediaDisplay';
import PDFGenerator from './PDFGenerator';

export default function DetenteurList() {
  const [dets, setDets] = useState([]);

  const loadData = async () => {
    try {
      const localData = await db.detenteurs.toArray();
      setDets(localData);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { 
    loadData();
    const handler = () => loadData();
    window.addEventListener('detenteur-added', handler);
    return () => window.removeEventListener('detenteur-added', handler);
  }, []);

  return (
    <div className="detenteurs-grid">
      {dets.length === 0 ? (
        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <div style={{fontSize: '64px', marginBottom: '15px'}}>👥</div>
          <h3 style={{color: 'var(--terre)', marginBottom: '10px'}}>Aucun détenteur enregistré</h3>
          <p style={{color: 'var(--gris)'}}>Commencez par créer votre premier détenteur dans le menu "Nouveau détenteur"</p>
        </div>
      ) : (
        dets.map(d => (
          <div key={d.id || d.reference} className="detenteur-card">
            <div className="detenteur-card-header">
              <h3>{d.nomComplet}</h3>
              <div className="village">📍 {d.village}</div>
              {d.syncStatus === 'synced' && (
                <span className="sync-badge">✅ SYNC</span>
              )}
            </div>
            <div className="detenteur-card-body">
              <div className="info-row">
                <span className="info-label">Âge</span>
                <span className="info-value">{d.age || '?'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sexe</span>
                <span className="info-value">{d.sexe === 'M' ? '♂ Masculin' : '♀ Féminin'}</span>
              </div>
              {d.fonctionPalais && (
                <div className="info-row">
                  <span className="info-label">Fonction</span>
                  <span className="info-value">{d.fonctionPalais}</span>
                </div>
              )}
              {d.langue && (
                <div className="info-row">
                  <span className="info-label">Langue</span>
                  <span className="info-value">{d.langue}</span>
                </div>
              )}
              <MediaDisplay detenteurId={d.id} />
            </div>
            <div className="detenteur-card-actions">
              {d.docUrl && (
                <a href={d.docUrl} target="_blank" rel="noopener noreferrer" className="btn-action doc">
                  📄 Google Docs
                </a>
              )}
              <PDFGenerator detenteurId={d.id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
`);

// 6. Corriger MediaCapture avec le nouveau design
fs.writeFileSync('src/components/MediaCapture.jsx', `import { useRef, useState, useEffect } from 'react';
import { db } from '../db/localDB';

export default function MediaCapture({ tempDetenteurId }) {
  const photoInput = useRef(null);
  const videoInput = useRef(null);
  const audioInput = useRef(null);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [urls, setUrls] = useState({});

  useEffect(() => {
    if (tempDetenteurId) loadFiles();
  }, [tempDetenteurId]);

  const loadFiles = async () => {
    try {
      const all = await db.files.where('detenteurId').equals(tempDetenteurId).toArray();
      setFiles(all);
      const newUrls = {};
      all.forEach(f => {
        if (f.blob) newUrls[f.id] = URL.createObjectURL(f.blob);
      });
      setUrls(newUrls);
    } catch (err) { console.error(err); }
  };

  const handleFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await db.files.add({
        detenteurId: tempDetenteurId,
        type: type,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        blob: file,
        createdAt: new Date().toISOString()
      });
      setMsg('✅ ' + type + ' sauvegardé (' + (file.size / 1024).toFixed(1) + ' Ko)');
      loadFiles();
    } catch (err) { setMsg('❌ Erreur: ' + err.message); }
  };

  return (
    <div className="media-capture">
      <h3>🎬 Capture Médias</h3>
      <div className="media-buttons">
        <button type="button" onClick={() => photoInput.current.click()} className="media-btn photo">
          📸 Photo
        </button>
        <button type="button" onClick={() => videoInput.current.click()} className="media-btn video">
          🎥 Vidéo
        </button>
        <button type="button" onClick={() => audioInput.current.click()} className="media-btn audio">
          🎤 Audio
        </button>
      </div>

      <input type="file" accept="image/*" capture="environment" ref={photoInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'photo')} />
      <input type="file" accept="video/*" capture="environment" ref={videoInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'video')} />
      <input type="file" accept="audio/*" capture ref={audioInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'audio')} />

      {msg && <p style={{color: 'var(--vert-savane)', fontWeight: 'bold', marginTop: '10px'}}>{msg}</p>}

      {files.length > 0 && (
        <div className="media-preview">
          {files.map(f => (
            <div key={f.id} className="media-item">
              {f.type === 'photo' && urls[f.id] && <img src={urls[f.id]} alt={f.name} />}
              {f.type === 'video' && urls[f.id] && <video controls><source src={urls[f.id]} type={f.mimeType} /></video>}
              {f.type === 'audio' && urls[f.id] && <audio controls><source src={urls[f.id]} type={f.mimeType} /></audio>}
              <div className="media-info">
                {f.type === 'photo' ? '📸' : f.type === 'video' ? '🎥' : '🎤'} {(f.size / 1024).toFixed(0)} Ko
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 7. Corriger MediaDisplay avec le nouveau design
fs.writeFileSync('src/components/MediaDisplay.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';

export default function MediaDisplay({ detenteurId }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState({});

  useEffect(() => {
    if (!detenteurId) return;
    loadMedia();
    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [detenteurId]);

  const loadMedia = async () => {
    try {
      const allFiles = await db.files.where('detenteurId').equals(detenteurId).toArray();
      setFiles(allFiles);
      const newUrls = {};
      allFiles.forEach(f => {
        if (f.blob) newUrls[f.id] = URL.createObjectURL(f.blob);
      });
      setUrls(newUrls);
    } catch (err) { console.error(err); }
  };

  if (files.length === 0) return null;

  return (
    <div style={{marginTop: '12px'}}>
      <div style={{fontSize: '11px', color: 'var(--gris)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px'}}>
        Médias capturés ({files.length})
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '5px'}}>
        {files.map(f => (
          <div key={f.id} style={{background: 'var(--sable-clair)', padding: '4px', borderRadius: '4px'}}>
            {f.type === 'photo' && urls[f.id] && (
              <img src={urls[f.id]} alt={f.name} style={{width: '100%', borderRadius: '3px', display: 'block'}} />
            )}
            {f.type === 'video' && urls[f.id] && (
              <video style={{width: '100%', borderRadius: '3px'}}><source src={urls[f.id]} type={f.mimeType} /></video>
            )}
            {f.type === 'audio' && (
              <div style={{textAlign: 'center', padding: '10px', fontSize: '20px'}}>🎤</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// 8. Corriger PDFGenerator avec photo + OBG Bénin + design africain
fs.writeFileSync('src/components/PDFGenerator.jsx', `import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { db } from '../db/localDB';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function PDFGenerator({ detenteurId }) {
  const [loading, setLoading] = useState(false);
  const [detenteur, setDetenteur] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadData();
  }, [detenteurId]);

  const loadData = async () => {
    try {
      const d = await db.detenteurs.get(detenteurId);
      setDetenteur(d);
      
      // Récupérer les photos
      const allFiles = await db.files.where('detenteurId').equals(detenteurId).toArray();
      const photoFiles = allFiles.filter(f => f.type === 'photo' && f.blob);
      const photoBase64 = [];
      for (const f of photoFiles) {
        try {
          const base64 = await blobToBase64(f.blob);
          photoBase64.push(base64);
        } catch (e) { console.error(e); }
      }
      setPhotos(photoBase64);
    } catch (e) { console.error(e); }
  };

  const generatePDF = async () => {
    if (!detenteur) return;
    setLoading(true);
    
    const photoHtml = photos.length > 0 
      ? \`<div style="text-align: center; margin-bottom: 20px;">
          <img src="\${photos[0]}" style="max-width: 180px; max-height: 180px; border: 3px solid #C65D2C; border-radius: 8px; object-fit: cover;" />
         </div>\`
      : '';

    const content = document.createElement('div');
    content.innerHTML = \`
      <div style="font-family: 'Georgia', serif; padding: 25px; color: #2C1810; background: white;">
        <div style="text-align: center; border-bottom: 4px double #DAA520; padding-bottom: 20px; margin-bottom: 25px;">
          <h1 style="color: #2C1810; margin: 0; font-size: 28px; letter-spacing: 3px;">🎵 HWENDO 2026</h1>
          <h2 style="color: #C65D2C; margin: 8px 0; font-size: 20px;">CONSENTEMENT ÉCLAIRÉ</h2>
          <p style="margin: 5px 0; font-style: italic; color: #6B5D54; font-size: 12px;">Mission de sauvegarde du patrimoine musical</p>
          <p style="margin: 2px 0; font-size: 11px; color: #6B5D54;">Royaume Hwendo • Palais Royal DADA DA AGBO HOUNON HOUNAN</p>
        </div>
        
        \${photoHtml}
        
        <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; font-size: 16px; margin-bottom: 12px;">
          IDENTITÉ DU SIGNATAIRE
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px; font-weight: bold; color: #8B4513; width: 35%;">Nom complet :</td><td style="padding: 6px;">\${detenteur.nomComplet}</td></tr>
          \${detenteur.surnomRituel ? \`<tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Surnom rituel :</td><td style="padding: 6px; font-style: italic;">\${detenteur.surnomRituel}</td></tr>\` : ''}
          <tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Âge :</td><td style="padding: 6px;">\${detenteur.age || 'Non renseigné'} ans</td></tr>
          <tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Sexe :</td><td style="padding: 6px;">\${detenteur.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Village :</td><td style="padding: 6px;">\${detenteur.village}</td></tr>
          \${detenteur.fonctionPalais ? \`<tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Fonction :</td><td style="padding: 6px;">\${detenteur.fonctionPalais}</td></tr>\` : ''}
          \${detenteur.telephone ? \`<tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Téléphone :</td><td style="padding: 6px;">\${detenteur.telephone}</td></tr>\` : ''}
          <tr><td style="padding: 6px; font-weight: bold; color: #8B4513;">Langue :</td><td style="padding: 6px;">\${detenteur.langue || 'Non renseigné'}</td></tr>
        </table>
        
        <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; font-size: 16px; margin-bottom: 12px;">
          PERMISSIONS ACCORDÉES
        </h3>
        <table style="width: 100%; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 5px;">\${detenteur.peutParler ? '☑' : '☐'} Être interviewé(e)</td>
            <td style="padding: 5px;">\${detenteur.peutFilmer ? '☑' : '☐'} Être photographié(e)</td>
          </tr>
          <tr>
            <td style="padding: 5px;">\${detenteur.peutChanter ? '☑' : '☐'} Chanter / Jouer (audio)</td>
            <td style="padding: 5px;">\${detenteur.preterInstrument ? '☑' : '☐'} Prêter un instrument</td>
          </tr>
          <tr>
            <td style="padding: 5px;">\${detenteur.peutEtreFilme ? '☑' : '☐'} Être filmé(e)</td>
            <td style="padding: 5px;">\${detenteur.montrerLieuSacre ? '☑' : '☐'} Montrer un lieu sacré</td>
          </tr>
        </table>
        
        <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; font-size: 16px; margin-bottom: 12px;">
          SPÉCIFICITÉS VODUN
        </h3>
        <p style="margin: 5px 0; font-size: 13px;">\${detenteur.anonymiser ? '☑' : '☐'} Le nom sera anonymisé dans les publications</p>
        <p style="margin: 5px 0; font-size: 13px;">\${detenteur.nomTraditionnelJamaisEcrit ? '☑' : '☐'} Le nom traditionnel ne sera jamais écrit</p>
        
        <div style="background: #FDF5E6; padding: 15px; margin: 20px 0; border-left: 5px solid #C65D2C; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #2C1810;">
            Je soussigné(e) confirme avoir été informé(e) de l'objet de cette mission menée par <strong>Johnson Mario Apanh (OBG Bénin)</strong> 
            et donne mon consentement libre et éclairé pour les permissions cochées ci-dessus.
          </p>
        </div>
        
        <p style="margin-top: 20px; font-size: 13px;">
          <strong>Fait à \${detenteur.village}, le \${new Date().toLocaleDateString('fr-FR')}</strong>
        </p>
        
        <div style="margin-top: 40px; display: flex; justify-content: space-between; gap: 40px;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: bold; color: #8B4513; font-size: 13px;">SIGNATURE DU DÉTENTEUR :</p>
            \${detenteur.signature 
              ? \`<img src="\${detenteur.signature}" style="max-width: 200px; max-height: 80px; margin-top: 10px;" />\` 
              : '<div style="border-bottom: 1px solid #2C1810; width: 200px; margin-top: 50px;"></div>'}
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 0; font-weight: bold; color: #8B4513; font-size: 13px;">L'ENQUÊTEUR :</p>
            <div style="margin-top: 50px;">
              <p style="margin: 0; font-style: italic; font-size: 13px;">Johnson Mario Apanh</p>
              <p style="margin: 2px 0; font-size: 11px; color: #6B5D54;">OBG Bénin</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 15px; border-top: 2px double #DAA520; font-size: 10px; color: #6B5D54;">
          <p style="margin: 0;">HWENDO 2026 • Mission de sauvegarde du patrimoine musical</p>
          <p style="margin: 2px 0;">Johnson Mario Apanh • OBG Bénin</p>
        </div>
      </div>
    \`;
    
    document.body.appendChild(content);
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: 'CONSENTEMENT_' + detenteur.nomComplet.replace(/\\s+/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      await html2pdf().from(content).set(options).save();
    } catch (e) {
      alert('Erreur lors de la génération du PDF: ' + e.message);
    }
    document.body.removeChild(content);
    setLoading(false);
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={loading}
      className="btn-action pdf"
    >
      {loading ? '⏳ Génération...' : '📥 Télécharger PDF'}
    </button>
  );
}
`);

console.log('🎉 Design africain + Photo PDF + OBG Bénin appliqués !');
