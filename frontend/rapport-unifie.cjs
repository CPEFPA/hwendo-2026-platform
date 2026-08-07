const fs = require('fs');

// 1. Créer le composant RapportPDF avec TOUS les graphiques capturés
fs.writeFileSync('src/components/RapportPDF.jsx', `import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

export async function genererRapportComplet(stats) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  // Fonction pour créer un graphique SVG
  const svgBar = (data, color, max) => {
    const barWidth = 60;
    const spacing = 20;
    const height = 180;
    const maxVal = max || Math.max(...data.map(d => d.value), 1);
    const width = data.length * (barWidth + spacing) + spacing;
    
    let bars = '';
    data.forEach((d, i) => {
      const h = (d.value / maxVal) * (height - 30);
      const x = spacing + i * (barWidth + spacing);
      const y = height - h - 20;
      bars += \`<rect x="\${x}" y="\${y}" width="\${barWidth}" height="\${h}" fill="\${color}" rx="4"/>
               <text x="\${x + barWidth/2}" y="\${y - 5}" text-anchor="middle" font-size="11" fill="#2C1810" font-weight="bold">\${d.value}</text>
               <text x="\${x + barWidth/2}" y="\${height - 3}" text-anchor="middle" font-size="9" fill="#6B5D54">\${d.name.length > 12 ? d.name.substring(0,12) + '...' : d.name}</text>\`;
    });
    
    return \`<svg width="\${width}" height="\${height}" xmlns="http://www.w3.org/2000/svg">\${bars}</svg>\`;
  };

  const svgHBar = (data, color) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    let bars = '';
    data.forEach((d, i) => {
      const w = (d.value / maxVal) * 280;
      const y = i * 28 + 10;
      bars += \`<text x="0" y="\${y + 14}" font-size="10" fill="#2C1810">\${d.name}</text>
               <rect x="90" y="\${y}" width="\${w}" height="18" fill="\${color}" rx="3"/>
               <text x="\${95 + w}" y="\${y + 14}" font-size="10" fill="#2C1810" font-weight="bold">\${d.value}</text>\`;
    });
    return \`<svg width="400" height="\${data.length * 28 + 15}" xmlns="http://www.w3.org/2000/svg">\${bars}</svg>\`;
  };

  const svgPie = (data, colors) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return '<svg width="300" height="200"><text x="10" y="100" fill="#6B5D54">Aucune donnée</text></svg>';
    let paths = '';
    let acc = 0;
    const cx = 100, cy = 100, r = 70;
    data.forEach((d, i) => {
      const frac = d.value / total;
      const a1 = acc * 2 * Math.PI - Math.PI/2;
      const a2 = (acc + frac) * 2 * Math.PI - Math.PI/2;
      acc += frac;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = frac > 0.5 ? 1 : 0;
      paths += \`<path d="M \${cx} \${cy} L \${x1} \${y1} A \${r} \${r} 0 \${large} 1 \${x2} \${y2} Z" fill="\${colors[i % colors.length]}"/>\`;
    });
    let legend = '';
    data.forEach((d, i) => {
      legend += \`<rect x="220" y="\${40 + i*22}" width="14" height="14" fill="\${colors[i % colors.length]}"/>
                 <text x="240" y="\${51 + i*22}" font-size="11" fill="#2C1810">\${d.name}: \${d.value}</text>\`;
    });
    return \`<svg width="380" height="\${Math.max(200, 40 + data.length*22 + 10)}" xmlns="http://www.w3.org/2000/svg">\${paths}\${legend}</svg>\`;
  };

  const svgCourbe = (data) => {
    if (data.length === 0) return '<svg width="600" height="200"><text x="10" y="100" fill="#6B5D54">Aucune donnée</text></svg>';
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const w = 600, h = 180, pad = 40;
    const stepX = (w - 2*pad) / Math.max(data.length - 1, 1);
    let path = '';
    let area = '';
    let dots = '';
    let labels = '';
    data.forEach((d, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (d.value / maxVal) * (h - 2*pad);
      path += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
      area += (i === 0 ? 'M ' + pad + ' ' + (h - pad) + ' L' : ' L') + x + ' ' + y + ' ';
      dots += \`<circle cx="\${x}" cy="\${y}" r="4" fill="#C65D2C"/>\`;
      labels += \`<text x="\${x}" y="\${y - 10}" text-anchor="middle" font-size="10" fill="#C65D2C" font-weight="bold">\${d.value}</text>\`;
      labels += \`<text x="\${x}" y="\${h - pad + 15}" text-anchor="middle" font-size="8" fill="#6B5D54">\${d.name}</text>\`;
    });
    if (data.length > 0) {
      const lastX = pad + (data.length - 1) * stepX;
      area += \` L \${lastX} \${h - pad} L \${pad} \${h - pad} Z\`;
    }
    const axis = \`<line x1="\${pad}" y1="\${h-pad}" x2="\${w-pad}" y2="\${h-pad}" stroke="#DAA520" stroke-width="1"/>
                  <line x1="\${pad}" y1="\${pad}" x2="\${pad}" y2="\${h-pad}" stroke="#DAA520" stroke-width="1"/>\`;
    return \`<svg width="\${w}" height="\${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="\${area}" fill="#DAA520" opacity="0.3"/>
      <path d="\${path}" fill="none" stroke="#C65D2C" stroke-width="2"/>
      \${dots}\${labels}\${axis}
    </svg>\`;
  };

  const svgCarte = (data) => {
    const coords = {
      'ouidah': [100, 280], 'abomey': [200, 180], 'porto-novo': [380, 230],
      'cotonou': [330, 260], 'allada': [180, 230], 'grand-popo': [50, 280],
      'come': [70, 260], 'savi': [130, 250], 'tori': [180, 210], 'togbin': [200, 260],
      'avrankou': [350, 210], 'ketou': [300, 100], 'sakete': [370, 160], 'pobe': [350, 120],
      'lokossa': [100, 200], 'dogbo': [130, 180], 'aplahoue': [140, 160], 'klouekanme': [170, 150],
      'bohicon': [210, 165], 'zagnanado': [220, 185], 'parakou': [280, 50], 'djougou': [180, 50],
      'natitingou': [120, 30], 'kandi': [320, 30], 'lome': [40, 300]
    };
    const maxVal = Math.max(...data.map(d => d.value), 1);
    let circles = '';
    data.slice(0, 15).forEach(d => {
      const pos = coords[d.name.toLowerCase().trim()];
      if (pos) {
        const r = 8 + (d.value / maxVal) * 20;
        circles += \`<circle cx="\${pos[0]}" cy="\${pos[1]}" r="\${r}" fill="#C65D2C" opacity="0.75" stroke="#DAA520" stroke-width="2"/>
                    <text x="\${pos[0]}" y="\${pos[1]+4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">\${d.value}</text>
                    <text x="\${pos[0]}" y="\${pos[1]+r+12}" text-anchor="middle" font-size="9" fill="#2C1810">\${d.name}</text>\`;
      }
    });
    return \`<svg width="450" height="350" xmlns="http://www.w3.org/2000/svg" style="background: linear-gradient(to bottom, #E8F4F8, #D4E8D4); border: 2px solid #DAA520; border-radius: 8px;">
      <text x="225" y="20" text-anchor="middle" font-size="14" fill="#2C1810" font-weight="bold">🗺️ CARTE DES VILLAGES D'ORIGINE</text>
      \${circles}
      <circle cx="400" cy="320" r="8" fill="#C65D2C" opacity="0.75"/>
      <text x="415" y="324" font-size="9" fill="#2C1810">= participant</text>
    </svg>\`;
  };

  const colors = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936', '#48bb78', '#667eea'];

  const html = \`
    <div style="font-family: Arial; color: #2C1810; padding: 25px; background: white;">
      
      <!-- EN-TÊTE -->
      <div style="text-align: center; border-bottom: 4px double #DAA520; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 3px; color: #2C1810;">🎵 HWENDO 2026</h1>
        <h2 style="color: #C65D2C; margin: 8px 0; font-size: 18px;">RAPPORT STATISTIQUE DE L'ÉVÉNEMENT</h2>
        <p style="color: #6B5D54; font-size: 11px; margin: 5px 0;">Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
        <p style="color: #6B5D54; font-size: 10px; margin: 3px 0;">Généré le \${new Date().toLocaleDateString('fr-FR')} à \${new Date().toLocaleTimeString('fr-FR')}</p>
        <p style="color: #8B4513; font-size: 11px; font-style: italic; margin: 5px 0;">OBG International Bénin</p>
      </div>
      
      <!-- CHIFFRES CLÉS -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">📊 CHIFFRES CLÉS</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0 25px 0;">
        <tr style="background: #FDF5E6;">
          <td style="padding: 12px; border: 1px solid #DAA520; text-align: center;"><strong>👥</strong><br/><span style="font-size: 24px; color: #C65D2C; font-weight: bold;">\${stats.total}</span><br/><small>Participants</small></td>
          <td style="padding: 12px; border: 1px solid #DAA520; text-align: center;"><strong>✍️</strong><br/><span style="font-size: 24px; color: #C65D2C; font-weight: bold;">\${stats.signes}</span><br/><small>Signés</small></td>
          <td style="padding: 12px; border: 1px solid #DAA520; text-align: center;"><strong>📸</strong><br/><span style="font-size: 24px; color: #C65D2C; font-weight: bold;">\${stats.photos}</span><br/><small>Photos</small></td>
          <td style="padding: 12px; border: 1px solid #DAA520; text-align: center;"><strong>🎥</strong><br/><span style="font-size: 24px; color: #C65D2C; font-weight: bold;">\${stats.videos}</span><br/><small>Vidéos</small></td>
          <td style="padding: 12px; border: 1px solid #DAA520; text-align: center;"><strong>🎤</strong><br/><span style="font-size: 24px; color: #C65D2C; font-weight: bold;">\${stats.audios}</span><br/><small>Audios</small></td>
        </tr>
      </table>
      
      <!-- ÉVOLUTION PAR JOUR -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">📅 ÉVOLUTION DE L'ÉVÉNEMENT</h3>
      <p style="color: #6B5D54; font-size: 11px; font-style: italic; margin-bottom: 10px;">Nombre de participants enregistrés par jour</p>
      <div style="text-align: center; margin-bottom: 25px;">\${svgCourbe(stats.jourData)}</div>
      
      <!-- CARTE DES VILLAGES -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; page-break-before: always;">🗺️ CARTE DES VILLAGES D'ORIGINE</h3>
      <p style="color: #6B5D54; font-size: 11px; font-style: italic; margin-bottom: 10px;">La taille des cercles est proportionnelle au nombre de participants</p>
      <div style="text-align: center; margin-bottom: 25px;">\${svgCarte(stats.villageData)}</div>
      
      <!-- RÉPARTITION PAR TYPE -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">👥 RÉPARTITION PAR TYPE</h3>
      <div style="text-align: center; margin-bottom: 25px;">\${svgBar(stats.typeData, '#C65D2C')}</div>
      
      <!-- RÉPARTITION PAR SEXE -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; page-break-before: always;">⚥ RÉPARTITION PAR SEXE</h3>
      <div style="text-align: center; margin-bottom: 25px;">\${svgPie(stats.sexeData, ['#4299e1', '#ed8936'])}</div>
      
      <!-- TOP VILLAGES -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🏘️ TOP VILLAGES D'ORIGINE</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr style="background: #C65D2C; color: white;">
          <th style="padding: 8px; border: 1px solid #8B4513;">#</th>
          <th style="padding: 8px; border: 1px solid #8B4513;">Village</th>
          <th style="padding: 8px; border: 1px solid #8B4513; text-align: center;">Participants</th>
          <th style="padding: 8px; border: 1px solid #8B4513; text-align: center;">%</th>
        </tr>
        \${stats.villageData.slice(0, 10).map((v, i) => \`
          <tr style="background: \${i % 2 ? '#FDF5E6' : 'white'};">
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">\${v.name}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${v.value}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">\${stats.total > 0 ? ((v.value / stats.total) * 100).toFixed(1) : 0}%</td>
          </tr>
        \`).join('')}
      </table>
      
      <!-- CLASSEMENT LANGUES -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🏆 CLASSEMENT DES LANGUES</h3>
      <div style="text-align: center; margin-bottom: 25px;">\${svgHBar(stats.langueData, '#DAA520')}</div>
      
      <!-- PERMISSIONS -->
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px; page-break-before: always;">🎭 PERMISSIONS ACCORDÉES</h3>
      <div style="text-align: center; margin-bottom: 25px;">\${svgHBar(stats.permissions, '#556B2F')}</div>
      
      <!-- FOOTER -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 3px double #DAA520;">
        <p style="margin: 5px 0; font-weight: bold; color: #C65D2C;">Tout droit réservé OBG International Bénin</p>
        <p style="margin: 3px 0; font-size: 10px; color: #6B5D54;">HWENDO 2026 • Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
        <p style="margin: 3px 0; font-size: 9px; color: #6B5D54;">Palais Royal DADA DA AGBO HOUNON HOUNAN</p>
      </div>
    </div>
  \`;

  container.innerHTML = html;
  
  // Générer le PDF
  await html2pdf().from(container).set({
    margin: 10,
    filename: 'RAPPORT_HWENDO_2026_' + new Date().toISOString().slice(0, 10) + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  }).save();
  
  document.body.removeChild(container);
}

// 🆕 Fonction pour capturer les graphiques en base64 pour l'email
export async function capturerGraphiques(stats) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '600px';
  document.body.appendChild(container);

  const colors = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936'];
  const images = {};

  // Helper SVG vers base64
  const svgToBase64 = async (svgString, width, height) => {
    const div = document.createElement('div');
    div.innerHTML = svgString;
    container.innerHTML = '';
    container.appendChild(div);
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    try {
      const canvas = await html2canvas(div, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Erreur capture:', e);
      return null;
    }
  };

  // Les mêmes fonctions SVG que pour le PDF
  const svgCourbe = (data) => {
    if (data.length === 0) return '<svg width="600" height="200" xmlns="http://www.w3.org/2000/svg"><text x="10" y="100" fill="#6B5D54">Aucune donnée</text></svg>';
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const w = 600, h = 180, pad = 40;
    const stepX = (w - 2*pad) / Math.max(data.length - 1, 1);
    let path = '', area = '', dots = '', labels = '';
    data.forEach((d, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (d.value / maxVal) * (h - 2*pad);
      path += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
      area += (i === 0 ? 'M ' + pad + ' ' + (h - pad) + ' L' : ' L') + x + ' ' + y + ' ';
      dots += \`<circle cx="\${x}" cy="\${y}" r="4" fill="#C65D2C"/>\`;
      labels += \`<text x="\${x}" y="\${y - 10}" text-anchor="middle" font-size="10" fill="#C65D2C" font-weight="bold">\${d.value}</text>\`;
      labels += \`<text x="\${x}" y="\${h - pad + 15}" text-anchor="middle" font-size="8" fill="#6B5D54">\${d.name}</text>\`;
    });
    if (data.length > 0) {
      const lastX = pad + (data.length - 1) * stepX;
      area += \` L \${lastX} \${h - pad} L \${pad} \${h - pad} Z\`;
    }
    return \`<svg width="\${w}" height="\${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="\${area}" fill="#DAA520" opacity="0.3"/>
      <path d="\${path}" fill="none" stroke="#C65D2C" stroke-width="2"/>
      \${dots}\${labels}
    </svg>\`;
  };

  const svgCarte = (data) => {
    const coords = {
      'ouidah': [100, 280], 'abomey': [200, 180], 'porto-novo': [380, 230],
      'cotonou': [330, 260], 'allada': [180, 230], 'grand-popo': [50, 280],
      'come': [70, 260], 'savi': [130, 250], 'tori': [180, 210], 'togbin': [200, 260],
      'avrankou': [350, 210], 'ketou': [300, 100], 'sakete': [370, 160], 'pobe': [350, 120],
      'lokossa': [100, 200], 'dogbo': [130, 180], 'aplahoue': [140, 160], 'bohicon': [210, 165],
      'parakou': [280, 50], 'djougou': [180, 50], 'natitingou': [120, 30], 'kandi': [320, 30]
    };
    const maxVal = Math.max(...data.map(d => d.value), 1);
    let circles = '';
    data.slice(0, 15).forEach(d => {
      const pos = coords[d.name.toLowerCase().trim()];
      if (pos) {
        const r = 8 + (d.value / maxVal) * 20;
        circles += \`<circle cx="\${pos[0]}" cy="\${pos[1]}" r="\${r}" fill="#C65D2C" opacity="0.75" stroke="#DAA520" stroke-width="2"/>
                    <text x="\${pos[0]}" y="\${pos[1]+4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">\${d.value}</text>
                    <text x="\${pos[0]}" y="\${pos[1]+r+12}" text-anchor="middle" font-size="9" fill="#2C1810">\${d.name}</text>\`;
      }
    });
    return \`<svg width="450" height="350" xmlns="http://www.w3.org/2000/svg" style="background: linear-gradient(to bottom, #E8F4F8, #D4E8D4); border: 2px solid #DAA520; border-radius: 8px;">
      <text x="225" y="20" text-anchor="middle" font-size="14" fill="#2C1810" font-weight="bold">CARTE DES VILLAGES D'ORIGINE</text>
      \${circles}
    </svg>\`;
  };

  const svgBar = (data, color) => {
    const barWidth = 60;
    const spacing = 20;
    const height = 180;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const width = data.length * (barWidth + spacing) + spacing;
    let bars = '';
    data.forEach((d, i) => {
      const h = (d.value / maxVal) * (height - 30);
      const x = spacing + i * (barWidth + spacing);
      const y = height - h - 20;
      bars += \`<rect x="\${x}" y="\${y}" width="\${barWidth}" height="\${h}" fill="\${color}" rx="4"/>
               <text x="\${x + barWidth/2}" y="\${y - 5}" text-anchor="middle" font-size="11" fill="#2C1810" font-weight="bold">\${d.value}</text>
               <text x="\${x + barWidth/2}" y="\${height - 3}" text-anchor="middle" font-size="9" fill="#6B5D54">\${d.name.length > 12 ? d.name.substring(0,12) + '...' : d.name}</text>\`;
    });
    return \`<svg width="\${width}" height="\${height}" xmlns="http://www.w3.org/2000/svg">\${bars}</svg>\`;
  };

  const svgPie = (data, colorsPie) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><text x="10" y="100" fill="#6B5D54">Aucune donnée</text></svg>';
    let paths = '';
    let acc = 0;
    const cx = 100, cy = 100, r = 70;
    data.forEach((d, i) => {
      const frac = d.value / total;
      const a1 = acc * 2 * Math.PI - Math.PI/2;
      const a2 = (acc + frac) * 2 * Math.PI - Math.PI/2;
      acc += frac;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = frac > 0.5 ? 1 : 0;
      paths += \`<path d="M \${cx} \${cy} L \${x1} \${y1} A \${r} \${r} 0 \${large} 1 \${x2} \${y2} Z" fill="\${colorsPie[i % colorsPie.length]}"/>\`;
    });
    let legend = '';
    data.forEach((d, i) => {
      legend += \`<rect x="220" y="\${40 + i*22}" width="14" height="14" fill="\${colorsPie[i % colorsPie.length]}"/>
                 <text x="240" y="\${51 + i*22}" font-size="11" fill="#2C1810">\${d.name}: \${d.value}</text>\`;
    });
    return \`<svg width="380" height="\${Math.max(200, 40 + data.length*22 + 10)}" xmlns="http://www.w3.org/2000/svg">\${paths}\${legend}</svg>\`;
  };

  const svgHBar = (data, color) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    let bars = '';
    data.forEach((d, i) => {
      const w = (d.value / maxVal) * 280;
      const y = i * 28 + 10;
      bars += \`<text x="0" y="\${y + 14}" font-size="10" fill="#2C1810">\${d.name}</text>
               <rect x="90" y="\${y}" width="\${w}" height="18" fill="\${color}" rx="3"/>
               <text x="\${95 + w}" y="\${y + 14}" font-size="10" fill="#2C1810" font-weight="bold">\${d.value}</text>\`;
    });
    return \`<svg width="400" height="\${data.length * 28 + 15}" xmlns="http://www.w3.org/2000/svg">\${bars}</svg>\`;
  };

  // Capturer chaque graphique
  images.courbe = await svgToBase64(svgCourbe(stats.jourData), 600, 180);
  images.carte = await svgToBase64(svgCarte(stats.villageData), 450, 350);
  images.type = await svgToBase64(svgBar(stats.typeData, '#C65D2C'), 400, 180);
  images.sexe = await svgToBase64(svgPie(stats.sexeData, ['#4299e1', '#ed8936']), 380, 200);
  images.villages = await svgToBase64(svgHBar(stats.villageData.slice(0, 8), '#DAA520'), 400, 240);
  images.langues = await svgToBase64(svgHBar(stats.langueData, '#DAA520'), 400, Math.max(100, stats.langueData.length * 28 + 15));
  images.permissions = await svgToBase64(svgHBar(stats.permissions, '#556B2F'), 400, 180);

  document.body.removeChild(container);
  return images;
}
`);

