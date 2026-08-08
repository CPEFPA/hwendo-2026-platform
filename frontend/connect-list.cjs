const fs = require('fs');
const path = require('path');

const newList = `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import PDFGenerator from './PDFGenerator';

function DetenteurList() {
  const [detenteurs, setDetenteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadData();
    
    const handleOnline = () => {
      setIsOnline(true);
      syncFromBackend();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Essayer d'abord le backend si en ligne
      if (isOnline) {
        try {
          const backendData = await api.getDetenteurs();
          console.log('✅ Données depuis backend:', backendData.length);
          setDetenteurs(backendData);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('⚠️ Backend indisponible, utilisation IndexedDB');
        }
      }
      
      // Fallback sur IndexedDB
      const localData = await db.detenteurs.toArray();
      setDetenteurs(localData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFromBackend = async () => {
    if (!isOnline) return;
    try {
      const backendData = await api.getDetenteurs();
      setDetenteurs(backendData);
      console.log('✅ Sync backend:', backendData.length);
    } catch (err) {
      console.warn('⚠️ Sync échoué');
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>⏳ Chargement...</div>;
  }

  return (
    <div>
      <div style={{textAlign: 'right', marginBottom: '15px'}}>
        {isOnline ? (
          <span style={{color: 'green', fontSize: '12px'}}>🟢 En ligne - {detenteurs.length} détenteurs</span>
        ) : (
          <span style={{color: 'orange', fontSize: '12px'}}>🟠 Hors ligne - {detenteurs.length} détenteurs locaux</span>
        )}
        <button onClick={loadData} style={{marginLeft: '10px', padding: '5px 10px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>🔄 Rafraîchir</button>
      </div>

      <div className="detenteurs-grid">
        {detenteurs.map((det) => (
          <div key={det.id || det.reference} className="detenteur-card">
            <div className="detenteur-card-header">
              <h3>🎵 {det.nomComplet}</h3>
              <div className="village">📍 Originaire de {det.village}</div>
            </div>
            <div className="detenteur-card-body">
              <div className="info-row">
                <span className="info-label">Âge</span>
                <span className="info-value">{det.age || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sexe</span>
                <span className="info-value">{det.sexe === 'M' ? '♂ Masculin' : '♀ Féminin'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Fonction</span>
                <span className="info-value">{det.fonctionPalais || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Langue</span>
                <span className="info-value">{det.langue || 'N/A'}</span>
              </div>
            </div>
            <div className="detenteur-card-actions">
              <PDFGenerator detenteur={det} />
            </div>
          </div>
        ))}
      </div>

      {detenteurs.length === 0 && (
        <div style={{textAlign: 'center', padding: '60px', color: 'var(--gris)'}}>
          <p style={{fontSize: '48px', marginBottom: '20px'}}>📝</p>
          <p>Aucun détenteur enregistré pour le moment</p>
        </div>
      )}
    </div>
  );
}

export default DetenteurList;
`;

fs.writeFileSync(path.join(__dirname, 'src/components/DetenteurList.jsx'), newList, 'utf8');
console.log('✅ DetenteurList.jsx connecté au backend');