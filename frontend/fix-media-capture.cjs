const fs = require('fs');
const path = require('path');

console.log('🔧 Correction de MediaCapture.jsx...\n');

const newMediaCapture = `import { useRef, useState, useEffect } from 'react';

function MediaCapture({ onPhoto, onVideo, onAudio }) {
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [preview, setPreview] = useState([]);

  const handleFile = (file, type) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      setPreview(prev => [...prev, { type, data, name: file.name }]);
      
      if (type === 'photo' && onPhoto) onPhoto(data);
      if (type === 'video' && onVideo) onVideo(data);
      if (type === 'audio' && onAudio) onAudio(data);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => handleFile(f, 'photo'));
    e.target.value = '';
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => handleFile(f, 'video'));
    e.target.value = '';
  };

  const handleAudioChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => handleFile(f, 'audio'));
    e.target.value = '';
  };

  const removePreview = (index) => {
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="media-capture">
      <div className="media-buttons">
        <button type="button" className="media-btn photo" onClick={() => photoInputRef.current?.click()}>
          📸 Photo
        </button>
        <button type="button" className="media-btn video" onClick={() => videoInputRef.current?.click()}>
          🎥 Vidéo
        </button>
        <button type="button" className="media-btn audio" onClick={() => audioInputRef.current?.click()}>
          🎤 Audio
        </button>
      </div>

      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        capture="environment"
        multiple
        onChange={handlePhotoChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        capture="environment"
        multiple
        onChange={handleVideoChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        capture
        multiple
        onChange={handleAudioChange}
        style={{ display: 'none' }}
      />

      {preview.length > 0 && (
        <div className="media-preview">
          {preview.map((item, i) => (
            <div key={i} className="media-item" style={{ position: 'relative' }}>
              {item.type === 'photo' && <img src={item.data} alt={item.name} />}
              {item.type === 'video' && <video src={item.data} controls style={{ width: '100%' }} />}
              {item.type === 'audio' && <audio src={item.data} controls style={{ width: '100%' }} />}
              <button
                type="button"
                onClick={() => removePreview(i)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: '10px', marginTop: '4px', wordBreak: 'break-all' }}>{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaCapture;
`;

fs.writeFileSync(
  path.join(__dirname, 'src/components/MediaCapture.jsx'),
  newMediaCapture,
  'utf8'
);

console.log('✅ MediaCapture.jsx corrigé (plus d\'erreur "Invalid key")');
console.log('✅ Les médias sont maintenant stockés uniquement dans le state React');
console.log('✅ Ils seront sauvegardés avec le détenteur lors de l\'enregistrement');