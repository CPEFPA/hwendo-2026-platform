const fs = require('fs');

fs.writeFileSync('src/components/DetenteurForm.jsx', `import { useState, useRef } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';

export default function DetenteurForm() {
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
    const signature = sigCanvas.current && !sigCanvas.current.isEmpty() 
      ? sigCanvas.current.toDataURL('image/png') 
      : null;
    
    const data = { ...form, age: form.age ? parseInt(form.age) : null, signature };
    const id = await db.detenteurs.add({ ...data, syncStatus: 'pending' });
    setMsg('✅ Sauvegardé localement !');
    
    if (navigator.onLine) {
      try {
        const saved = await api.createDetenteur(data);
        await db.detenteurs.update(id, { id: saved.id, syncStatus: 'synced' });
        setMsg('✅ Synchronisé avec le serveur !');
      } catch(e) { setMsg('⏳ Sauvegardé (sync différée)'); }
    }
    
    setForm({ 
      nomComplet: '', village: '', sexe: 'M', age: '',
      surnomRituel: '', fonctionPalais: '', telephone: '', langue: 'Fon',
      peutParler: false, peutChanter: false, peutEtreFilme: false,
      peutFilmer: false, preterInstrument: false, montrerLieuSacre: false,
      anonymiser: false, nomTraditionnelJamaisEcrit: false,
      coordonneesGPS: '', notes: ''
    });
    sigCanvas.current?.clear();
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

      <button type="submit" style={{width:'100%', padding:'14px', marginTop:'20px', background:'#e94560', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight:'bold'}}>
        ✅ Enregistrer le détenteur
      </button>
      {msg && <p style={{textAlign:'center', marginTop:'10px', color:'#2c7a7b', fontWeight:'bold'}}>{msg}</p>}
    </form>
  );
}`);

console.log('🎉 Formulaire enrichi avec signature et tous les champs Vodun !');
