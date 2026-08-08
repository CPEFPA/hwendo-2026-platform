import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import PDFGenerator from './PDFGenerator';

const API_BASE = 'https://hwendo-backend.onrender.com/api';

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
      <div style={{
        width: '100px', height: '120px', borderRadius: '8px',
        overflow: 'hidden', flexShrink: 0, background: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {localMedia.photo ? (
          <img src={localMedia.photo} alt={det.nomComplet}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '5px' }}>{String.fromCodePoint(0x1F4F7)}</div>
            <div>Pas de photo</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--terre)', fontSize: '18px' }}>
              {String.fromCodePoint(0x1F3B5)} {det.nomComplet}
            </h3>
            <div style={{ color: 'var(--gris)', fontSize: '13px', marginTop: '2px' }}>
              {String.fromCodePoint(0x1F4CD)} Originaire de {det.village}
            </div>
          </div>
          {localMedia.signature && (
            <div style={{
              background: 'rgba(72, 187, 120, 0.15)', padding: '4px 8px',
              borderRadius: '4px', fontSize: '11px', color: '#2d6a4f', fontWeight: 'bold'
            }}>
              {String.fromCodePoint(0x270D)}{String.fromCodePoint(0xFE0F)} Signé
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
          <div><strong>Âge:</strong> {det.age || 'N/A'}</div>
          <div><strong>Sexe:</strong> {det.sexe === 'M' ? '♂ Masculin' : det.sexe === 'F' ? '♀ Féminin' : 'N/A'}</div>
          <div><strong>Fonction:</strong> {det.fonctionPalais || 'N/A'}</div>
          <div><strong>Langue:</strong> {det.langue || 'N/A'}</div>
        </div>
      </div>

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
  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadData();
    const handleOnline = () => { setIsOnline(true); syncFromBackend(); };
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

  // ===== REINITIALISATION COMPLETE =====
  const handleReset = async () => {
    if (resetText !== 'SUPPRIMER') {
      alert('Veuillez taper exactement SUPPRIMER pour confirmer.');
      return;
    }
    setResetting(true);
    let backendOk = true;
    try {
      // 1. Vider IndexedDB local (détenteurs + fichiers)
      await db.detenteurs.clear();
      try { await db.files.clear(); } catch (e) {}
      console.log('IndexedDB vidé');

      // 2. Vider le backend si en ligne (une seule requête DELETE)
      if (navigator.onLine) {
        try {
          const response = await fetch(API_BASE + '/detenteurs', { method: 'DELETE' });
          if (response.ok) {
            const result = await response.json();
            console.log('Backend vidé:', result.count, 'détenteurs supprimés');
          } else {
            console.warn('Erreur suppression backend:', response.status);
            backendOk = false;
          }
        } catch (e) {
          console.warn('Erreur suppression backend:', e);
          backendOk = false;
        }
      }

      setShowReset(false);
      setResetText('');
      await loadData();

      if (backendOk) {
        alert('Réinitialisation terminée ! L\'application est prête pour les enquêteurs.');
      } else {
        alert('Réinitialisation locale terminée. Certaines données backend n\'ont pas pu être supprimées (vérifiez que l\'endpoint DELETE existe).');
      }
    } catch (e) {
      console.error('Erreur réinitialisation:', e);
      alert('Erreur lors de la réinitialisation: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{String.fromCodePoint(0x23F3)} Chargement...</div>;
  }

  return (
    <div>
      {/* Barre supérieure avec boutons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
        {isOnline ? (
          <span style={{ color: 'green', fontSize: '12px' }}>{String.fromCodePoint(0x1F7E2)} En ligne - {detenteurs.length} détenteurs</span>
        ) : (
          <span style={{ color: 'orange', fontSize: '12px' }}>{String.fromCodePoint(0x1F7E0)} Hors ligne - {detenteurs.length} détenteurs locaux</span>
        )}
        <button onClick={loadData} style={{
          padding: '6px 12px', background: '#4299e1', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
        }}>
          {String.fromCodePoint(0x1F504)} Rafraîchir
        </button>
        <button onClick={() => setShowReset(true)} style={{
          padding: '6px 12px', background: '#e53e3e', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
        }}>
          {String.fromCodePoint(0x1F5D1)} Réinitialiser
        </button>
      </div>

      {/* Modal de confirmation */}
      {showReset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '30px',
            maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#e53e3e', marginTop: 0 }}>
              {String.fromCodePoint(0x26A0)}{String.fromCodePoint(0xFE0F)} Réinitialisation complète
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Cette action va <strong>supprimer définitivement</strong> :
            </p>
            <ul style={{ fontSize: '13px', lineHeight: '1.8', color: '#555' }}>
              <li>Tous les détenteurs enregistrés</li>
              <li>Toutes les photos, vidéos et audios</li>
              <li>Toutes les signatures</li>
              <li>Les données locales ET synchronisées</li>
            </ul>
            <p style={{ fontSize: '13px', background: '#fff3cd', padding: '10px', borderRadius: '6px', border: '1px solid #ffc107' }}>
              {String.fromCodePoint(0x1F4A1)} Utilisez cette action pour remettre l'application à zéro avant de la distribuer aux enquêteurs.
            </p>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginTop: '15px', marginBottom: '5px' }}>
              Tapez <span style={{ color: '#e53e3e' }}>SUPPRIMER</span> pour confirmer :
            </label>
            <input
              type="text"
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder="SUPPRIMER"
              style={{
                width: '100%', padding: '10px', border: '2px solid #e53e3e',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
                textTransform: 'uppercase'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setShowReset(false); setResetText(''); }}
                disabled={resetting}
                style={{
                  flex: 1, padding: '12px', background: '#f0f0f0', color: '#333',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                disabled={resetting || resetText !== 'SUPPRIMER'}
                style={{
                  flex: 1, padding: '12px',
                  background: resetText === 'SUPPRIMER' ? '#e53e3e' : '#ccc',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: resetText === 'SUPPRIMER' ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                {resetting ? 'Réinitialisation...' : 'Tout supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des détenteurs */}
      <div className="detenteurs-grid">
        {detenteurs.map((det) => (
          <DetenteurCard key={det.id || det.reference} det={det} />
        ))}
      </div>

      {detenteurs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gris)' }}>
          <p style={{ fontSize: '48px', marginBottom: '20px' }}>{String.fromCodePoint(0x1F4DD)}</p>
          <p>Aucun détenteur enregistré pour le moment</p>
        </div>
      )}
    </div>
  );
}

export default DetenteurList;
