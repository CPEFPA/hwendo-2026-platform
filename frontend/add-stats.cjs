const fs = require('fs');

// 1. Créer le composant Statistiques
fs.writeFileSync('src/components/Statistiques.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import html2pdf from 'html2pdf.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const COLORS = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936'];

export default function Statistiques() {
  const [stats, setStats] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const dets = await db.detenteurs.toArray();
      const files = await db.files.toArray();

      // Comptage par type
      const parType = {};
      dets.forEach(d => {
        const t = d.typePersonne || 'Détenteur';
        parType[t] = (parType[t] || 0) + 1;
      });
      const typeData = Object.entries(parType).map(([name, value]) => ({ name, value }));

      // Par sexe
      const hommes = dets.filter(d => d.sexe === 'M').length;
      const femmes = dets.filter(d => d.sexe === 'F').length;
      const sexeData = [
        { name: 'Hommes', value: hommes },
        { name: 'Femmes', value: femmes }
      ].filter(s => s.value > 0);

      // Par village (top 5)
      const parVillage = {};
      dets.forEach(d => {
        const v = d.village || 'Inconnu';
        parVillage[v] = (parVillage[v] || 0) + 1;
      });
      const villageData = Object.entries(parVillage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      // Par langue
      const parLangue = {};
      dets.forEach(d => {
        const l = d.langue || 'Non renseigné';
        parLangue[l] = (parLangue[l] || 0) + 1;
      });
      const langueData = Object.entries(parLangue).map(([name, value]) => ({ name, value }));

      // Permissions
      const permissions = [
        ['peutParler', 'Interview'],
        ['peutChanter', 'Chant/Audio'],
        ['peutEtreFilme', 'Filmé'],
        ['peutFilmer', 'Photographié'],
        ['preterInstrument', 'Instrument'],
        ['montrerLieuSacre', 'Lieu sacré']
      ].map(([key, label]) => ({
        name: label,
        value: dets.filter(d => d[key]).length
      }));

      // Médias
      const photos = files.filter(f => f.type === 'photo').length;
      const videos = files.filter(f => f.type === 'video').length;
      const audios = files.filter(f => f.type === 'audio').length;

      // Signatures
      const signes = dets.filter(d => d.signature || d.docUrl).length;

      setStats({
        total: dets.length,
        signes,
        photos, videos, audios,
        typeData, sexeData, villageData, langueData, permissions
      });
    } catch (e) { console.error(e); }
  };

  const exportPDF = async () => {
    if (!stats) return;
    const content = document.createElement('div');
    content.innerHTML = \`
      <div style="font-family: Arial; padding: 20px; color: #2C1810;">
        <div style="text-align: center; border-bottom: 3px double #DAA520; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px;">🎵 HWENDO 2026</h1>
          <h2 style="color: #C65D2C; margin: 5px 0; font-size: 16px;">RAPPORT STATISTIQUE DE L'ÉVÉNEMENT</h2>
          <p style="font-size: 10px; color: #6B5D54;">Généré le \${new Date().toLocaleDateString('fr-FR')} • OBG International Bénin</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #FDF5E6;">
            <td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">👥 Total participants</td>
            <td style="padding: 10px; border: 1px solid #DAA520; text-align: center; font-size: 18px; font-weight: bold;">\${stats.total}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">✍️ Consentements signés</td>
            <td style="padding: 10px; border: 1px solid #DAA520; text-align: center; font-size: 18px; font-weight: bold;">\${stats.signes}</td>
          </tr>
          <tr style="background: #FDF5E6;">
            <td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">📸 Photos</td>
            <td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.photos}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">🎥 Vidéos</td>
            <td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.videos}</td>
          </tr>
          <tr style="background: #FDF5E6;">
            <td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">🎤 Audios</td>
            <td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.audios}</td>
          </tr>
        </table>
        
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Répartition par type</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.typeData.map(t => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${t.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${t.value}</td></tr>\`).join('')}
        </table>
        
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Top villages d'origine</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.villageData.map(v => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${v.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${v.value}</td></tr>\`).join('')}
        </table>
        
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Permissions accordées</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.permissions.map(p => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${p.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${p.value}</td></tr>\`).join('')}
        </table>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px double #DAA520; font-size: 9px; color: #6B5D54;">
          <p style="margin: 0; font-weight: bold;">Tout droit réservé OBG International Bénin</p>
        </div>
      </div>
    \`;
    document.body.appendChild(content);
    await html2pdf().from(content).set({
      margin: 10,
      filename: 'RAPPORT_STATISTIQUES_HWENDO_2026.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    }).save();
    document.body.removeChild(content);
  };

  if (!stats) return <div style={{textAlign: 'center', padding: '50px'}}>⏳ Chargement des statistiques...</div>;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div></div>
        <button onClick={exportPDF} className="btn-action pdf" style={{padding: '10px 20px', fontSize: '14px'}}>
          📥 Exporter le rapport PDF
        </button>
      </div>

      {/* Cartes de chiffres clés */}
      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.total}</div><div className="stat-label">Participants</div></div>
        <div className="stat-card"><div className="stat-icon">✍️</div><div className="stat-value">{stats.signes}</div><div className="stat-label">Signés</div></div>
        <div className="stat-card"><div className="stat-icon">📸</div><div className="stat-value">{stats.photos}</div><div className="stat-label">Photos</div></div>
        <div className="stat-card"><div className="stat-icon">🎥</div><div className="stat-value">{stats.videos}</div><div className="stat-label">Vidéos</div></div>
        <div className="stat-card"><div className="stat-icon">🎤</div><div className="stat-value">{stats.audios}</div><div className="stat-label">Audios</div></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
        {/* Par type */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>👥 Par type de personne</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#C65D2C" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par sexe */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>⚥ Répartition par sexe</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.sexeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {stats.sexeData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Par village */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🏘️ Top villages d'origine</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.villageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#DAA520" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Permissions */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🎭 Permissions accordées</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.permissions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{fontSize: 11}} />
              <Tooltip />
              <Bar dataKey="value" fill="#556B2F" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par langue */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🗣️ Par langue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.langueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {stats.langueData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
`);

// 2. Ajouter le menu dans App.jsx
const appContent = fs.readFileSync('src/App.jsx', 'utf8');
let newAppContent = appContent.replace(
  "import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';",
  "import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';\nimport Statistiques from './components/Statistiques';"
);

// Ajouter le bouton statistiques après le dashboard
newAppContent = newAppContent.replace(
  `<li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">📝</span> Nouveau détenteur
            </button>
          </li>`,
  `<li>
            <button className={view === 'stats' ? 'active' : ''} onClick={() => setView('stats')}>
              <span className="icon">📊</span> Statistiques
            </button>
          </li>
          <li>
            <button className={view === 'form' ? 'active' : ''} onClick={() => setView('form')}>
              <span className="icon">📝</span> Nouveau détenteur
            </button>
          </li>`
);

// Ajouter le rendu
newAppContent = newAppContent.replace(
  `{view === 'politique' && (`,
  `{view === 'stats' && (
          <>
            <div className="page-header">
              <h2>📊 Statistiques de l'événement</h2>
              <p>Analyse en temps réel de la mission de collecte</p>
            </div>
            <Statistiques />
          </>
        )}
        {view === 'politique' && (`
);

fs.writeFileSync('src/App.jsx', newAppContent);

console.log('🎉 Module statistiques créé !');
