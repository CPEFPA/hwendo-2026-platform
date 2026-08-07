const fs = require('fs');

// 1. Mettre à jour la base locale pour stocker les fichiers
fs.writeFileSync('src/db/localDB.js', `import Dexie from 'dexie';

export const db = new Dexie('HWENDO2026DB');

db.version(1).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus'
});

db.version(2).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus',
  files: '++id, detenteurId, type, name'
});
`);

// 2. Créer le composant de capture média
fs.writeFileSync('src/components/MediaCapture.jsx', `import { useRef, useState } from 'react';
import { db } from '../db/localDB';

export default function MediaCapture({ detenteurId }) {
  const photoInput = useRef(null);
  const videoInput = useRef(null);
  const audioInput = useRef(null);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');

  const loadFiles = async () => {
    if (detenteurId) {
      const all = await db.files.where('detenteurId').equals(detenteurId).toArray();
      setFiles(all);
    }
  };

  useState(() => { loadFiles(); }, []);

  const handleFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await db.files.add({
        detenteurId: detenteurId || 'temp_' + Date.now(),
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

      {/* Inputs cachés qui déclenchent la caméra/micro */}
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
              marginBottom: '5px', fontSize: '13px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>
                {f.type === 'photo' ? '📸' : f.type === 'video' ? '🎥' : '🎤'} 
                {' '}{f.name || 'Fichier ' + f.id}
              </span>
              <span style={{color: '#666'}}>{(f.size / 1024).toFixed(0)} Ko</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 3. Mettre à jour le formulaire pour inclure le MediaCapture
const formContent = fs.readFileSync('src/components/DetenteurForm.jsx', 'utf8');

const newFormContent = formContent
  .replace("import SignatureCanvas from 'react-signature-canvas';", 
           "import SignatureCanvas from 'react-signature-canvas';\nimport MediaCapture from './MediaCapture';")
  .replace("</form>", "      <MediaCapture />\n    </form>");

fs.writeFileSync('src/components/DetenteurForm.jsx', newFormContent);

console.log('🎉 Capture photo/vidéo/audio ajoutée avec succès !');
