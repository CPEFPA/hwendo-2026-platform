import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import PDFGenerator from './PDFGenerator';

function DetenteurCard({ det }) {
  const [localMedia, setLocalMedia] = useState({ photo: null, signature: null });

  useEffect(() => {
    loadMedia();
  }, [det]);

  const loadMedia = async () => {
    try {
      let localDet = null;
      
      if (det.nomComplet) {
        localDet = await db.detenteurs.where('nomComplet').equals(det.nomComplet).first();
      }
      
      if (!localDet && det.backendId) {
        localDet = await db.detenteurs.where('backendId').equals(det.backendId).first();
      }
      
      if (!localDet) {
        const allDets = await db.detenteurs.toArray();
        localDet = allDets.find(d => 
          d.nomComplet && det.nomComplet && 
          d.nomComplet.toLowerCase().includes(det.nomComplet.toLowerCase())
        );
      }
      
      if (localDet) {
        const signature = localDet.signature || null;
        let photo = null;
        
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
        }
        
        setLocalMedia({ photo, signature });
      }
    } catch (e) {
      console.warn('Erreur chargement media:', e);
    }
  };

  return (
    <div className="detenteur-card" style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(139,69,19,0.1)',
      display: 'flex',
      gap: '15px',
      marginBottom: '15px'
    }}>
      {/* Photo à gauche */}
      <div style={{
        width: '100px',
        height: '120px',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {localMedia.photo ? (
          <img 
            src={localMedia.photo} 
            alt={det.nomComplet}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '5px' }}>📷</div>
            <div>Pas de photo</div>
          </div>
        )}
      </div>

      {/* Informations au centre */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--terre)', fontSize: '18px' }}>
              🎵 {det.nomComplet}
            </h3>
            <div style={{ color: 'var(--gris)', fontSize: '13px', marginTop: '2px' }}>
              📍 Originaire de {det.village}
            </div>
          </div>
          {localMedia.signature && (
            <div style={{
              background: 'rgba(72, 187, 120, 0.15)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#2d6a4f',
              fontWeight: 'bold'
            }}>
              ✍️ Signé
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
          <div>
            <strong>Âge:</strong> {det.age || 'N/A'}
          </div>
          <div>
            <strong>Sexe:</strong> {det.sexe === 'M' ? '♂ Masculin' : det.sexe === 'F' ? '♀ Féminin' : 'N/A'}
          </div>
          <div>
            <strong>Fonction:</strong> {det.fonctionPalais || 'N/A'}
          </div>
          <div>
            <strong>Langue:</strong> {det.langue || 'N/A'}
          </div>
        </div>
      </div>

      {/* Bouton PDF à droite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
        <PDFGenerator detenteur={det} />
      </div>
    </div>
  );
}

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
      if (isOnline) {
        try {
          const backendData = await api.getDetenteurs();
          console.log('Données depuis backend:', backendData.length);
          setDetenteurs(backendData);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Backend indisponible, utilisation IndexedDB');
        }
      }
      
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
    } catch (err) {
      console.warn('Sync échoué');
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>⏳ Chargement...</div>;
  }

  return (
    <div>
      <div style={{textAlign: 'right', marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center'}}>
        {isOnline ? (
          <span style={{color: 'green', fontSize: '12px'}}>🟢 En ligne - {detenteurs.length} détenteurs</span>
        ) : (
          <span style={{color: 'orange', fontSize: '12px'}}>🟠 Hors ligne - {detenteurs.length} détenteurs locaux</span>
        )}
        <button onClick={loadData} style={{padding: '5px 10px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>🔄 Rafraîchir</button>
      </div>

      <div className="detenteurs-grid">
        {detenteurs.map((det) => (
          <DetenteurCard key={det.id || det.reference} det={det} />
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