// 2. Mettre à jour Statistiques.jsx pour utiliser le nouveau rapport
fs.writeFileSync('src/components/Statistiques.jsx', `import { useState, useEffect } from 'react';
import { db } from '../db/localDB';
import { api } from '../services/api';
import CarteVillages from './CarteVillages';
import { genererRapportComplet, capturerGraphiques } from './RapportPDF';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#C65D2C', '#DAA520', '#556B2F', '#8B0000', '#4299e1', '#ed8936'];

export default function Statistiques() {
  const [stats, setStats] = useState(null);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const dets = await db.detenteurs.toArray();
      const files = await db.files.toArray();

      const parType = {};
      dets.forEach(d => { const t = d.typePersonne || 'Détenteur'; parType[t] = (parType[t] || 0) + 1; });
      const typeData = Object.entries(parType).map(([name, value]) => ({ name, value }));

      const sexeData = [
        { name: 'Hommes', value: dets.filter(d => d.sexe === 'M').length },
        { name: 'Femmes', value: dets.filter(d => d.sexe === 'F').length }
      ].filter(s => s.value > 0);

      const parVillage = {};
      dets.forEach(d => { const v = d.village || 'Inconnu'; parVillage[v] = (parVillage[v] || 0) + 1; });
      const villageData = Object.entries(parVillage).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

      const parLangue = {};
      dets.forEach(d => { const l = d.langue || 'Non renseigné'; parLangue[l] = (parLangue[l] || 0) + 1; });
      const langueData = Object.entries(parLangue).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

      const parJour = {};
      dets.forEach(d => {
        if (d.createdAt) {
          const dt = new Date(d.createdAt);
          const key = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          if (!parJour[key]) parJour[key] = { name: key, ts: dt.getTime(), value: 0 };
          parJour[key].value++;
        }
      });
      const jourData = Object.values(parJour).sort((a,b) => a.ts - b.ts);

      const permissions = [
        ['peutParler', 'Interview'], ['peutChanter', 'Chant/Audio'],
        ['peutEtreFilme', 'Filmé'], ['peutFilmer', 'Photographié'],
        ['preterInstrument', 'Instrument'], ['montrerLieuSacre', 'Lieu sacré']
      ].map(([key, label]) => ({ name: label, value: dets.filter(d => d[key]).length }));

      setStats({
        total: dets.length,
        signes: dets.filter(d => d.signature || d.docUrl).length,
        photos: files.filter(f => f.type === 'photo').length,
        videos: files.filter(f => f.type === 'video').length,
        audios: files.filter(f => f.type === 'audio').length,
        typeData, sexeData, villageData, langueData, jourData, permissions
      });
    } catch (e) { console.error(e); }
  };

  const exportPDF = async () => {
    if (!stats) return;
    setExporting(true);
    try {
      await genererRapportComplet(stats);
    } catch (e) {
      alert('Erreur export: ' + e.message);
    }
    setExporting(false);
  };

  const sendEmail = async () => {
    const email = window.prompt('📧 Adresse email du destinataire :');
    if (!email || !email.includes('@')) { alert('Adresse invalide'); return; }
    setSending(true);
    try {
      // Capturer les graphiques en base64
      const images = await capturerGraphiques(stats);
      await api.envoyerRapportEmail(stats, email, images);
      alert('✅ Rapport envoyé à ' + email + ' !\\n(Vérifiez votre boîte mail dans quelques secondes)');
    } catch (e) {
      alert('❌ Erreur: ' + e.message);
    }
    setSending(false);
  };

  if (!stats) return <div style={{textAlign: 'center', padding: '50px'}}>⏳ Chargement des statistiques...</div>;

  const languesTriees = [...stats.langueData].sort((a,b) => b.value - a.value);
  const maxLangue = languesTriees[0]?.value || 1;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px'}}>
        <button onClick={exportPDF} disabled={exporting} className="btn-action pdf" style={{padding: '10px 20px', fontSize: '14px'}}>
          {exporting ? '⏳ Génération...' : '📥 Rapport PDF complet'}
        </button>
        <button onClick={sendEmail} disabled={sending} className="btn-action doc" style={{padding: '10px 20px', fontSize: '14px'}}>
          {sending ? '⏳ Envoi...' : '📧 Envoyer par email'}
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.total}</div><div className="stat-label">Participants</div></div>
        <div className="stat-card"><div className="stat-icon">✍️</div><div className="stat-value">{stats.signes}</div><div className="stat-label">Signés</div></div>
        <div className="stat-card"><div className="stat-icon">📸</div><div className="stat-value">{stats.photos}</div><div className="stat-label">Photos</div></div>
        <div className="stat-card"><div className="stat-icon">🎥</div><div className="stat-value">{stats.videos}</div><div className="stat-label">Vidéos</div></div>
        <div className="stat-card"><div className="stat-icon">🎤</div><div className="stat-value">{stats.audios}</div><div className="stat-label">Audios</div></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>📅 Évolution de l'événement</h3>
          {stats.jourData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.jourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#C65D2C" fill="#DAA520" fillOpacity={0.4} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{color: '#6B5D54', fontStyle: 'italic'}}>Pas encore de données datées.</p>
          )}
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)', gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🗺️ Carte des villages d'origine</h3>
          <CarteVillages villageData={stats.villageData} />
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🏆 Classement des langues</h3>
          {languesTriees.map((l, i) => (
            <div key={l.name} style={{marginBottom: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px'}}>
                <span style={{fontWeight: 'bold'}}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1) + '.'} {l.name}</span>
                <span style={{color: 'var(--ocre)', fontWeight: 'bold'}}>{l.value}</span>
              </div>
              <div style={{background: 'var(--sable)', borderRadius: '10px', height: '10px', overflow: 'hidden'}}>
                <div style={{width: ((l.value / maxLangue) * 100) + '%', height: '100%', background: 'linear-gradient(90deg, #C65D2C, #DAA520)', borderRadius: '10px'}}></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>👥 Par type de personne</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#C65D2C" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>⚥ Répartition par sexe</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.sexeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {stats.sexeData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
          <h3 style={{color: 'var(--terre)', marginBottom: '15px'}}>🎭 Permissions accordées</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.permissions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{fontSize: 11}} />
              <Tooltip />
              <Bar dataKey="value" fill="#556B2F" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
`);

// 3. Mettre à jour api.js pour envoyer les images
fs.writeFileSync('src/services/api.js', `import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt361jCljRmwDNhbfATncABZCYQMWQrn2vTBxU8cK6KwF9ldF6MiGBZyo14VB2vhNt/exec';

export const api = {
  async createDetenteur(data) {
    const response = await axios.post(API_URL + '/detenteurs', data);
    return response.data;
  },
  
  async getDetenteurs() {
    const response = await axios.get(API_URL + '/detenteurs');
    return response.data;
  },
  
  async generateConsentementDoc(detenteur, signature, photos = []) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ detenteur, signature, photos })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async envoyerRapportEmail(stats, email, images) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'rapport', stats, email, images })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
`);

console.log('🎉 Rapport UNIFIÉ créé : Graphiques + Carte + Évolution synchronisés !');
