import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../db/localDB';

// ============================================================
// COORDONNEES DES VILLAGES DU BENIN (modifiable si besoin)
// Format: 'nom normalise': [latitude, longitude]
// ============================================================
const VILLAGES_COORDS = {
  'ouidah': [6.3653, 2.0864],
  'pahou': [6.4619, 2.1797],
  'bopa': [6.5000, 1.9833],
  'agoe': [6.4441, 2.3614],
  'agoue': [6.3167, 1.7833],
  'be': [6.3547, 2.4158],
  'be pkota': [6.3547, 2.4158],
  'cotonou': [6.3703, 2.3912],
  'calavi': [6.4487, 2.3556],
  'abomey-calavi': [6.4487, 2.3556],
  'allada': [6.6667, 2.1500],
  'tori': [6.6167, 2.2333],
  'tori-bossito': [6.6167, 2.2333],
  'toffo': [6.6333, 2.2167],
  'ze': [6.5833, 2.3167],
  'kpomasse': [6.4167, 2.0667],
  'grand-popo': [6.2586, 1.6542],
  'come': [6.3833, 1.8833],
  'porto-novo': [6.4969, 2.6283],
  'ouedo': [6.4500, 2.2800],
  'akassato': [6.5333, 2.3000],
  'ganvie': [6.4833, 2.4167],
  'so-ava': [6.5167, 2.4833],
  'savi': [6.3833, 2.1000],
  'djakotey': [6.4000, 2.1167],
  'pedah': [6.3500, 2.0500],
  'daho': [6.4167, 2.0833],
  'misserete': [6.3667, 2.4333],
  'avlankou': [6.5000, 2.6000]
};

// Centre de la carte : region d'Ouidah / Atlantique (Benin)
const DEFAULT_CENTER = [6.42, 2.18];

// Normalise un nom de village (minuscules, sans accents)
function normalize(name) {
  if (!name) return '';
  return String(name).toLowerCase().trim()
    .replace(/é|è|ê|ë/g, 'e')
    .replace(/à|â|ä/g, 'a')
    .replace(/ô|ö/g, 'o')
    .replace(/ù|û|ü/g, 'u')
    .replace(/î|ï/g, 'i')
    .replace(/ç/g, 'c');
}

// Geocodage automatique via Nominatim (OpenStreetMap) pour les villages inconnus
async function geocodeVillage(name) {
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&country=Benin&q=' + encodeURIComponent(name);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn('Geocodage impossible pour:', name);
  }
  return null;
}

function CarteVillages({ detenteurs: propDets }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const [detenteurs, setDetenteurs] = useState(propDets || []);

  // Charger les donnees si pas fournies en props
  useEffect(() => {
    if (propDets && propDets.length > 0) {
      setDetenteurs(propDets);
    } else {
      loadData();
    }
  }, [propDets]);

  const loadData = async () => {
    try {
      if (navigator.onLine) {
        const res = await fetch('https://hwendo-backend.onrender.com/api/detenteurs');
        if (res.ok) {
          const data = await res.json();
          setDetenteurs(data);
          return;
        }
      }
    } catch (e) {}
    try {
      const local = await db.detenteurs.toArray();
      setDetenteurs(local);
    } catch (e) {}
  };

  // Initialiser la carte une seule fois
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 11);

      // Fond de carte Plan (OpenStreetMap)
      const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Fond de carte Satellite (Esri, gratuit)
      const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri'
      });

      // Selecteur Plan / Satellite en haut a droite
      L.control.layers(
        { 'Plan (OpenStreetMap)': osm, 'Satellite (Esri)': sat },
        null,
        { position: 'topright' }
      ).addTo(map);

      mapInstance.current = map;
    }
  }, []);

  // Dessiner les cercles quand les donnees changent
  useEffect(() => {
    renderMarkers();
  }, [detenteurs]);

  const renderMarkers = async () => {
    const map = mapInstance.current;
    if (!map) return;

    if (markersLayer.current) {
      map.removeLayer(markersLayer.current);
    }
    const layer = L.layerGroup().addTo(map);
    markersLayer.current = layer;

    // Grouper par village
    const groups = {};
    (detenteurs || []).forEach((d) => {
      const v = (d.village || 'Inconnu').trim();
      const key = normalize(v) || 'inconnu';
      if (!groups[key]) groups[key] = { name: v, count: 0, noms: [] };
      groups[key].count++;
      if (d.nomComplet) groups[key].noms.push(d.nomComplet);
    });

    const keys = Object.keys(groups);

    for (let i = 0; i < keys.length; i++) {
      const g = groups[keys[i]];
      let coords = VILLAGES_COORDS[keys[i]];
      let approx = false;

      // Si village inconnu, essayer le geocodage automatique
      if (!coords) {
        coords = await geocodeVillage(g.name);
      }

      // Dernier recours: position approximative pres d'Ouidah
      if (!coords) {
        coords = [
          DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.06,
          DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.06
        ];
        approx = true;
      }

      const circle = L.circleMarker(coords, {
        radius: 8 + g.count * 4,
        color: '#8B4513',
        weight: 2,
        fillColor: '#C65D2C',
        fillOpacity: 0.6
      });

      const html = '<div style="font-family:sans-serif;font-size:13px">' +
        '<b style="color:#C65D2C">' + g.name + '</b><br/>' +
        '<b>' + g.count + '</b> participant(s)' +
        (approx ? '<br/><i>(position approximative)</i>' : '') +
        '<br/><small>' + g.noms.slice(0, 6).join(', ') + (g.noms.length > 6 ? '...' : '') + '</small>' +
        '</div>';

      circle.bindPopup(html);
      circle.bindTooltip(g.name + ' (' + g.count + ')');
      layer.addLayer(circle);
    }
  };

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          height: '420px',
          width: '100%',
          borderRadius: '12px',
          border: '2px solid #C65D2C',
          zIndex: 0
        }}
      ></div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        Les cercles ocre indiquent le nombre de participants par village.
        Cliquez sur un cercle pour le detail.
        Utilisez le selecteur en haut a droite pour passer en vue satellite.
      </p>
    </div>
  );
}

export default CarteVillages;
