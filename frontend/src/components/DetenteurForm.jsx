import { useState, useRef, useMemo, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import MediaCapture from './MediaCapture';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function DetenteurForm({ onSaved }) {
  const tempId = useMemo(() => 'temp_' + Date.now(), []);
  
  const [form, setForm] = useState({ 
    // ðŸ†• Nouveaux champs : type et lieu de signature
    typePersonne: 'DÃ©tenteur',
    lieuSignature: 'OUIDAH',
    evenement: '',
    
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
          setMsg('ðŸ“ Position GPS capturÃ©e !');
        },
        (err) => setMsg('âŒ GPS refusÃ©')
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('â³ Sauvegarde en cours...');
    
    const signature = sigCanvas.current && !sigCanvas.current.isEmpty() 
      ? sigCanvas.current.toDataURL('image/png') 
      : null;
    
    const data = { ...form, age: form.age ? parseInt(form.age) : null, createdAt: new Date().toISOString() };
    const localId = await db.detenteurs.add({ ...data, signature, syncStatus: 'pending' });
    
    const files = await db.files.where('detenteurId').equals(tempId).toArray();
    const photos = [];
    for (const file of files) {
      if (file.type === 'photo' && file.blob) {
        try {
          const base64 = await blobToBase64(file.blob);
          photos.push({ name: file.name, mimeType: file.mimeType, data: base64 });
          await db.files.update(file.id, { detenteurId: localId });
        } catch (err) { console.error(err); }
      }
    }
    
    setMsg('âœ… SauvegardÃ© localement ! Envoi Ã  Google Drive...');
    
    try {
      const saved = await api.createDetenteur(data);
      await db.detenteurs.update(localId, { id: saved.id, syncStatus: 'synced' });
    } catch (err) { console.error(err); }
    
    try {
      const docResult = await api.generateConsentementDoc(data, signature, photos);
      if (docResult.success) {
        if (docResult.docUrl) await db.detenteurs.update(localId, { docUrl: docResult.docUrl });
        setMsg('âœ… Document de consentement gÃ©nÃ©rÃ© !');
      }
    } catch (err) {
      setMsg('âš ï¸ DÃ©tenteur sauvegardÃ©, doc en attente');
    }
    
    setForm({ 
      typePersonne: 'DÃ©tenteur',
      lieuSignature: 'OUIDAH',
      evenement: '',
      nomComplet: '', village: '', sexe: 'M', age: '',
      surnomRituel: '', fonctionPalais: '', telephone: '', langue: 'Fon',
      peutParler: false, peutChanter: false, peutEtreFilme: false,
      peutFilmer: false, preterInstrument: false, montrerLieuSacre: false,
      anonymiser: false, nomTraditionnelJamaisEcrit: false,
      coordonneesGPS: '', notes: ''
    });
    sigCanvas.current?.clear();
    window.dispatchEvent(new Event('detenteur-added'));
    if (onSaved) setTimeout(onSaved, 1500);
  };

  return (
    <form onSubmit={submit} className="hwendo-form">
      <h2>ðŸ“ Nouveau participant</h2>
      
      {/* ðŸ†• NOUVELLE SECTION : Contexte de signature */}
      <h3>ðŸ“‹ Contexte de la signature</h3>
      <div className="form-grid">
        <select value={form.typePersonne} onChange={e=>setForm({...form, typePersonne:e.target.value})}>
          <option value="DÃ©tenteur">ðŸŽµ DÃ©tenteur de savoirs</option>
          <option value="InvitÃ©">ðŸ¤ InvitÃ©</option>
          <option value="Visiteur">ðŸš¶ Visiteur</option>
          <option value="Spectateur">ðŸ‘ï¸ Spectateur</option>
        </select>
        <input placeholder="Lieu de signature *" value={form.lieuSignature} onChange={e=>setForm({...form, lieuSignature:e.target.value})} required />
      </div>
      <input placeholder="Ã‰vÃ©nement / Occasion (ex: Festival, Visite royale)" value={form.evenement} onChange={e=>setForm({...form, evenement:e.target.value})} />
      
      <h3>ðŸ‘¤ IdentitÃ©</h3>
      <input placeholder="Nom complet *" value={form.nomComplet} onChange={e=>setForm({...form, nomComplet:e.target.value})} required />
      <input placeholder="Surnom rituel" value={form.surnomRituel} onChange={e=>setForm({...form, surnomRituel:e.target.value})} />
      <div className="form-grid">
        <input type="number" placeholder="Ã‚ge" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} />
        <select value={form.sexe} onChange={e=>setForm({...form, sexe:e.target.value})}>
          <option value="M">Masculin</option><option value="F">FÃ©minin</option>
        </select>
      </div>
      <input placeholder="Village d'origine *" value={form.village} onChange={e=>setForm({...form, village:e.target.value})} required />
      <input placeholder="Fonction au palais" value={form.fonctionPalais} onChange={e=>setForm({...form, fonctionPalais:e.target.value})} />
      <div className="form-grid">
        <input placeholder="TÃ©lÃ©phone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})} />
        <select value={form.langue} onChange={e=>setForm({...form, langue:e.target.value})}>
          <option value="Fon">Fon</option><option value="Goun">Goun</option>
          <option value="Mina">Mina</option><option value="FranÃ§ais">FranÃ§ais</option>
        </select>
      </div>

      <h3>ðŸŽ­ Permissions</h3>
      <div className="checkbox-group">
        {[
          ['peutParler', 'ðŸŽ¤ ÃŠtre interviewÃ©(e)'],
          ['peutChanter', 'ðŸŽµ Chanter / Jouer'],
          ['peutEtreFilme', 'ðŸŽ¥ ÃŠtre filmÃ©(e)'],
          ['peutFilmer', 'ðŸ“¸ ÃŠtre photographiÃ©(e)'],
          ['preterInstrument', 'ðŸª˜ PrÃªter un instrument'],
          ['montrerLieuSacre', 'ðŸ›ï¸ Montrer un lieu sacrÃ©']
        ].map(([key, label]) => (
          <label key={key}>
            <input type="checkbox" checked={form[key]} onChange={e=>setForm({...form, [key]:e.target.checked})} />
            {label}
          </label>
        ))}
      </div>

      <h3>ðŸ”’ SpÃ©cificitÃ©s Vodun</h3>
      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={form.anonymiser} onChange={e=>setForm({...form, anonymiser:e.target.checked})} />
          ðŸ•¶ï¸ Anonymiser mon nom
        </label>
        <label>
          <input type="checkbox" checked={form.nomTraditionnelJamaisEcrit} onChange={e=>setForm({...form, nomTraditionnelJamaisEcrit:e.target.checked})} />
          ðŸ¤ Nom traditionnel jamais Ã©crit
        </label>
      </div>

      <h3>ðŸ“ Localisation</h3>
      <button type="button" onClick={capturerGPS} className="btn-gps">
        ðŸ“ Capturer GPS
      </button>
      {form.coordonneesGPS && <p style={{fontSize:'12px', color:'var(--gris)', marginBottom: '10px'}}>ðŸ“ {form.coordonneesGPS}</p>}

      <h3>ðŸ“ Notes terrain</h3>
      <textarea placeholder="Observations, contexte..." value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />

      <h3>âœï¸ Signature manuscrite</h3>
      <div className="signature-box">
        <SignatureCanvas 
          ref={sigCanvas}
          penColor="#2C1810"
          canvasProps={{style:{width:'100%', height:'150px'}}}
        />
      </div>
      <button type="button" onClick={()=>sigCanvas.current?.clear()} className="btn-clear">
        Effacer
      </button>

      <MediaCapture tempDetenteurId={tempId} />

      <button type="submit" className="btn-primary">
        âœ… Enregistrer le participant
      </button>
      {msg && <div className="message">{msg}</div>}
    </form>
  );
}
