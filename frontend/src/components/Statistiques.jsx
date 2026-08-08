import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import CarteVillages from './CarteVillages';

// Emojis via String.fromCodePoint (100% fiable, aucun probleme d'encodage)
const icon = {
  people: String.fromCodePoint(0x1F465),
  pen: String.fromCodePoint(0x270D) + String.fromCodePoint(0xFE0F),
  camera: String.fromCodePoint(0x1F4F8),
  video: String.fromCodePoint(0x1F3A5),
  audio: String.fromCodePoint(0x1F3A4),
  calendar: String.fromCodePoint(0x1F4C5),
  map: String.fromCodePoint(0x1F5FA) + String.fromCodePoint(0xFE0F),
  trophy: String.fromCodePoint(0x1F3C6),
  chart: String.fromCodePoint(0x1F4CA),
  music: String.fromCodePoint(0x1F3B5),
  download: String.fromCodePoint(0x1F4E5),
  email: String.fromCodePoint(0x1F4E7),
  gender: String.fromCodePoint(0x26A5),
  check: String.fromCodePoint(0x2705)
};

// Composant graphique en barres (CSS pur, sans dependance externe)
function BarChart({ data, color }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>Pas encore de donnees.</p>;
  }
  const max = Math.max.apply(null, data.map(d => d.value).concat([1]));
  return (
    <div>
      {data.map((item, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' }}>
            <span style={{ color: 'var(--terre)' }}>{item.name}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--ocre)' }}>{item.value}</span>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
            <div style={{
              width: ((item.value / max) * 100) + '%',
              background: color || 'linear-gradient(90deg, #C65D2C, #DAA520)',
              height: '100%',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Carte de statistique
function StatCard({ iconChar, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{iconChar}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Statistiques() {
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      let dets = [];

      // 1. Charger depuis le backend si en ligne (pour la synchronisation)
      if (navigator.onLine) {
        try {
          const backendDets = await api.getDetenteurs();
          if (backendDets && backendDets.length > 0) {
            dets = backendDets;
            console.log('Stats: donnees depuis backend:', dets.length);
          }
        } catch (e) {
          console.warn('Stats: backend indisponible, utilisation locale');
        }
      }

      // 2. IndexedDB local (fallback + source des medias)
      const localDets = await db.detenteurs.toArray();
      if (dets.length === 0) {
        dets = localDets;
      }

      // 3. Compter les medias depuis IndexedDB local
      let photos = 0, videos = 0, audios = 0;
      localDets.forEach(d => {
        if (d.photos && Array.isArray(d.photos)) photos += d.photos.length;
        if (d.videos && Array.isArray(d.videos)) videos += d.videos.length;
        if (d.audios && Array.isArray(d.audios)) audios += d.audios.length;
      });
      try {
        const files = await db.files.toArray();
        photos += files.filter(f => f.type === 'photo').length;
        videos += files.filter(f => f.type === 'video').length;
        audios += files.filter(f => f.type === 'audio').length;
      } catch (e) {}

      // 4. Signes (signature locale OU consentement backend OU doc Google)
      const signes = dets.filter(d => d.signature || d.consentementSigne || d.docUrl).length;

      // 5. Donnees pour les graphiques
      const langueCount = {};
      const sexeCount = { M: 0, F: 0 };
      const typeCount = {};
      const jourCount = {};

      dets.forEach(d => {
        if (d.langue) langueCount[d.langue] = (langueCount[d.langue] || 0) + 1;
        if (d.sexe) sexeCount[d.sexe] = (sexeCount[d.sexe] || 0) + 1;
        const t = d.typePersonne || d.fonctionPalais || 'Detenteur';
        typeCount[t] = (typeCount[t] || 0) + 1;
        if (d.createdAt) {
          const day = new Date(d.createdAt).toLocaleDateString('fr-FR');
          jourCount[day] = (jourCount[day] || 0) + 1;
        }
      });

      const langueData = Object.entries(langueCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      const typeData = Object.entries(typeCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      const jourData = Object.entries(jourCount)
        .map(([name, value]) => ({ name, value }));
      const sexeData = [
        { name: 'Femmes', value: sexeCount.F || 0 },
        { name: 'Hommes', value: sexeCount.M || 0 }
      ];

      const permKeys = [
        ['peutParler', 'Interviewe(e)'],
        ['peutChanter', 'Chanter / Jouer'],
        ['peutEtreFilme', 'Etre filme(e)'],
        ['peutFilmer', 'Etre photographie(e)'],
        ['preterInstrument', 'Preter un instrument'],
        ['montrerLieuSacre', 'Montrer un lieu sacre']
      ];
      const permissions = permKeys.map(([key, label]) => ({
        name: label,
        value: dets.filter(d => d[key] === true || d[key] === 'OUI').length
      }));

      setStats({
        total: dets.length,
        signes,
        photos,
        videos,
        audios,
        langueData,
        typeData,
        jourData,
        sexeData,
        permissions,
        detenteurs: dets
      });
    } catch (e) {
      console.error('Erreur stats:', e);
      setStats({
        total: 0, signes: 0, photos: 0, videos: 0, audios: 0,
        langueData: [], typeData: [], jourData: [], sexeData: [],
        permissions: [], detenteurs: []
      });
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 300);
  };

  const handleSendEmail = () => {
    if (!stats) return;
    setSending(true);
    const subject = encodeURIComponent('Rapport HWENDO 2026 - Statistiques de la mission');
    const bodyText = encodeURIComponent(
      'RAPPORT HWENDO 2026\n' +
      'Mission de sauvegarde du patrimoine musical\n\n' +
      'Participants: ' + stats.total + '\n' +
      'Consentements signes: ' + stats.signes + '\n' +
      'Photos capturees: ' + stats.photos + '\n' +
      'Videos: ' + stats.videos + '\n' +
      'Audios: ' + stats.audios + '\n\n' +
      'Genere le ' + new Date().toLocaleString('fr-FR')
    );
    window.location.href = 'mailto:?subject=' + subject + '&body=' + bodyText;
    setTimeout(() => setSending(false), 1000);
  };

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gris)' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>{icon.chart}</div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  const sectionStyle = {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(139,69,19,0.1)',
    marginBottom: '20px'
  };

  const titleStyle = {
    color: 'var(--terre)',
    fontSize: '16px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div>
      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          style={{
            background: 'linear-gradient(135deg, #C65D2C, #8B4513)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: exporting ? 'wait' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {icon.download} Rapport PDF complet
        </button>
        <button
          onClick={handleSendEmail}
          disabled={sending}
          style={{
            background: 'linear-gradient(135deg, #2d6a4f, #1b4332)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: sending ? 'wait' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {icon.email} Envoyer par email
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="dashboard-stats">
        <StatCard iconChar={icon.people} value={stats.total} label="Participants" />
        <StatCard iconChar={icon.pen} value={stats.signes} label="Signes" />
        <StatCard iconChar={icon.camera} value={stats.photos} label="Photos" />
        <StatCard iconChar={icon.video} value={stats.videos} label="Videos" />
        <StatCard iconChar={icon.audio} value={stats.audios} label="Audios" />
      </div>

      {/* Evolution de l'evenement */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.calendar} Evolution de l'evenement</h3>
        {stats.jourData.length > 0
          ? <BarChart data={stats.jourData} />
          : <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>Pas encore de donnees datees.</p>
        }
      </div>

      {/* Carte des villages */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.map} Carte des villages d'origine</h3>
        <CarteVillages detenteurs={stats.detenteurs} />
      </div>

      {/* Classement des langues */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.trophy} Classement des langues</h3>
        <BarChart data={stats.langueData} />
      </div>

      {/* Par type de personne */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.people} Par type de personne</h3>
        <BarChart data={stats.typeData} />
      </div>

      {/* Repartition par sexe */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.gender} Repartition par sexe</h3>
        <BarChart data={stats.sexeData} />
      </div>

      {/* Permissions accordees */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>{icon.music} Permissions accordees</h3>
        <BarChart data={stats.permissions} />
      </div>
    </div>
  );
}
