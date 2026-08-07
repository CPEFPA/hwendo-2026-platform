const fs = require('fs');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt361jCljRmwDNhbfATncABZCYQMWQrn2vTBxU8cK6KwF9ldF6MiGBZyo14VB2vhNt/exec';

// Réécrire DetenteurForm pour envoyer les photos
fs.writeFileSync('src/components/DetenteurForm.jsx', `import { useState, useRef, useMemo } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import MediaCapture from './MediaCapture';

// Fonction pour convertir un Blob en base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function DetenteurForm() {
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
    
    // 1. Sauvegarder dans IndexedDB
    const localId = await db.detenteurs.add({ ...data, signature, syncStatus: 'pending' });
    
    // 2. Récupérer les photos capturées et les convertir en base64
    const files = await db.files.where('detenteurId').equals(tempId).toArray();
    const photos = [];
    
    for (const file of files) {
      if (file.type === 'photo' && file.blob) {
        try {
          const base64 = await blobToBase64(file.blob);
          photos.push({
            name: file.name,
            mimeType: file.mimeType,
            data: base64
          });
          // Associer au vrai ID
          await db.files.update(file.id, { detenteurId: localId });
        } catch (err) {
          console.error('Erreur conversion photo:', err);
        }
      }
    }
    
    setMsg('✅ Sauvegardé localement ! Envoi à Google Drive...');
    
    // 3. Envoyer au serveur PostgreSQL
    try {
      const saved = await api.createDetenteur(data);
      await db.detenteurs.update(localId, { id: saved.id, syncStatus: 'synced' });
    } catch (err) {
      console.error('Erreur sync serveur:', err);
    }
    
    // 4. Générer le document Google Docs AVEC LES PHOTOS
    try {
      const docResult = await api.generateConsentementDoc(data, signature, photos);
      if (docResult.success) {
        if (docResult.docUrl) {
          await db.detenteurs.update(localId, { docUrl: docResult.docUrl });
        }
        setMsg('✅ Document de consentement généré avec photos !');
      } else {
        setMsg('⚠️ Détenteur sauvegardé mais doc non généré');
      }
    } catch (err) {
      console.error('Erreur doc:', err);
      setMsg('⚠️ Détenteur sauvegardé, doc en attente');
    }
    
    // Réinitialiser
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
  };

  return (
    <form onSubmit={submit} style={{maxWidth:'500px', margin:'20px auto', padding:'20px', border:'1px solid #ddd', borderRadius:'8px', background:'white'}}>
      <h2>📝 Nouveau Détenteur</h2>
      
      <h3>👤 Identité</h3>
      <input placeholder="Nom complet *" value={form.nomComplet} onChange={e=>setForm({...form, nomComplet:e.target.value})} required style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
      <input placeholder="Surnom rituel" value={form.surnomRituel} onChange={e=>setForm({...form, surnomRituel:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
      <div style={{display:'flex', gap:'10px'}}>
        <input type="number" placeholder="Âge" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} style={{flex:'1', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
        <select value={form.sexe} onChange={e=>setForm({...form, sexe:e.target.value})} style={{flex:'1', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}>
          <option value="M">Masculin</option><option value="F">Féminin</option>
        </select>
      </div>
      <input placeholder="Village *" value={form.village} onChange={e=>setForm({...form, village:e.target.value})} required style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
      <input placeholder="Fonction au palais" value={form.fonctionPalais} onChange={e=>setForm({...form, fonctionPalais:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
      <input placeholder="Téléphone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}/>
      <select value={form.langue} onChange={e=>setForm({...form, langue:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'8px', boxSizing:'border-box'}}>
        <option value="Fon">Fon</option><option value="Goun">Goun</option>
        <option value="Mina">Mina</option><option value="Français">Français</option>
      </select>

      <h3>🎭 Permissions</h3>
      {[
        ['peutParler', 'Être interviewé(e)'],
        ['peutChanter', 'Chanter / Jouer (audio)'],
        ['peutEtreFilme', 'Être filmé(e)'],
        ['peutFilmer', 'Être photographié(e)'],
        ['preterInstrument', 'Prêter un instrument'],
        ['montrerLieuSacre', 'Montrer un lieu sacré']
      ].map(([key, label]) => (
        <label key={key} style={{display:'block', marginBottom:'5px'}}>
          <input type="checkbox" checked={form[key]} onChange={e=>setForm({...form, [key]:e.target.checked})} style={{marginRight:'8px'}}/>
          {label}
        </label>
      ))}

      <h3>🔒 Spécificités Vodun</h3>
      <label style={{display:'block', marginBottom:'5px'}}>
        <input type="checkbox" checked={form.anonymiser} onChange={e=>setForm({...form, anonymiser:e.target.checked})} style={{marginRight:'8px'}}/>
        Anonymiser mon nom
      </label>
      <label style={{display:'block', marginBottom:'10px'}}>
        <input type="checkbox" checked={form.nomTraditionnelJamaisEcrit} onChange={e=>setForm({...form, nomTraditionnelJamaisEcrit:e.target.checked})} style={{marginRight:'8px'}}/>
        Ne jamais écrire mon nom traditionnel
      </label>

      <h3>📍 Localisation</h3>
      <button type="button" onClick={capturerGPS} style={{padding:'10px', background:'#2c7a7b', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', marginBottom:'10px'}}>
        📍 Capturer GPS
      </button>
      {form.coordonneesGPS && <p style={{fontSize:'12px', color:'#666'}}>{form.coordonneesGPS}</p>}

      <h3>📝 Notes terrain</h3>
      <textarea placeholder="Observations, contexte..." value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box', minHeight:'60px'}}/>

      <h3>✍️ Signature</h3>
      <div style={{border:'1px solid #ccc', borderRadius:'4px'}}>
        <SignatureCanvas 
          ref={sigCanvas}
          penColor="#000"
          canvasProps={{style:{width:'100%', height:'150px'}}}
        />
      </div>
      <button type="button" onClick={()=>sigCanvas.current?.clear()} style={{marginTop:'5px', padding:'5px 10px', background:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer'}}>
        Effacer la signature
      </button>

      <MediaCapture tempDetenteurId={tempId} />

      <button type="submit" style={{width:'100%', padding:'14px', marginTop:'20px', background:'#e94560', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight:'bold'}}>
        ✅ Enregistrer le détenteur
      </button>
      {msg && <p style={{textAlign:'center', marginTop:'10px', color:'#2c7a7b', fontWeight:'bold'}}>{msg}</p>}
    </form>
  );
}
`);

// Mettre à jour api.js pour accepter les photos
fs.writeFileSync('src/services/api.js', `import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
export const APPS_SCRIPT_URL = '${APPS_SCRIPT_URL}';

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
      console.log('📄 Envoi à Apps Script avec ' + photos.length + ' photo(s)...');
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ 
          detenteur: detenteur, 
          signature: signature,
          photos: photos
        })
      });
      
      console.log('✅ Données envoyées à Apps Script');
      
      return { 
        success: true, 
        docUrl: null,
        message: 'Document généré avec ' + photos.length + ' photo(s)'
      };
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      return { success: false, error: error.message };
    }
  }
};
`);

console.log('🎉 Photos connectées au script Apps Script !');
