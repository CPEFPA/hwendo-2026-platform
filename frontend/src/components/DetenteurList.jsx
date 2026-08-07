import { useState, useEffect } from 'react';
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
              <h3>{d.typePersonne === 'Invité' ? '🤐' : d.typePersonne === 'Visiteur' ? 'ðŸš¶' : d.typePersonne === 'Spectateur' ? 'ðŸ‘ï¸' : '🎵'} {d.nomComplet}</h3>
              <div className="village">📝 Originaire de {d.village}</div>
              {d.lieuSignature && <div style={{fontSize: '11px', opacity: 0.9, marginTop: '3px'}}>✍️ï¸ Signé À  {d.lieuSignature}</div>}
              {d.syncStatus === 'synced' && (
                <span className="sync-badge">✍️… SYNC</span>
              )}
            </div>
            <div className="detenteur-card-body">
              <div className="info-row">
                <span className="info-label">À‚ge</span>
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
                  📝„ Google Docs
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
