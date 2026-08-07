const fs = require('fs');

// 1. Réécrire MediaCapture pour accepter un detenteurId temporaire
fs.writeFileSync('src/components/MediaCapture.jsx', `import { useRef, useState, useEffect } from 'react';
import { db } from '../db/localDB';

export default function MediaCapture({ tempDetenteurId }) {
  const photoInput = useRef(null);
  const videoInput = useRef(null);
  const audioInput = useRef(null);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [urls, setUrls] = useState({});

  useEffect(() => {
    if (tempDetenteurId) loadFiles();
  }, [tempDetenteurId]);

  const loadFiles = async () => {
    try {
      const all = await db.files.where('detenteurId').equals(tempDetenteurId).toArray();
      setFiles(all);
      
      // Créer des URLs temporaires pour afficher les médias
      const newUrls = {};
      all.forEach(f => {
        if (f.blob) {
          newUrls[f.id] = URL.createObjectURL(f.blob);
        }
      });
      setUrls(newUrls);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await db.files.add({
        detenteurId: tempDetenteurId,
        type: type,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        blob: file,
        createdAt: new Date().toISOString()
      });
      setMsg('✅ ' + type + ' sauvegardé (' + (file.size / 1024).toFixed(1) + ' Ko)');
      loadFiles();
    } catch (err) {
      setMsg('❌ Erreur: ' + err.message);
    }
  };

  const btnStyle = {
    padding: '12px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'white'
  };

  return (
    <div style={{marginTop: '20px', padding: '15px', background: '#f0f4f8', borderRadius: '8px'}}>
      <h3 style={{marginTop: 0}}>🎬 Capture Médias</h3>
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
        <button type="button" onClick={() => photoInput.current.click()} 
          style={{...btnStyle, background: '#4299e1'}}>
          📸 Photo
        </button>
        
        <button type="button" onClick={() => videoInput.current.click()} 
          style={{...btnStyle, background: '#ed8936'}}>
          🎥 Vidéo
        </button>
        
        <button type="button" onClick={() => audioInput.current.click()} 
          style={{...btnStyle, background: '#48bb78'}}>
          🎤 Chant/Audio
        </button>
      </div>

      <input type="file" accept="image/*" capture="environment" 
        ref={photoInput} style={{display: 'none'}}
        onChange={(e) => handleFile(e, 'photo')} />
      
      <input type="file" accept="video/*" capture="environment" 
        ref={videoInput} style={{display: 'none'}}
        onChange={(e) => handleFile(e, 'video')} />
      
      <input type="file" accept="audio/*" capture 
        ref={audioInput} style={{display: 'none'}}
        onChange={(e) => handleFile(e, 'audio')} />

      {msg && <p style={{color: '#2c7a7b', fontWeight: 'bold', marginTop: '10px'}}>{msg}</p>}

      {files.length > 0 && (
        <div style={{marginTop: '15px'}}>
          <h4 style={{margin: '10px 0 5px 0'}}>📁 Fichiers capturés ({files.length})</h4>
          {files.map(f => (
            <div key={f.id} style={{
              padding: '8px', background: 'white', borderRadius: '4px', 
              marginBottom: '5px', fontSize: '13px'
            }}>
              {f.type === 'photo' && urls[f.id] && (
                <img src={urls[f.id]} alt={f.name} style={{maxWidth: '150px', maxHeight: '100px', borderRadius: '4px', display: 'block', marginBottom: '5px'}} />
              )}
              {f.type === 'video' && urls[f.id] && (
                <video controls style={{maxWidth: '200px', maxHeight: '100px', display: 'block', marginBottom: '5px'}}>
                  <source src={urls[f.id]} type={f.mimeType} />
                </video>
              )}
              {f.type === 'audio' && urls[f.id] && (
                <audio controls style={{maxWidth: '200px', display: 'block', marginBottom: '5px'}}>
                  <source src={urls[f.id]} type={f.mimeType} />
                </audio>
              )}
              <span style={{fontSize: '11px', color: '#666'}}>
                {f.type === 'photo' ? '📸' : f.type === 'video' ? '🎥' : '🎤'} {f.name || 'Fichier ' + f.id} ({(f.size / 1024).toFixed(0)} Ko)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 2. Réécrire DetenteurForm avec un tempId et la sync serveur
fs.writeFileSync('src/components/DetenteurForm.jsx', `import { useState, useRef, useMemo } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import MediaCapture from './MediaCapture';

export default function DetenteurForm() {
  // Générer un ID temporaire unique pour ce formulaire
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
    
    // 2. Associer les fichiers capturés au vrai ID
    const filesToUpdate = await db.files.where('detenteurId').equals(tempId).toArray();
    for (const file of filesToUpdate) {
      await db.files.update(file.id, { detenteurId: localId });
    }
    
    setMsg('✅ Sauvegardé localement !');
    
    // 3. Envoyer au serveur PostgreSQL
    try {
      const saved = await api.createDetenteur(data);
      await db.detenteurs.update(localId, { id: saved.id, syncStatus: 'synced' });
      setMsg('✅ Synchronisé avec le serveur !');
    } catch (err) {
      console.error('Erreur sync serveur:', err);
      setMsg('⚠️ Sauvegardé localement uniquement');
    }
    
    // 4. Générer le document Google Docs
    try {
      const docResult = await api.generateConsentementDoc(data, signature);
      if (docResult.success) {
        if (docResult.docUrl) {
          await db.detenteurs.update(localId, { docUrl: docResult.docUrl });
        }
        setMsg('✅ Document de consentement généré !');
      }
    } catch (err) {
      console.error('Erreur doc:', err);
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
    
    // Forcer le rechargement de la liste
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

      {/* Capture médias avec le tempId */}
      <MediaCapture tempDetenteurId={tempId} />

      <button type="submit" style={{width:'100%', padding:'14px', marginTop:'20px', background:'#e94560', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight:'bold'}}>
        ✅ Enregistrer le détenteur
      </button>
      {msg && <p style={{textAlign:'center', marginTop:'10px', color:'#2c7a7b', fontWeight:'bold'}}>{msg}</p>}
    </form>
  );
}
`);

// 3. Réécrire DetenteurList pour fusionner local + serveur
fs.writeFileSync('src/components/DetenteurList.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import MediaDisplay from './MediaDisplay';

export default function DetenteurList() {
  const [dets, setDets] = useState([]);

  const loadData = async () => {
    try {
      // Charger TOUS les détenteurs depuis IndexedDB (source de vérité)
      const localData = await db.detenteurs.toArray();
      
      // Essayer de fusionner avec le serveur si online
      if (navigator.onLine) {
        try {
          const serverData = await api.getDetenteurs();
          // Fusionner : si un détenteur local existe aussi sur serveur, on garde les infos serveur
          const merged = localData.map(local => {
            const server = serverData.find(s => 
              s.nomComplet === local.nomComplet && s.village === local.village
            );
            if (server) {
              return { ...local, id: server.id, serverSynced: true };
            }
            return local;
          });
          setDets(merged);
        } catch (err) {
          setDets(localData);
        }
      } else {
        setDets(localData);
      }
    } catch(e) { 
      console.error(e);
    }
  };

  useEffect(() => { 
    loadData();
    // Recharger quand un détenteur est ajouté
    const handler = () => loadData();
    window.addEventListener('detenteur-added', handler);
    return () => window.removeEventListener('detenteur-added', handler);
  }, []);

  return (
    <div style={{maxWidth:'800px', margin:'20px auto', padding:'20px'}}>
      <h2>📋 Liste des Détenteurs ({dets.length})</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'15px'}}>
        {dets.map(d => (
          <div key={d.id || d.reference} style={{padding:'15px', border:'1px solid #ddd', borderRadius:'8px', background:'white'}}>
            <h3 style={{marginTop:'0'}}>{d.nomComplet}</h3>
            <p style={{margin:'5px 0'}}><b>Village:</b> {d.village}</p>
            <p style={{margin:'5px 0'}}><b>Âge:</b> {d.age || '?'}</p>
            <p style={{margin:'5px 0'}}><b>Sexe:</b> {d.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            
            <div style={{display:'flex', gap:'5px', marginTop:'8px'}}>
              {d.docUrl && (
                <a href={d.docUrl} target="_blank" rel="noopener noreferrer" 
                  style={{display:'inline-block', padding:'5px 10px', background:'#4299e1', color:'white', textDecoration:'none', borderRadius:'4px', fontSize:'12px'}}>
                  📄 Consentement
                </a>
              )}
              {d.serverSynced && (
                <span style={{padding:'5px 10px', background:'#48bb78', color:'white', borderRadius:'4px', fontSize:'12px'}}>
                  ✅ Synchronisé
                </span>
              )}
            </div>
            
            <MediaDisplay detenteurId={d.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
`);

console.log('🎉 Tout est corrigé : sync serveur + photos affichées !');
