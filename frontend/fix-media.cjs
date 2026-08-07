const fs = require('fs');

// 1. Créer un composant pour AFFICHER les médias
fs.writeFileSync('src/components/MediaDisplay.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';

export default function MediaDisplay({ detenteurId }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState({});

  useEffect(() => {
    loadMedia();
    return () => {
      // Nettoyer les URLs temporaires
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [detenteurId]);

  const loadMedia = async () => {
    try {
      const allFiles = await db.files.where('detenteurId').equals(detenteurId).toArray();
      setFiles(allFiles);
      
      // Créer des URLs temporaires pour afficher les médias
      const newUrls = {};
      allFiles.forEach(f => {
        if (f.blob) {
          newUrls[f.id] = URL.createObjectURL(f.blob);
        }
      });
      setUrls(newUrls);
    } catch (err) {
      console.error('Erreur chargement médias:', err);
    }
  };

  if (files.length === 0) return null;

  return (
    <div style={{marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
      {files.map(f => (
        <div key={f.id} style={{border: '1px solid #ddd', borderRadius: '4px', padding: '5px'}}>
          {f.type === 'photo' && urls[f.id] && (
            <img src={urls[f.id]} alt={f.name} style={{maxWidth: '150px', maxHeight: '100px', borderRadius: '4px'}} />
          )}
          {f.type === 'video' && urls[f.id] && (
            <video controls style={{maxWidth: '200px', maxHeight: '100px'}}>
              <source src={urls[f.id]} type={f.mimeType} />
            </video>
          )}
          {f.type === 'audio' && urls[f.id] && (
            <audio controls style={{maxWidth: '200px'}}>
              <source src={urls[f.id]} type={f.mimeType} />
            </audio>
          )}
        </div>
      ))}
    </div>
  );
}
`);

// 2. Réécrire DetenteurList avec les médias
fs.writeFileSync('src/components/DetenteurList.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import MediaDisplay from './MediaDisplay';

export default function DetenteurList() {
  const [dets, setDets] = useState([]);

  const loadData = async () => {
    try {
      const data = navigator.onLine ? await api.getDetenteurs() : await db.detenteurs.toArray();
      // Fusionner avec les données locales pour avoir les docUrl et id locaux
      const localData = await db.detenteurs.toArray();
      const merged = data.map(d => {
        const local = localData.find(l => l.id === d.id || l.nomComplet === d.nomComplet);
        return { ...d, localId: local?.id };
      });
      setDets(merged);
    } catch(e) { 
      console.error(e);
      const localData = await db.detenteurs.toArray();
      setDets(localData);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div style={{maxWidth:'800px', margin:'20px auto', padding:'20px'}}>
      <h2>📋 Liste des Détenteurs ({dets.length})</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'15px'}}>
        {dets.map(d => (
          <div key={d.localId || d.id} style={{padding:'15px', border:'1px solid #ddd', borderRadius:'8px', background:'white'}}>
            <h3 style={{marginTop:'0'}}>{d.nomComplet}</h3>
            <p style={{margin:'5px 0'}}><b>Village:</b> {d.village}</p>
            <p style={{margin:'5px 0'}}><b>Âge:</b> {d.age || '?'}</p>
            <p style={{margin:'5px 0'}}><b>Sexe:</b> {d.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            
            {d.docUrl && (
              <a href={d.docUrl} target="_blank" rel="noopener noreferrer" 
                style={{display:'inline-block', marginTop:'8px', padding:'5px 10px', background:'#4299e1', color:'white', textDecoration:'none', borderRadius:'4px', fontSize:'12px'}}>
                📄 Voir le consentement
              </a>
            )}
            
            <MediaDisplay detenteurId={d.localId || d.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// 3. Réécrire complètement DetenteurForm avec la bonne logique
const formContent = fs.readFileSync('src/components/DetenteurForm.jsx', 'utf8');

// Extraire la partie formulaire (avant le submit) et réécrire le submit
const submitStart = formContent.indexOf('const submit = async (e) => {');
const submitEnd = formContent.indexOf('return (');

const newSubmit = `const submit = async (e) => {
    e.preventDefault();
    const signature = sigCanvas.current && !sigCanvas.current.isEmpty() 
      ? sigCanvas.current.toDataURL('image/png') 
      : null;
    
    const data = { ...form, age: form.age ? parseInt(form.age) : null, signature };
    const id = await db.detenteurs.add({ ...data, syncStatus: 'pending' });
    setMsg('✅ Sauvegardé localement ! Génération du document...');
    
    // Générer le document de consentement
    try {
      const docResult = await api.generateConsentementDoc(data, signature);
      if (docResult.success) {
        if (docResult.docUrl) {
          await db.detenteurs.update(id, { docUrl: docResult.docUrl, syncStatus: 'synced' });
          setMsg('✅ Document de consentement généré !');
        } else {
          await db.detenteurs.update(id, { syncStatus: 'synced' });
          setMsg('✅ Document envoyé à Google Drive !');
        }
      } else {
        setMsg('⚠️ Détenteur sauvegardé mais doc non généré');
      }
    } catch (err) {
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
  };

  `;

const newFormContent = formContent.substring(0, submitStart) + newSubmit + formContent.substring(submitEnd);
fs.writeFileSync('src/components/DetenteurForm.jsx', newFormContent);

console.log('🎉 Médias affichés + messages corrigés !');
