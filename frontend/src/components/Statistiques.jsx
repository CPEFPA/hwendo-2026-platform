import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import CarteVillages from './CarteVillages';
import { genererRapportComplet, capturerGraphiques } from './RapportPDF';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936'];

export default function Statistiques() {
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const dets = await db.detenteurs.toArray();
      const files = await db.files.toArray();

      const parType = {};
      dets.forEach(d => { const t = d.typePersonne || 'DÃ©tenteur'; parType[t] = (parType[t] || 0) + 1; });
      const typeData = Object.entries(parType).map(([name, value]) => ({ name, value }));

      const sexeData = [
        { name: 'Hommes', value: dets.filter(d => d.sexe === 'M').length },
        { name: 'Femmes', value: dets.filter(d => d.sexe === 'F').length }
      ].filter(s => s.value > 0);

      const parVillage = {};
      dets.forEach(d => { const v = d.village || 'Inconnu'; parVillage[v] = (parVillage[v] || 0) + 1; });
      const villageData = Object.entries(parVillage).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

      const parLangue = {};
      dets.forEach(d => { const l = d.langue || 'Non renseignÃ©'; parLangue[l] = (parLangue[l] || 0) + 1; });
      const langueData = Object.entries(parLangue).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

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
        ['peutEtreFilme', 'FilmÃ©'], ['peutFilmer', 'PhotographiÃ©'],
        ['preterInstrument', 'Instrument'], ['montrerLieuSacre', 'Lieu sacrÃ©']
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

  const exportPDF = async () => {
    if (!stats) return;
    setExporting(true);
    try {
      await genererRapportComplet(stats);
    } catch (e) {
      alert('Erreur export: ' + e.message);
    }
    setExporting(false);
  };

  const sendEmail = async () => {
    const email = window.prompt('ðŸ“§ Adresse email du destinataire :');
    if (!email || !email.includes('@')) { alert('Adresse invalide'); return; }
    setSending(true);
    try {
      // Capturer les graphiques en base64
      const images = await capturerGraphiques(stats);
      await api.envoyerRapportEmail(stats, email, images);
      alert('âœ… Rapport envoyÃ© Ã  ' + email + ' !\n(VÃ©rifiez votre boÃ®te mail dans quelques secondes)');
    } catch (e) {
      alert('âŒ Erreur: ' + e.message);
    }
    setSending(false);
  };

  if (!stats) return <div style={{textAlign: 'center', padding: '50px'}}>â³ Chargement des statistiques...</div>;

  const languesTriees = [...stats.langueData].sort((a,b) => b.value - a.value);
  const maxLangue = languesTriees[0]?.value || 1;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px'}}>
        <button onClick={exportPDF} disabled={exporting} className="btn-action pdf" style={{padding: '10px 20px', fontSize: '14px'}}>
          {exporting ? 'â³ GÃ©nÃ©ration...' : 'ðŸ“¥ Rapport PDF complet'}
        </button>
        <button onClick={sendEmail} disabled={sending} className="btn-action doc" style={{padding: '10px 20px', fontSize: '14px'}}>
          {sending ? 'â³ Envoi...' : 'ðŸ“§ Envoyer par email'}
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-icon">ðŸ‘¥</div><div className="stat-value">{stats.total}</div><div className="stat-label">Participants</div></div>
        <div className="stat-card"><div className="stat-icon">âœï¸</div><div className="stat-value">{stats.signes}</div><div className="stat-label">SignÃ©s</div></div>
        <div className="stat-card"><div className="stat-icon">ðŸ“¸</div><div className="stat-value">{stats.photos}</div><div className="stat-label">Photos</div></div>
        <div className="stat-card"><div className="stat-icon">ðŸŽ¥</div><div className="stat-value">{stats.videos}</div><div className="stat-label">VidÃ©os</div></div>
        <div className="stat-card"><div className="stat-icon">ðŸŽ¤</div><div className="stat-value">{stats.audios}</div><div className="stat-label">Audios</div></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸ“… Ã‰volution de l'Ã©vÃ©nement</h3>
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
            <p style={{color: '#6B5D54', fontStyle: 'italic'}}>Pas encore de donnÃ©es datÃ©es.</p>
          )}
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸ—ºï¸ Carte des villages d'origine</h3>
          <CarteVillages villageData={stats.villageData} />
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸ† Classement des langues</h3>
          {languesTriees.map((l, i) => (
            <div key={l.name} style={{marginBottom: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px'}}>
                <span style={{fontWeight: 'bold'}}>{i === 0 ? 'ðŸ¥‡' : i === 1 ? 'ðŸ¥ˆ' : i === 2 ? 'ðŸ¥‰' : (i+1) + '.'} {l.name}</span>
                <span style={{color: 'var(--ocre)', fontWeight: 'bold'}}>{l.value}</span>
              </div>
              <div style={{background: 'var(--sable)', borderRadius: '10px', height: '10px', overflow: 'hidden'}}>
                <div style={{width: ((l.value / maxLangue) * 100) + '%', height: '100%', background: 'linear-gradient(90deg, #C65D2C, #DAA520)', borderRadius: '10px'}}></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸ‘¥ Par type de personne</h3>
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

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>âš¥ RÃ©partition par sexe</h3>
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

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>ðŸŽ­ Permissions accordÃ©es</h3>
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
