const fs = require('fs');
fs.mkdirSync('src/components', { recursive: true });
fs.mkdirSync('src/db', { recursive: true });
fs.mkdirSync('src/services', { recursive: true });

fs.writeFileSync('src/App.jsx', `import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';
function App() {
  return (
    <div style={{fontFamily: 'Arial', backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
      <header style={{backgroundColor: '#1a1a2e', color: 'white', padding: '30px', textAlign: 'center'}}>
        <h1>🎵 HWENDO 2026</h1>
        <p>Mission de collecte patrimoniale</p>
      </header>
      <DetenteurForm />
      <DetenteurList />
    </div>
  );
}
export default App;`);

fs.writeFileSync('src/db/localDB.js', `import Dexie from 'dexie';
export const db = new Dexie('HWENDO2026DB');
db.version(1).stores({ detenteurs: '++id, reference, nomComplet, village, syncStatus' });`);

fs.writeFileSync('src/services/api.js', `import axios from 'axios';
const API_URL = 'http://localhost:3001/api';
export const api = {
  async createDetenteur(data) { return (await axios.post(API_URL + '/detenteurs', data)).data; },
  async getDetenteurs() { return (await axios.get(API_URL + '/detenteurs')).data; }
};`);

fs.writeFileSync('src/components/DetenteurForm.jsx', `import { useState } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
export default function DetenteurForm() {
  const [form, setForm] = useState({ nomComplet: '', village: '', sexe: 'M', age: '' });
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, age: form.age ? parseInt(form.age) : null };
    const id = await db.detenteurs.add({ ...data, syncStatus: 'pending' });
    setMsg('✅ Sauvegardé localement !');
    if (navigator.onLine) {
      try {
        const saved = await api.createDetenteur(data);
        await db.detenteurs.update(id, { id: saved.id, syncStatus: 'synced' });
        setMsg('✅ Synchronisé avec le serveur !');
      } catch(e) { setMsg('⏳ Sauvegardé (sync différée)'); }
    }
    setForm({ nomComplet: '', village: '', sexe: 'M', age: '' });
  };
  return (
    <form onSubmit={submit} style={{maxWidth:'400px', margin:'20px auto', padding:'20px', border:'1px solid #ddd', borderRadius:'8px', background:'white'}}>
      <h2>📝 Nouveau Détenteur</h2>
      <input placeholder="Nom complet *" value={form.nomComplet} onChange={e=>setForm({...form, nomComplet:e.target.value})} required style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
      <input placeholder="Village *" value={form.village} onChange={e=>setForm({...form, village:e.target.value})} required style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
      <input type="number" placeholder="Âge" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
      <select value={form.sexe} onChange={e=>setForm({...form, sexe:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}>
        <option value="M">Masculin</option><option value="F">Féminin</option>
      </select>
      <button type="submit" style={{width:'100%', padding:'12px', background:'#e94560', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight:'bold'}}>✅ Enregistrer</button>
      {msg && <p style={{textAlign:'center', marginTop:'10px', color:'#2c7a7b'}}>{msg}</p>}
    </form>
  );
}`);

fs.writeFileSync('src/components/DetenteurList.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
export default function DetenteurList() {
  const [dets, setDets] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = navigator.onLine ? await api.getDetenteurs() : await db.detenteurs.toArray();
        setDets(data);
      } catch(e) { console.error(e); }
    })();
  }, []);
  return (
    <div style={{maxWidth:'800px', margin:'20px auto', padding:'20px'}}>
      <h2>📋 Liste des Détenteurs ({dets.length})</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'15px'}}>
        {dets.map(d => (
          <div key={d.id} style={{padding:'15px', border:'1px solid #ddd', borderRadius:'8px', background:'white'}}>
            <h3 style={{marginTop:'0'}}>{d.nomComplet}</h3>
            <p><b>Village:</b> {d.village}</p>
            <p><b>Âge:</b> {d.age || '?'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`);

console.log('🎉 Tous les fichiers React ont été générés avec succès !');
