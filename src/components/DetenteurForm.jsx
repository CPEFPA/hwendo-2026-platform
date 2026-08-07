import { useState } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';

export default function DetenteurForm({ onSaved }) {
  const [form, setForm] = useState({
    nomComplet: '',
    village: '',
    sexe: 'M',
    age: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...form,
        age: form.age ? parseInt(form.age) : null
      };
      
      // Sauvegarder localement
      const localId = await db.detenteurs.add({
        ...data,
        syncStatus: 'pending'
      });
      
      setMessage('✅ Sauvegardé localement !');
      
      // Sync vers serveur
      if (navigator.onLine) {
        try {
          const saved = await api.createDetenteur(data);
          await db.detenteurs.update(localId, { 
            id: saved.id,
            syncStatus: 'synced' 
          });
          setMessage('✅ Synchronisé avec le serveur !');
          onSaved?.();
        } catch (err) {
          setMessage('⏳ Sauvegardé localement (sync différée)');
        }
      }
      
      setForm({ nomComplet: '', village: '', sexe: 'M', age: '' });
    } catch (error) {
      setMessage('❌ Erreur: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>📝 Nouveau Détenteur</h2>
      
      <input
        placeholder="Nom complet *"
        value={form.nomComplet}
        onChange={e => setForm({...form, nomComplet: e.target.value})}
        required
        style={styles.input}
      />
      
      <input
        placeholder="Village *"
        value={form.village}
        onChange={e => setForm({...form, village: e.target.value})}
        required
        style={styles.input}
      />
      
      <input
        type="number"
        placeholder="Âge"
        value={form.age}
        onChange={e => setForm({...form, age: e.target.value})}
        style={styles.input}
      />
      
      <select
        value={form.sexe}
        onChange={e => setForm({...form, sexe: e.target.value})}
        style={styles.input}
      >
        <option value="M">Masculin</option>
        <option value="F">Féminin</option>
      </select>
      
      <button type="submit" style={styles.button}>
        ✅ Enregistrer
      </button>
      
      {message && <p style={styles.message}>{message}</p>}
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '16px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  message: {
    textAlign: 'center',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px'
  }
};
