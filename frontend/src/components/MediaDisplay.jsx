import { useState, useEffect } from 'react';
import { db } from '../db/localDB';

export default function MediaDisplay({ detenteurId }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState({});

  useEffect(() => {
    if (!detenteurId) return;
    loadMedia();
    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [detenteurId]);

  const loadMedia = async () => {
    try {
      const allFiles = await db.files.where('detenteurId').equals(detenteurId).toArray();
      setFiles(allFiles);
      const newUrls = {};
      allFiles.forEach(f => {
        if (f.blob) newUrls[f.id] = URL.createObjectURL(f.blob);
      });
      setUrls(newUrls);
    } catch (err) { console.error(err); }
  };

  if (files.length === 0) return null;

  return (
    <div style={{marginTop: '12px'}}>
      <div style={{fontSize: '11px', color: 'var(--gris)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px'}}>
        Médias capturés ({files.length})
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '5px'}}>
        {files.map(f => (
          <div key={f.id} style={{background: 'var(--sable-clair)', padding: '4px', borderRadius: '4px'}}>
            {f.type === 'photo' && urls[f.id] && (
              <img src={urls[f.id]} alt={f.name} style={{width: '100%', borderRadius: '3px', display: 'block'}} />
            )}
            {f.type === 'video' && urls[f.id] && (
              <video style={{width: '100%', borderRadius: '3px'}}><source src={urls[f.id]} type={f.mimeType} /></video>
            )}
            {f.type === 'audio' && (
              <div style={{textAlign: 'center', padding: '10px', fontSize: '20px'}}>🎤</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
