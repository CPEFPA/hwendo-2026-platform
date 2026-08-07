const fs = require('fs');

// 1. Créer le composant Carte des villages
fs.writeFileSync('src/components/CarteVillages.jsx', `import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordonnées des villages du Bénin (royaume Hwendo et environs)
const VILLAGE_COORDS = {
  'ouidah': [6.3654, 2.0857], 'whydah': [6.3654, 2.0857],
  'abomey': [7.1826, 1.9912],
  'porto-novo': [6.4969, 2.6283], 'portonovo': [6.4969, 2.6283],
  'cotonou': [6.3703, 2.3912],
  'allada': [6.6770, 2.1486],
  'grand-popo': [6.2592, 1.7910], 'grandpopo': [6.2592, 1.7910],
  'come': [6.3969, 1.8786], 'comé': [6.3969, 1.8786],
  'savi': [6.4333, 2.0667], 'savy': [6.4333, 2.0667],
  'tori': [6.5833, 2.1833], 'tori-bossito': [6.5833, 2.1833],
  'togbin': [6.4333, 2.2167],
  'avrankou': [6.5833, 2.6167],
  'akpro-misserete': [6.5833, 2.6833],
  'ketou': [7.3667, 2.6000], 'kétou': [7.3667, 2.6000],
  'sakete': [6.7333, 2.6500], 'sakété': [6.7333, 2.6500],
  'pobe': [6.9833, 2.6667], 'pobè': [6.9833, 2.6667],
  'lokossa': [6.6389, 1.7167],
  'dogbo': [6.7833, 1.7833],
  'aplahoue': [6.8333, 1.7333], 'aplahoué': [6.8333, 1.7333],
  'klouekanme': [6.8667, 1.9833], 'klouékanmé': [6.8667, 1.9833],
  'abobo': [5.4167, 2.0167],
  'adjara': [6.4833, 2.6833],
  'adjarra': [6.4500, 2.7333],
  'seme': [6.4333, 2.5833], 'sèmè': [6.4333, 2.5833],
  'kpomasse': [6.4167, 2.0500], 'kpomassè': [6.4167, 2.0500],
  'torou': [7.0500, 2.0500],
  'bohicon': [7.1783, 2.0667],
  'zagnanado': [7.0833, 2.1333],
  'cové': [7.0833, 2.3000], 'cove': [7.0833, 2.3000],
  'zakin': [7.0167, 2.1500],
  'dassa': [7.7833, 2.1667],
  'save': [8.0333, 2.4833], 'savé': [8.0333, 2.4833],
  'parakou': [9.3372, 2.6303],
  'natitingou': [10.3167, 1.3833],
  'djougou': [9.7086, 1.6658],
  'tanguieta': [10.6167, 1.2667],
  'kandi': [11.1342, 2.9386],
  'malanville': [11.8667, 3.3833],
  'nikki': [9.9417, 3.2106],
  'bembereke': [10.2833, 2.6667],
  'bassar': [6.5833, 2.1833],
  'lome': [6.1319, 1.2228], 'lomé': [6.1319, 1.2228],
  'aneho': [6.2333, 1.5833], 'aného': [6.2333, 1.5833]
};

export default function CarteVillages({ villageData }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

    const map = L.map(mapRef.current).setView([6.9, 2.1], 8);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    let nbPlaces = 0;
    villageData.forEach(v => {
      const key = (v.name || '').toLowerCase().trim();
      const coords = VILLAGE_COORDS[key];
      if (coords) {
        nbPlaces++;
        L.marker(coords, {
          icon: L.divIcon({
            html: '<div style="background:#C65D2C;color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);">' + v.value + '</div>',
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          })
        }).addTo(map).bindPopup('<b>' + v.name + '</b><br/>' + v.value + ' participant(s)');
      }
    });

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [villageData]);

  return (
    <div>
      <div ref={mapRef} style={{height: '380px', borderRadius: '12px', zIndex: 0, border: '2px solid var(--sable)'}}></div>
      <p style={{fontSize: '11px', color: '#6B5D54', marginTop: '8px', fontStyle: 'italic'}}>
        🗺️ Les cercles ocre indiquent le nombre de participants par village. Cliquez sur un cercle pour le détail.
      </p>
    </div>
  );
}
`);

