import { jsPDF } from 'jspdf';


// ===== DESSIN CANVAS (retourne url + dimensions) =====

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
    return { url: c.toDataURL('image/png'), w: W, h: H };
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
  return { url: c.toDataURL('image/png'), w: W, h: H };
}

function drawBar(data, color) {
  const W = 500, H = 200;
  const { c, ctx } = newCanvas(W, H);
  if (!data || data.length === 0) {
    ctx.fillStyle = '#6B5D54'; ctx.font = '12px Arial';
    ctx.fillText('Aucune donnee', 10, H/2);
    return { url: c.toDataURL('image/png'), w: W, h: H };
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
  return { url: c.toDataURL('image/png'), w: W, h: H };
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
  return { url: c.toDataURL('image/png'), w: W, h: H };
}

function drawPie(data, colors) {
  const W = 400, H = 220;
  const { c, ctx } = newCanvas(W, H);
  const total = (data||[]).reduce((s,d) => s + d.value, 0);
  if (total === 0) {
    ctx.fillStyle = '#6B5D54'; ctx.font = '12px Arial';
    ctx.fillText('Aucune donnee', 10, H/2);
    return { url: c.toDataURL('image/png'), w: W, h: H };
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
  return { url: c.toDataURL('image/png'), w: W, h: H };
}

function drawCarte(data) {
  const W = 450, H = 350;
  const { c, ctx } = newCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#E8F4F8'); g.addColorStop(1, '#D4E8D4');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W-2, H-2);
  ctx.fillStyle = '#2C1810'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
  ctx.fillText("CARTE DES VILLAGES D'ORIGINE", W/2, 22);
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
  return { url: c.toDataURL('image/png'), w: W, h: H };
}

function genererImages(stats) {
  return {
    courbe: drawCourbe(stats.jourData),
    carte: drawCarte(stats.villageData),
    type: drawBar(stats.typeData, '#C65D2C'),
    sexe: drawPie(stats.sexeData, ['#4299e1', '#ed8936']),
    langues: drawHBar(stats.langueData, '#DAA520'),
    permissions: drawHBar(stats.permissions, '#556B2F')
  };
}

// ===== RAPPORT PDF AVEC jsPDF (fiable) =====
export async function genererRapportComplet(stats) {
  const img = genererImages(stats);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = 210, pageH = 297, margin = 15;
  const contentW = pageW - 2*margin;
  let y = 0;

  // EN-TETE (bandeau sombre)
  pdf.setFillColor(44, 24, 16);
  pdf.rect(0, 0, pageW, 32, 'F');
  pdf.setTextColor(244, 196, 48);
  pdf.setFontSize(22); pdf.setFont(undefined, 'bold');
  pdf.text('HWENDO 2026', pageW/2, 13, { align: 'center' });
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.text("RAPPORT STATISTIQUE DE L'EVENEMENT", pageW/2, 21, { align: 'center' });
  pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
  pdf.setTextColor(210, 200, 190);
  pdf.text('Mission de sauvegarde du patrimoine musical - OBG International Benin', pageW/2, 28, { align: 'center' });
  y = 42;

  // Fonction titre de section
  const sectionTitle = (txt) => {
    if (y > pageH - margin - 30) { pdf.addPage(); y = margin; }
    y += 4;
    pdf.setFontSize(13); pdf.setFont(undefined, 'bold');
    pdf.setTextColor(198, 93, 44);
    pdf.text(txt, margin, y);
    pdf.setDrawColor(218, 165, 32); pdf.setLineWidth(0.6);
    pdf.line(margin, y + 1.5, margin + contentW, y + 1.5);
    y += 9;
  };

  // Fonction ajouter une image (centre, garde le ratio, saut de page auto)
  const addChart = (chart, maxH) => {
    if (!chart) return;
    const ratio = chart.h / chart.w;
    let w = contentW;
    let h = w * ratio;
    const limit = maxH || 130;
    if (h > limit) { h = limit; w = h / ratio; }
    if (y + h > pageH - margin) { pdf.addPage(); y = margin; }
    const x = margin + (contentW - w) / 2;
    pdf.addImage(chart.url, 'PNG', x, y, w, h);
    y += h + 8;
  };

  // CHIFFRES CLES (5 boites)
  sectionTitle('CHIFFRES CLES');
  const chiffres = [
    ['PARTICIPANTS', stats.total], ['SIGNES', stats.signes],
    ['PHOTOS', stats.photos], ['VIDEOS', stats.videos], ['AUDIOS', stats.audios]
  ];
  const boxW = (contentW - 4*3) / 5;
  chiffres.forEach((ch, i) => {
    const x = margin + i * (boxW + 3);
    pdf.setFillColor(253, 245, 230);
    pdf.setDrawColor(218, 165, 32);
    pdf.roundedRect(x, y, boxW, 20, 1.5, 1.5, 'FD');
    pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
    pdf.setTextColor(198, 93, 44);
    pdf.text(String(ch[1]), x + boxW/2, y + 9, { align: 'center' });
    pdf.setFontSize(6.5); pdf.setFont(undefined, 'normal');
    pdf.setTextColor(107, 93, 84);
    pdf.text(ch[0], x + boxW/2, y + 16, { align: 'center' });
  });
  y += 26;

  // EVOLUTION PAR JOUR
  sectionTitle("EVOLUTION DE L'EVENEMENT (participants par jour)");
  addChart(img.courbe, 90);

  // CARTE
  sectionTitle("CARTE DES VILLAGES D'ORIGINE");
  addChart(img.carte, 130);

  // TYPE
  sectionTitle('REPARTITION PAR TYPE DE PERSONNE');
  addChart(img.type, 90);

  // SEXE
  sectionTitle('REPARTITION PAR SEXE');
  addChart(img.sexe, 90);

  // TABLEAU TOP VILLAGES
  sectionTitle("TOP VILLAGES D'ORIGINE");
  if (y > pageH - margin - 40) { pdf.addPage(); y = margin; }
  const villages = stats.villageData.slice(0, 10);
  pdf.setFillColor(198, 93, 44);
  pdf.rect(margin, y, contentW, 8, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
  pdf.text('#', margin + 4, y + 5.5);
  pdf.text('VILLAGE', margin + 18, y + 5.5);
  pdf.text('PARTICIPANTS', margin + contentW - 55, y + 5.5);
  pdf.text('%', margin + contentW - 18, y + 5.5);
  y += 8;
  pdf.setTextColor(44, 24, 16); pdf.setFont(undefined, 'normal');
  villages.forEach((v, i) => {
    if (y > pageH - margin - 8) { pdf.addPage(); y = margin; }
    if (i % 2 === 0) {
      pdf.setFillColor(253, 245, 230);
      pdf.rect(margin, y, contentW, 7, 'F');
    }
    pdf.setFontSize(9);
    pdf.text(String(i+1), margin + 4, y + 5);
    pdf.text(String(v.name), margin + 18, y + 5);
    pdf.text(String(v.value), margin + contentW - 55, y + 5);
    const pct = stats.total > 0 ? ((v.value/stats.total)*100).toFixed(1) + '%' : '0%';
    pdf.text(pct, margin + contentW - 18, y + 5);
    y += 7;
  });
  y += 4;

  // LANGUES
  sectionTitle('CLASSEMENT DES LANGUES');
  addChart(img.langues, 100);

  // PERMISSIONS
  sectionTitle('PERMISSIONS ACCORDEES');
  addChart(img.permissions, 95);

  // PIED DE PAGE sur chaque page
  const nbPages = pdf.getNumberOfPages();
  for (let i = 1; i <= nbPages; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(218, 165, 32); pdf.setLineWidth(0.5);
    pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
    pdf.setFontSize(8); pdf.setFont(undefined, 'bold');
    pdf.setTextColor(198, 93, 44);
    pdf.text('Tout droit reserve OBG International Benin', pageW/2, pageH - 8, { align: 'center' });
    pdf.setFontSize(7); pdf.setFont(undefined, 'normal');
    pdf.setTextColor(107, 93, 84);
    pdf.text('HWENDO 2026 - Palais Royal DADA DA AGBO HOUNON HOUNAN - Page ' + i + '/' + nbPages, pageW/2, pageH - 4, { align: 'center' });
  }

  pdf.save('RAPPORT_HWENDO_2026_' + new Date().toISOString().slice(0, 10) + '.pdf');
}

// ===== CAPTURER POUR L'EMAIL (retourne juste les url) =====
export async function capturerGraphiques(stats) {
  const img = genererImages(stats);
  return {
    courbe: img.courbe.url,
    carte: img.carte.url,
    type: img.type.url,
    sexe: img.sexe.url,
    villages: null,
    langues: img.langues.url,
    permissions: img.permissions.url
  };
}
