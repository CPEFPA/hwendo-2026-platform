const fs = require('fs');

fs.writeFileSync('src/components/RapportPDF.jsx', `import html2pdf from 'html2pdf.js';

// ===== DESSIN CANVAS (100% fiable, génère des PNG) =====

function newCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w * 2;
  c.height = h * 2;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  return { c, ctx };
}

function drawCourbe(data) {
  const W = 600, H = 200;
  const { c, ctx } = newCanvas(W, H);
  if (!data || data.length === 0) {
    ctx.fillStyle = '#6B5D54'; ctx.font = '12px Arial';
    ctx.fillText('Aucune donnee', 10, H/2);
    return c.toDataURL('image/png');
  }
  const pad = 40;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const stepX = (W - 2*pad) / Math.max(data.length - 1, 1);
  ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  const pts = data.map((d, i) => ({ x: pad + i*stepX, y: H - pad - (d.value/maxVal)*(H-2*pad) }));
  ctx.beginPath(); ctx.moveTo(pts[0].x, H-pad);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, H-pad); ctx.closePath();
  ctx.fillStyle = 'rgba(218,165,32,0.3)'; ctx.fill();
  ctx.beginPath(); pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.strokeStyle = '#C65D2C'; ctx.lineWidth = 2; ctx.stroke();
  pts.forEach((p, i) => {
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fillStyle = '#C65D2C'; ctx.fill();
    ctx.fillStyle = '#C65D2C'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(String(data[i].value), p.x, p.y - 10);
    ctx.fillStyle = '#6B5D54'; ctx.font = '9px Arial';
    ctx.fillText(String(data[i].name), p.x, H - pad + 15);
  });
  return c.toDataURL('image/png');
}

function drawBar(data, color) {
  const W = 500, H = 200;
  const { c, ctx } = newCanvas(W, H);
  if (!data || data.length === 0) {
    ctx.fillStyle = '#6B5D54'; ctx.font = '12px Arial';
    ctx.fillText('Aucune donnee', 10, H/2);
    return c.toDataURL('image/png');
  }
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const n = data.length;
  const barW = Math.min(60, (W - 60) / n - 15);
  const spacing = (W - 40 - n*barW) / (n+1);
  data.forEach((d, i) => {
    const h = (d.value/maxVal) * (H - 60);
    const x = 20 + spacing + i*(barW+spacing);
    const y = H - 30 - h;
    ctx.fillStyle = color; ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#2C1810'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
    ctx.fillText(String(d.value), x + barW/2, y - 5);
    ctx.fillStyle = '#6B5D54'; ctx.font = '9px Arial';
    ctx.fillText(String(d.name).substring(0, 12), x + barW/2, H - 12);
  });
  return c.toDataURL('image/png');
}

function drawHBar(data, color) {
  const W = 450;
  const rowH = 28;
  const H = Math.max((data||[]).length * rowH + 20, 60);
  const { c, ctx } = newCanvas(W, H);
  const maxVal = Math.max(...(data||[]).map(d => d.value), 1);
  (data||[]).forEach((d, i) => {
    const y = i*rowH + 10;
    ctx.fillStyle = '#2C1810'; ctx.font = '10px Arial'; ctx.textAlign = 'left';
    ctx.fillText(String(d.name), 0, y + 14);
    const w = (d.value/maxVal) * (W - 160);
    ctx.fillStyle = color; ctx.fillRect(100, y, w, 18);
    ctx.fillStyle = '#2C1810'; ctx.font = 'bold 10px Arial';
    ctx.fillText(String(d.value), 105 + w, y + 14);
  });
  return c.toDataURL('image/png');
}

function drawPie(data, colors) {
  const W = 400, H = 220;
  const { c, ctx } = newCanvas(W, H);
  const total = (data||[]).reduce((s,d) => s + d.value, 0);
  if (total === 0) {
    ctx.fillStyle = '#6B5D54'; ctx.font = '12px Arial';
    ctx.fillText('Aucune donnee', 10, H/2);
    return c.toDataURL('image/png');
  }
  const cx = 100, cy = 110, r = 80;
  let acc = 0;
  data.forEach((d, i) => {
    const frac = d.value/total;
    const a1 = acc*2*Math.PI - Math.PI/2;
    const a2 = (acc+frac)*2*Math.PI - Math.PI/2;
    acc += frac;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a1, a2); ctx.closePath();
    ctx.fillStyle = colors[i % colors.length]; ctx.fill();
  });
  data.forEach((d, i) => {
    const y = 40 + i*24;
    ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(220, y, 14, 14);
    ctx.fillStyle = '#2C1810'; ctx.font = '11px Arial'; ctx.textAlign = 'left';
    ctx.fillText(d.name + ': ' + d.value, 240, y + 11);
  });
  return c.toDataURL('image/png');
}

function drawCarte(data) {
  const W = 450, H = 350;
  const { c, ctx } = newCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#E8F4F8'); g.addColorStop(1, '#D4E8D4');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W-2, H-2);
  ctx.fillStyle = '#2C1810'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
  ctx.fillText('CARTE DES VILLAGES D' + "'" + 'ORIGINE', W/2, 22);
  const coords = {
    'ouidah': [100, 280], 'abomey': [200, 180], 'porto-novo': [380, 230],
    'cotonou': [330, 260], 'allada': [180, 230], 'grand-popo': [50, 280],
    'come': [70, 260], 'savi': [130, 250], 'tori': [180, 210], 'togbin': [200, 260],
    'avrankou': [350, 210], 'ketou': [300, 100], 'sakete': [370, 160], 'pobe': [350, 120],
    'lokossa': [100, 200], 'dogbo': [130, 180], 'aplahoue': [140, 160], 'bohicon': [210, 165],
    'parakou': [280, 50], 'djougou': [180, 50], 'natitingou': [120, 30], 'kandi': [320, 30]
  };
  const maxVal = Math.max(...(data||[]).map(d => d.value), 1);
  (data||[]).slice(0, 15).forEach(d => {
    const pos = coords[(d.name||'').toLowerCase().trim()];
    if (pos) {
      const r = 8 + (d.value/maxVal)*20;
      ctx.beginPath(); ctx.arc(pos[0], pos[1], r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(198,93,44,0.8)'; ctx.fill();
      ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      ctx.fillText(String(d.value), pos[0], pos[1]+4);
      ctx.fillStyle = '#2C1810'; ctx.font = '9px Arial';
      ctx.fillText(String(d.name), pos[0], pos[1]+r+12);
    }
  });
  return c.toDataURL('image/png');
}

// ===== GÉNÉRER LES IMAGES UNE FOIS =====
function genererImages(stats) {
  return {
    courbe: drawCourbe(stats.jourData),
    carte: drawCarte(stats.villageData),
    type: drawBar(stats.typeData, '#C65D2C'),
    sexe: drawPie(stats.sexeData, ['#4299e1', '#ed8936']),
    villages: drawHBar(stats.villageData.slice(0, 8), '#DAA520'),
    langues: drawHBar(stats.langueData, '#DAA520'),
    permissions: drawHBar(stats.permissions, '#556B2F')
  };
}

// ===== RAPPORT PDF COMPLET =====
export async function genererRapportComplet(stats) {
  const img = genererImages(stats);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '700px';
  document.body.appendChild(container);

  const html = \`
    <div style="font-family: Arial; color: #2C1810; padding: 25px; background: white;">
      <div style="text-align: center; border-bottom: 4px double #DAA520; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 3px;">🎵 HWENDO 2026</h1>
        <h2 style="color: #C65D2C; margin: 8px 0; font-size: 18px;">RAPPORT STATISTIQUE DE L'ÉVÉNEMENT</h2>
        <p style="color: #6B5D54; font-size: 11px;">Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
        <p style="color: #6B5D54; font-size: 10px;">Généré le \${new Date().toLocaleDateString('fr-FR')} • OBG International Bénin</p>
      </div>
      
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
      
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">📅 ÉVOLUTION DE L'ÉVÉNEMENT</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.courbe}" style="width: 100%; max-width: 600px;"/></div>
      
      <div style="page-break-before: always;"></div>
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🗺️ CARTE DES VILLAGES D'ORIGINE</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.carte}" style="max-width: 100%;"/></div>
      
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">👥 RÉPARTITION PAR TYPE</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.type}" style="max-width: 100%;"/></div>
      
      <div style="page-break-before: always;"></div>
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">⚥ RÉPARTITION PAR SEXE</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.sexe}" style="max-width: 100%;"/></div>
      
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🏘️ TOP VILLAGES</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr style="background: #C65D2C; color: white;">
          <th style="padding: 8px; border: 1px solid #8B4513;">#</th>
          <th style="padding: 8px; border: 1px solid #8B4513;">Village</th>
          <th style="padding: 8px; border: 1px solid #8B4513;">Participants</th>
          <th style="padding: 8px; border: 1px solid #8B4513;">%</th>
        </tr>
        \${stats.villageData.slice(0, 10).map((v, i) => \`
          <tr style="background: \${i % 2 ? '#FDF5E6' : 'white'};">
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">\${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">\${v.name}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold;">\${v.value}</td>
            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">\${stats.total > 0 ? ((v.value / stats.total) * 100).toFixed(1) : 0}%</td>
          </tr>
        \`).join('')}
      </table>
      
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🏆 CLASSEMENT DES LANGUES</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.langues}" style="max-width: 100%;"/></div>
      
      <div style="page-break-before: always;"></div>
      <h3 style="color: #C65D2C; border-bottom: 2px solid #DAA520; padding-bottom: 5px;">🎭 PERMISSIONS ACCORDÉES</h3>
      <div style="text-align: center; margin-bottom: 25px;"><img src="\${img.permissions}" style="max-width: 100%;"/></div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 3px double #DAA520;">
        <p style="margin: 5px 0; font-weight: bold; color: #C65D2C;">Tout droit réservé OBG International Bénin</p>
        <p style="margin: 3px 0; font-size: 10px; color: #6B5D54;">HWENDO 2026 • Palais Royal DADA DA AGBO HOUNON HOUNAN</p>
      </div>
    </div>
  \`;

  container.innerHTML = html;
  
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

// ===== CAPTURER POUR L'EMAIL =====
export async function capturerGraphiques(stats) {
  return genererImages(stats);
}
`);

console.log('🎉 Graphiques Canvas créés (PNG fiables) !');