// 2. Mettre à jour api.js (ajouter envoi email)
fs.writeFileSync('src/services/api.js', `import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt361jCljRmwDNhbfATncABZCYQMWQrn2vTBxU8cK6KwF9ldF6MiGBZyo14VB2vhNt/exec';

export const api = {
  async createDetenteur(data) {
    const response = await axios.post(API_URL + '/detenteurs', data);
    return response.data;
  },
  
  async getDetenteurs() {
    const response = await axios.get(API_URL + '/detenteurs');
    return response.data;
  },
  
  async generateConsentementDoc(detenteur, signature, photos = []) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ detenteur, signature, photos })
      });
      return { success: true, docUrl: null };
    } catch (error) {
      console.error('Erreur doc:', error);
      return { success: false, error: error.message };
    }
  },

  async envoyerRapportEmail(stats, email) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'rapport', stats, email })
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur email:', error);
      return { success: false, error: error.message };
    }
  }
};
`);

// 3. Ajouter createdAt au formulaire (pour stats par jour)
const formContent = fs.readFileSync('src/components/DetenteurForm.jsx', 'utf8');
const newFormContent = formContent.replace(
  'const data = { ...form, age: form.age ? parseInt(form.age) : null };',
  'const data = { ...form, age: form.age ? parseInt(form.age) : null, createdAt: new Date().toISOString() };'
);
fs.writeFileSync('src/components/DetenteurForm.jsx', newFormContent);

