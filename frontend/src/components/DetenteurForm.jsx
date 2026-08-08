import { useState, useRef, useEffect } from 'react';
import { db } from '../db/localDB';
import MediaCapture from './MediaCapture';
import SignatureCanvas from './SignatureCanvas';
import { api } from '../services/api';

// URL Google Apps Script pour la création des consentements
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3mtlER8VU1RfeJlPrv0CMiy-MOdrFioMODyGFt-74fA56rGbbHTak7MLkMyKAdPoF/exec';

// Fonction pour envoyer les données à Google Apps Script
async function sendToGoogleAppsScript(detenteur) {
  if (!APPS_SCRIPT_URL) {
    console.warn('URL Apps Script non configurée');
    return null;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('nomComplet', detenteur.nomComplet || '');
    formData.append('surnomRituel', detenteur.surnomRituel || '');
    formData.append('age', detenteur.age || '');
    formData.append('sexe', detenteur.sexe || '');
    formData.append('village', detenteur.village || '');
    formData.append('fonctionPalais', detenteur.fonctionPalais || '');
    formData.append('telephone', detenteur.telephone || '');
    formData.append('langue', detenteur.langue || '');
    formData.append('peutParler', detenteur.peutParler ? 'OUI' : 'NON');
    formData.append('peutChanter', detenteur.peutChanter ? 'OUI' : 'NON');
    formData.append('peutEtreFilme', detenteur.peutEtreFilme ? 'OUI' : 'NON');
    formData.append('peutFilmer', detenteur.peutFilmer ? 'OUI' : 'NON');
    formData.append('preterInstrument', detenteur.preterInstrument ? 'OUI' : 'NON');
    formData.append('montrerLieuSacre', detenteur.montrerLieuSacre ? 'OUI' : 'NON');
    formData.append('anonymiser', detenteur.anonymiser ? 'OUI' : 'NON');
    formData.append('nomTraditionnelJamaisEcrit', detenteur.nomTraditionnelJamaisEcrit ? 'OUI' : 'NON');
    formData.append('notes', detenteur.notes || '');
    formData.append('gps', detenteur.gps || '');
    formData.append('dateSignature', new Date().toLocaleDateString('fr-FR'));
    formData.append('lieuSignature', detenteur.lieuSignature || 'OUIDAH');

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('Données envoyées à Google Apps Script');
    return true;
  } catch (error) {
    console.error('Erreur Google Apps Script:', error);
    return null;
  }
}

