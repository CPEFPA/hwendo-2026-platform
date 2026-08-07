import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';

export default function DetenteurList() {
  const [detenteurs, setDetenteurs] = useState([]);

  const loadDetenteurs = async () => {
    try {
      if (navigator.onLine) {
        const data = await api.getDetenteurs();
        setDetenteurs(data);
      } else {
        const local = await db.detenteurs.toArray();
        setDetenteurs(local);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    loadDetenteurs();
  }, []);

  return (
    <div style={styles.container}>
      <h2>📋 Liste des Détenteurs ({detenteurs.length})</h2>
      
      {detenteurs.length === 0 ? (
        <p style={{textAlign: 'center', color: '#666'}}>Aucun détenteur enregistré.</p>
      ) : (
        <div style={styles.grid}>
          {detenteurs.map(d => (
            <div key={d.id} style={styles.card}>
              <h3 style={{margin: '0 0 10px 0'}}>{d.nomComplet}</h3>
              <p style={{margin: '5px 0'}}><strong>Village:</strong> {d.village}</p>
              <p style={{margin: '5px 0'}}><strong>Âge:</strong> {d.age || 'Non renseigné'}</p>
              <p style={{margin: '5px 0'}}><strong>Sexe:</strong> {d.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px'
  },
  card: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white'
  }
};
