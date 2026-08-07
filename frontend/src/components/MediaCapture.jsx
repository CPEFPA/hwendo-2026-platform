import { useRef, useState, useEffect } from 'react';
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
      const newUrls = {};
      all.forEach(f => {
        if (f.blob) newUrls[f.id] = URL.createObjectURL(f.blob);
      });
      setUrls(newUrls);
    } catch (err) { console.error(err); }
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
      setMsg('✍️… ' + type + ' sauvegardé (' + (file.size / 1024).toFixed(1) + ' Ko)');
      loadFiles();
    } catch (err) { setMsg('âŒ Erreur: ' + err.message); }
  };

  return (
    <div className="media-capture">
      <h3>ðŸŽ¬ Capture Médias</h3>
      <div className="media-buttons">
        <button type="button" onClick={() => photoInput.current.click()} className="media-btn photo">
          📸 Photo
        </button>
        <button type="button" onClick={() => videoInput.current.click()} className="media-btn video">
          🎥 Vidéo
        </button>
        <button type="button" onClick={() => audioInput.current.click()} className="media-btn audio">
          🎤 Audio
        </button>
      </div>

      <input type="file" accept="image/*" capture="environment" ref={photoInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'photo')} />
      <input type="file" accept="video/*" capture="environment" ref={videoInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'video')} />
      <input type="file" accept="audio/*" capture ref={audioInput} style={{display:'none'}} onChange={(e) => handleFile(e, 'audio')} />

      {msg && <p style={{color: 'var(--vert-savane)', fontWeight: 'bold', marginTop: '10px'}}>{msg}</p>}

      {files.length > 0 && (
        <div className="media-preview">
          {files.map(f => (
            <div key={f.id} className="media-item">
              {f.type === 'photo' && urls[f.id] && <img src={urls[f.id]} alt={f.name} />}
              {f.type === 'video' && urls[f.id] && <video controls><source src={urls[f.id]} type={f.mimeType} /></video>}
              {f.type === 'audio' && urls[f.id] && <audio controls><source src={urls[f.id]} type={f.mimeType} /></audio>}
              <div className="media-info">
                {f.type === 'photo' ? '📸' : f.type === 'video' ? '🎥' : '🎤'} {(f.size / 1024).toFixed(0)} Ko
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