function DetenteurForm({ onSaved }) {
  const [form, setForm] = useState({
    typePersonne: 'Détenteur',
    nomComplet: '',
    surnomRituel: '',
    age: '',
    sexe: 'M',
    village: '',
    fonctionPalais: '',
    telephone: '',
    langue: 'Fon',
    evenement: '',
    lieuSignature: 'OUIDAH',
    peutParler: true,
    peutChanter: false,
    peutEtreFilme: false,
    peutFilmer: true,
    preterInstrument: false,
    montrerLieuSacre: false,
    anonymiser: false,
    nomTraditionnelJamaisEcrit: false,
    notes: ''
  });

  const [signature, setSignature] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps(`${pos.coords.latitude},${pos.coords.longitude}`);
          setMessage('📍 GPS capturé');
          setTimeout(() => setMessage(''), 2000);
        },
        (err) => {
          setMessage('❌ GPS non disponible');
          setTimeout(() => setMessage(''), 2000);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nomComplet || !form.village) {
      setMessage('❌ Nom et village obligatoires');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('💾 Enregistrement...');

    try {
      // 1. Sauvegarder en local (IndexedDB) - toujours
      const detenteur = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        signature: signature || null,
        gps: gps || null,
        photos: photos.map(p => ({ type: 'photo', data: p })),
        videos: videos.map(v => ({ type: 'video', data: v })),
        audios: audios.map(a => ({ type: 'audio', data: a })),
        createdAt: new Date().toISOString()
      };

      const localId = await db.detenteurs.add(detenteur);
      console.log('✅ Sauvegardé localement:', localId);

      // 2. Synchroniser avec le backend si en ligne
      if (isOnline) {
        try {
          setMessage('🌐 Synchronisation...');
          const backendData = {
            nomComplet: form.nomComplet,
            village: form.village,
            sexe: form.sexe,
            age: form.age ? parseInt(form.age) : null,
            surnomRituel: form.surnomRituel || '',
            fonctionPalais: form.fonctionPalais || '',
            telephone: form.telephone || '',
            langue: form.langue || 'Fon',
            consentementSigne: signature ? true : false,
            notes: form.notes || '',
            coordonneesGPS: gps || ''
          };

          const result = await api.createDetenteur(backendData);
          console.log('✅ Synchronisé avec backend:', result);
          
          // Marquer comme synchronisé en local
          await db.detenteurs.update(localId, { synced: true, backendId: result.id });
          
          // Envoyer à Google Apps Script pour créer le consentement
          try {
            await sendToGoogleAppsScript(detenteur);
            console.log('Consentement envoyé à Google Docs');
          } catch (googleError) {
            console.warn('Erreur envoi Google:', googleError);
          }
          
          setMessage('✅ Enregistré et synchronisé !');
        } catch (syncError) {
          console.warn('⚠️ Sync backend échoué:', syncError);
          setMessage('✅ Enregistré localement (sync plus tard)');
        }
      } else {
        setMessage('✅ Enregistré localement (hors ligne)');
      }

      setTimeout(() => {
        setMessage('');
        setForm({
          typePersonne: 'Détenteur',
          nomComplet: '',
          surnomRituel: '',
          age: '',
          sexe: 'M',
          village: '',
          fonctionPalais: '',
          telephone: '',
          langue: 'Fon',
          evenement: '',
          lieuSignature: 'OUIDAH',
          peutParler: true,
          peutChanter: false,
          peutEtreFilme: false,
          peutFilmer: true,
          preterInstrument: false,
          montrerLieuSacre: false,
          anonymiser: false,
          nomTraditionnelJamaisEcrit: false,
          notes: ''
        });
        setSignature(null);
        setPhotos([]);
        setVideos([]);
        setAudios([]);
        setGps(null);
        setLoading(false);
        
        if (onSaved) onSaved();
      }, 2000);

    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur: ' + error.message);
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="hwendo-form">
      <div style={{textAlign: 'right', marginBottom: '10px'}}>
        {isOnline ? (
          <span style={{color: 'green', fontSize: '12px'}}>🟢 En ligne</span>
        ) : (
          <span style={{color: 'orange', fontSize: '12px'}}>🟠 Hors ligne</span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <h3>🎭 Type de personne</h3>
        <select name="typePersonne" value={form.typePersonne} onChange={handleChange}>
          <option value="Détenteur">🎵 Détenteur de savoirs</option>
          <option value="Musicien">🎼 Musicien</option>
          <option value="Griot">📜 Griot</option>
          <option value="Prêtre Vodun">🙏 Prêtre Vodun</option>
          <option value="Danseur">💃 Danseur</option>
          <option value="Notable">👑 Notable</option>
          <option value="Invité">🎁 Invité</option>
        </select>

        <h3>📋 Contexte de la signature</h3>
        <select name="lieuSignature" value={form.lieuSignature} onChange={handleChange}>
          <option value="OUIDAH">OUIDAH</option>
          <option value="Pahou">Pahou</option>
          <option value="Agoè">Agoè</option>
          <option value="Bopa">Bopa</option>
        </select>
        <input name="evenement" value={form.evenement} onChange={handleChange} placeholder="Événement / Occasion" />

        <h3>👤 Identité</h3>
        <input name="nomComplet" value={form.nomComplet} onChange={handleChange} placeholder="Nom complet *" required />
        <input name="surnomRituel" value={form.surnomRituel} onChange={handleChange} placeholder="Surnom rituel" />
        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Âge" />
        <select name="sexe" value={form.sexe} onChange={handleChange}>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        <input name="village" value={form.village} onChange={handleChange} placeholder="Village d'origine *" required />
        <input name="fonctionPalais" value={form.fonctionPalais} onChange={handleChange} placeholder="Fonction au palais" />
        <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" />
        <select name="langue" value={form.langue} onChange={handleChange}>
          <option value="Fon">Fon</option>
          <option value="Mina">Mina</option>
          <option value="Yoruba">Yoruba</option>
          <option value="Français">Français</option>
        </select>

        <h3>🎭 Permissions</h3>
        <div className="checkbox-group">
          <label><input type="checkbox" name="peutParler" checked={form.peutParler} onChange={handleChange} /> 🎤 Être interviewé(e)</label>
          <label><input type="checkbox" name="peutChanter" checked={form.peutChanter} onChange={handleChange} /> 🎵 Chanter / Jouer</label>
          <label><input type="checkbox" name="peutEtreFilme" checked={form.peutEtreFilme} onChange={handleChange} /> 🎥 Être filmé(e)</label>
          <label><input type="checkbox" name="peutFilmer" checked={form.peutFilmer} onChange={handleChange} /> 📸 Être photographié(e)</label>
          <label><input type="checkbox" name="preterInstrument" checked={form.preterInstrument} onChange={handleChange} /> 🪘 Prêter un instrument</label>
          <label><input type="checkbox" name="montrerLieuSacre" checked={form.montrerLieuSacre} onChange={handleChange} /> 🏛️ Montrer un lieu sacré</label>
        </div>

        <h3>🔒 Spécificités Vodun</h3>
        <div className="checkbox-group">
          <label><input type="checkbox" name="anonymiser" checked={form.anonymiser} onChange={handleChange} /> 🕶️ Anonymiser mon nom</label>
          <label><input type="checkbox" name="nomTraditionnelJamaisEcrit" checked={form.nomTraditionnelJamaisEcrit} onChange={handleChange} /> 🤐 Nom traditionnel jamais écrit</label>
        </div>

        <h3>📍 Localisation</h3>
        <button type="button" className="btn-gps" onClick={captureGPS}>📍 Capturer GPS</button>
        {gps && <p style={{color: 'green', fontSize: '12px'}}>✅ GPS: {gps}</p>}

        <h3>📝 Notes terrain</h3>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Observations, contexte..." />

        <h3>✍️ Signature manuscrite</h3>
        <SignatureCanvas onSave={setSignature} />

        <h3>🎬 Capture Médias</h3>
        <MediaCapture onPhoto={(p) => setPhotos([...photos, p])} onVideo={(v) => setVideos([...videos, v])} onAudio={(a) => setAudios([...audios, a])} />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Enregistrement...' : '✅ Enregistrer le participant'}
        </button>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default DetenteurForm;
