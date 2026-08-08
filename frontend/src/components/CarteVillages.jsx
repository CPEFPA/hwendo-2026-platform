import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordonnées des villages du Bénin (royaume Hwendo et environs)
const VILLAGE_COORDS = {
  'ouidah': [6.3654, 2.0857], 'whydah': [6.3654, 2.0857],
  'abomey': [7.1826, 1.9912],
  'porto-novo': [6.4969, 2.6283], 'portonovo': [6.4969, 2.6283],
  'cotonou': [6.3703, 2.3912],
  'allada': [6.6770, 2.1486],
  'grand-popo': [6.2592, 1.7910], 'grandpopo': [6.2592, 1.7910],
  'come': [6.3969, 1.8786], 'comé': [6.3969, 1.8786],
  'savi': [6.4333, 2.0667], 'savy': [6.4333, 2.0667],
  'tori': [6.5833, 2.1833], 'tori-bossito': [6.5833, 2.1833],
  'togbin': [6.4333, 2.2167],
  'avrankou': [6.5833, 2.6167],
  'akpro-misserete': [6.5833, 2.6833],
  'ketou': [7.3667, 2.6000], 'kétou': [7.3667, 2.6000],
  'sakete': [6.7333, 2.6500], 'sakété': [6.7333, 2.6500],
  'pobe': [6.9833, 2.6667], 'pobè': [6.9833, 2.6667],
  'lokossa': [6.6389, 1.7167],
  'dogbo': [6.7833, 1.7833],
  'aplahoue': [6.8333, 1.7333], 'aplahoué': [6.8333, 1.7333],
  'klouekanme': [6.8667, 1.9833], 'klouékanmé': [6.8667, 1.9833],
  'abobo': [5.4167, 2.0167],
  'adjara': [6.4833, 2.6833],
  'adjarra': [6.4500, 2.7333],
  'seme': [6.4333, 2.5833], 'sèmè': [6.4333, 2.5833],
  'kpomasse': [6.4167, 2.0500], 'kpomassè': [6.4167, 2.0500],
  'torou': [7.0500, 2.0500],
  'bohicon': [7.1783, 2.0667],
  'zagnanado': [7.0833, 2.1333],
  'cové': [7.0833, 2.3000], 'cove': [7.0833, 2.3000],
  'zakin': [7.0167, 2.1500],
  'dassa': [7.7833, 2.1667],
  'save': [8.0333, 2.4833], 'savé': [8.0333, 2.4833],
  'parakou': [9.3372, 2.6303],
  'natitingou': [10.3167, 1.3833],
  'djougou': [9.7086, 1.6658],
  'tanguieta': [10.6167, 1.2667],
  'kandi': [11.1342, 2.9386],
  'malanville': [11.8667, 3.3833],
  'nikki': [9.9417, 3.2106],
  'bembereke': [10.2833, 2.6667],
  'bassar': [6.5833, 2.1833],
  'lome': [6.1319, 1.2228], 'lomé': [6.1319, 1.2228],
  'aneho': [6.2333, 1.5833], 'aného': [6.2333, 1.5833]
};

export default function CarteVillages({ villageData }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

    const map = L.map(mapRef.current).setView([6.9, 2.1], 8);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    let nbPlaces = 0;
    villageData.forEach(v => {
      const key = (v.name || '').toLowerCase().trim();
      const coords = VILLAGE_COORDS[key];
      if (coords) {
        nbPlaces++;
        L.marker(coords, {
          icon: L.divIcon({
            html: '<div style="background:#C65D2C;color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);">' + v.value + '</div>',
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          })
        }).addTo(map).bindPopup('<b>' + v.name + '</b><br/>' + v.value + ' participant(s)');
      }
    });

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [villageData]);

  return (
    <div>
      <div ref={mapRef} style={{height: '380px', borderRadius: '12px', zIndex: 0, border: '2px solid var(--sable)'}}></div>
      <p style={{fontSize: '11px', color: '#6B5D54', marginTop: '8px', fontStyle: 'italic'}}>
        🗺️ Les cercles ocre indiquent le nombre de participants par village. Cliquez sur un cercle pour le détail.
      </p>
    </div>
  );
}