// 4. Réécrire Statistiques avec les 4 nouveautés + PDF conservé
fs.writeFileSync('src/components/Statistiques.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import html2pdf from 'html2pdf.js';
import CarteVillages from './CarteVillages';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936'];

export default function Statistiques() {
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const dets = await db.detenteurs.toArray();
      const files = await db.files.toArray();

      const parType = {};
      dets.forEach(d => { const t = d.typePersonne || 'Détenteur'; parType[t] = (parType[t] || 0) + 1; });
      const typeData = Object.entries(parType).map(([name, value]) => ({ name, value }));

      const sexeData = [
        { name: 'Hommes', value: dets.filter(d => d.sexe === 'M').length },
        { name: 'Femmes', value: dets.filter(d => d.sexe === 'F').length }
      ].filter(s => s.value > 0);

      const parVillage = {};
      dets.forEach(d => { const v = d.village || 'Inconnu'; parVillage[v] = (parVillage[v] || 0) + 1; });
      const villageData = Object.entries(parVillage).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

      const parLangue = {};
      dets.forEach(d => { const l = d.langue || 'Non renseigné'; parLangue[l] = (parLangue[l] || 0) + 1; });
      const langueData = Object.entries(parLangue).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

      // 🆕 ÉVOLUTION PAR JOUR
      const parJour = {};
      dets.forEach(d => {
        if (d.createdAt) {
          const dt = new Date(d.createdAt);
          const key = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          if (!parJour[key]) parJour[key] = { name: key, ts: dt.getTime(), value: 0 };
          parJour[key].value++;
        }
      });
      const jourData = Object.values(parJour).sort((a,b) => a.ts - b.ts);

      const permissions = [
        ['peutParler', 'Interview'], ['peutChanter', 'Chant/Audio'],
        ['peutEtreFilme', 'Filmé'], ['peutFilmer', 'Photographié'],
        ['preterInstrument', 'Instrument'], ['montrerLieuSacre', 'Lieu sacré']
      ].map(([key, label]) => ({ name: label, value: dets.filter(d => d[key]).length }));

      setStats({
        total: dets.length,
        signes: dets.filter(d => d.signature || d.docUrl).length,
        photos: files.filter(f => f.type === 'photo').length,
        videos: files.filter(f => f.type === 'video').length,
        audios: files.filter(f => f.type === 'audio').length,
        typeData, sexeData, villageData, langueData, jourData, permissions
      });
    } catch (e) { console.error(e); }
  };

  // 📥 EXPORT PDF (CONSERVÉ)
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
          <tr style="background: #FDF5E6;"><td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">👥 Total participants</td><td style="padding: 10px; border: 1px solid #DAA520; text-align: center; font-size: 18px; font-weight: bold;">\${stats.total}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">✍️ Consentements signés</td><td style="padding: 10px; border: 1px solid #DAA520; text-align: center; font-size: 18px; font-weight: bold;">\${stats.signes}</td></tr>
          <tr style="background: #FDF5E6;"><td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">📸 Photos</td><td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.photos}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">🎥 Vidéos</td><td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.videos}</td></tr>
          <tr style="background: #FDF5E6;"><td style="padding: 10px; border: 1px solid #DAA520; font-weight: bold;">🎤 Audios</td><td style="padding: 10px; border: 1px solid #DAA520; text-align: center;">\${stats.audios}</td></tr>
        </table>
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Répartition par type</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.typeData.map(t => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${t.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${t.value}</td></tr>\`).join('')}
        </table>
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Top villages d'origine</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.villageData.slice(0,8).map(v => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${v.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${v.value}</td></tr>\`).join('')}
        </table>
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px;">Classement des langues</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          \${stats.langueData.map((l, i) => \`<tr><td style="padding: 6px; border: 1px solid #ddd;">\${i+1}. \${l.name}</td><td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${l.value}</td></tr>\`).join('')}
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

  // 🆕 ENVOI PAR EMAIL
  const sendEmail = async () => {
    const email = window.prompt('📧 Adresse email du destinataire :');
    if (!email || !email.includes('@')) { alert('Adresse invalide'); return; }
    setSending(true);
    try {
      await api.envoyerRapportEmail(stats, email);
      alert('✅ Rapport envoyé à ' + email + ' !\\n(Vérifiez votre boîte mail dans quelques secondes)');
    } catch (e) {
      alert('❌ Erreur: ' + e.message);
    }
    setSending(false);
  };

  if (!stats) return <div style={{textAlign: 'center', padding: '50px'}}>⏳ Chargement des statistiques...</div>;

  const languesTriees = [...stats.langueData].sort((a,b) => b.value - a.value);
  const maxLangue = languesTriees[0]?.value || 1;

  return (
    <div>
      {/* Boutons d'action */}
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px'}}>
        <button onClick={exportPDF} className="btn-action pdf" style={{padding: '10px 20px', fontSize: '14px'}}>
          📥 Rapport PDF
        </button>
        <button onClick={sendEmail} disabled={sending} className="btn-action doc" style={{padding: '10px 20px', fontSize: '14px'}}>
          {sending ? '⏳ Envoi...' : '📧 Envoyer par email'}
        </button>
      </div>

      {/* Cartes chiffres clés */}
      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.total}</div><div className="stat-label">Participants</div></div>
        <div className="stat-card"><div className="stat-icon">✍️</div><div className="stat-value">{stats.signes}</div><div className="stat-label">Signés</div></div>
        <div className="stat-card"><div className="stat-icon">📸</div><div className="stat-value">{stats.photos}</div><div className="stat-label">Photos</div></div>
        <div className="stat-card"><div className="stat-icon">🎥</div><div className="stat-value">{stats.videos}</div><div className="stat-label">Vidéos</div></div>
        <div className="stat-card"><div className="stat-icon">🎤</div><div className="stat-value">{stats.audios}</div><div className="stat-label">Audios</div></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
        
        {/* 🆕 ÉVOLUTION PAR JOUR */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>📅 Évolution de l'événement (participants par jour)</h3>
          {stats.jourData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.jourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#C65D2C" fill="#DAA520" fillOpacity={0.4} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{color: '#6B5D54', fontStyle: 'italic'}}>Pas encore de données datées. Les nouveaux participants apparaîtront ici.</p>
          )}
        </div>

        {/* 🆕 CARTE DES VILLAGES */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🗺️ Carte des villages d'origine</h3>
          <CarteVillages villageData={stats.villageData} />
        </div>

        {/*  CLASSEMENT DES LANGUES */}
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🏆 Classement des langues</h3>
          {languesTriees.map((l, i) => (
            <div key={l.name} style={{marginBottom: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px'}}>
                <span style={{fontWeight: 'bold'}}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1) + '.'} {l.name}</span>
                <span style={{color: 'var(--ocre)', fontWeight: 'bold'}}>{l.value}</span>
              </div>
              <div style={{background: 'var(--sable)', borderRadius: '10px', height: '10px', overflow: 'hidden'}}>
                <div style={{
                  width: ((l.value / maxLangue) * 100) + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #C65D2C, #DAA520)',
                  borderRadius: '10px',
                  transition: 'width 0.5s'
                }}></div>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}
`);

console.log('🎉 Les 4 fonctionnalités avancées sont en place !');
