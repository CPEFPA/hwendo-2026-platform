import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { db } from '../db/localDB';

// Fonction pour nettoyer le texte pour jsPDF
function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{2000}-\u{206F}]/gu, '')
    .replace(/é|è|ê|ë/g, 'e')
    .replace(/à|â|ä/g, 'a')
    .replace(/ô|ö/g, 'o')
    .replace(/ù|û|ü/g, 'u')
    .replace(/î|ï/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/É|È|Ê|Ë/g, 'E')
    .replace(/À|Â|Ä/g, 'A')
    .replace(/Ô|Ö/g, 'O')
    .replace(/Ù|Û|Ü/g, 'U')
    .replace(/Ç/g, 'C')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fonction pour dessiner une case à cocher
function drawCheckbox(doc, x, y, checked, label) {
  const size = 3;
  const padding = 1;
  
  // Dessiner le carré
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(x, y - size + 0.5, size, size);
  
  // Si coché, dessiner un X ou une coche
  if (checked) {
    doc.setTextColor(72, 187, 120); // Vert
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('v', x + 0.5, y + 0.5);
  } else {
    doc.setTextColor(229, 62, 62); // Rouge clair
    doc.setFontSize(6);
    doc.text('x', x + 1, y + 0.2);
  }
  
  // Label
  doc.setTextColor(44, 24, 16);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(label, x + size + 2, y + 0.5);
}

function PDFGenerator({ detenteur }) {
  const [localMedia, setLocalMedia] = useState({ photo: null, signature: null });

  useEffect(() => {
    loadLocalMedia();
  }, [detenteur]);

  const loadLocalMedia = async () => {
    try {
      let localDet = null;
      
      if (detenteur.nomComplet) {
        localDet = await db.detenteurs.where('nomComplet').equals(detenteur.nomComplet).first();
      }
      
      if (!localDet && detenteur.backendId) {
        localDet = await db.detenteurs.where('backendId').equals(detenteur.backendId).first();
      }
      
      if (!localDet) {
        const allDets = await db.detenteurs.toArray();
        localDet = allDets.find(d => 
          d.nomComplet && detenteur.nomComplet && 
          d.nomComplet.toLowerCase().includes(detenteur.nomComplet.toLowerCase())
        );
      }
      
      if (localDet) {
        const signature = localDet.signature || null;
        let photo = null;
        
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
        } else if (localDet.id) {
          try {
            const files = await db.files.where('detenteurId').equals(localDet.id).toArray();
            const photoFile = files.find(f => f.type === 'photo');
            if (photoFile) photo = photoFile.data;
          } catch (e) {}
        }
        
        setLocalMedia({ photo, signature });
      }
    } catch (e) {
      console.warn('Erreur chargement medias:', e);
    }
  };

  const generatePDF = async () => {
    if (!detenteur) {
      alert('Aucune donnee disponible');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // EN-TÊTE
      doc.setFillColor(198, 93, 44);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('HWENDO 2026', 15, 12);
      
      doc.setFontSize(9);
      doc.text('Mission patrimoine musical - Royaume Hwendo', 15, 18);
      doc.text('Date: ' + new Date(detenteur.createdAt || Date.now()).toLocaleDateString('fr-FR'), pageWidth - 15, 12, { align: 'right' });

      doc.setTextColor(44, 24, 16);
      let y = 35;

      // TITRE
      doc.setFontSize(13);
      doc.setTextColor(139, 69, 19);
      doc.text('FICHE DETENTEUR DE SAVOIRS', pageWidth / 2, y, { align: 'center' });
      y += 3;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Ref: ' + (detenteur.reference || detenteur.id || '').substring(0, 25), pageWidth / 2, y, { align: 'center' });
      y += 6;

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.3);
      doc.line(15, y, pageWidth - 15, y);
      y += 4;

      const leftX = 15;
      const rightX = pageWidth - 15;
      const photoWidth = 45;
      const photoHeight = 55;
      const sigWidth = 45;
      const sigHeight = 20;

      // COLONNE DROITE : PHOTO + SIGNATURE
      let rightY = y;

      doc.setDrawColor(198, 93, 44);
      doc.setLineWidth(0.5);
      doc.rect(rightX - photoWidth, rightY, photoWidth, photoHeight);

      if (localMedia.photo && localMedia.photo.startsWith('data:image')) {
        try {
          doc.addImage(localMedia.photo, 'JPEG', rightX - photoWidth, rightY, photoWidth, photoHeight);
        } catch (e) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('Photo', rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
          doc.text('non disponible', rightX - photoWidth/2, rightY + photoHeight/2 + 4, { align: 'center' });
        }
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Photo', rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
        doc.text('non disponible', rightX - photoWidth/2, rightY + photoHeight/2 + 4, { align: 'center' });
      }

      rightY += photoHeight + 3;
      
      doc.setFontSize(8);
      doc.setTextColor(139, 69, 19);
      doc.text('Signature manuscrite', rightX - photoWidth/2, rightY, { align: 'center' });
      rightY += 2;

      doc.setDrawColor(198, 93, 44);
      doc.rect(rightX - sigWidth, rightY, sigWidth, sigHeight);

      const signature = localMedia.signature || detenteur.signature;
      if (signature && signature.startsWith('data:image')) {
        try {
          doc.addImage(signature, 'PNG', rightX - sigWidth, rightY, sigWidth, sigHeight);
        } catch (e) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('Non signee', rightX - sigWidth/2, rightY + sigHeight/2, { align: 'center' });
        }
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Non signee', rightX - sigWidth/2, rightY + sigHeight/2, { align: 'center' });
      }

      // COLONNE GAUCHE : IDENTITÉ
      doc.setFontSize(11);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('IDENTITE', leftX, y);
      y += 5;

      doc.setFontSize(9);
      doc.setTextColor(44, 24, 16);

      const identite = [
        ['Nom', cleanText(detenteur.nomComplet)],
        ['Surnom', cleanText(detenteur.surnomRituel) || '-'],
        ['Age', detenteur.age ? detenteur.age + ' ans' : '-'],
        ['Sexe', detenteur.sexe === 'M' ? 'Masculin' : detenteur.sexe === 'F' ? 'Feminin' : '-'],
        ['Village', cleanText(detenteur.village)],
        ['Fonction', cleanText(detenteur.fonctionPalais) || '-'],
        ['Telephone', cleanText(detenteur.telephone) || '-'],
        ['Langue', cleanText(detenteur.langue) || '-']
      ];

      identite.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', leftX, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || '-'), leftX + 25, y);
        y += 4.5;
      });

      y += 3;

      // PERMISSIONS AVEC CASES À COCHER
      doc.setFontSize(11);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('PERMISSIONS ACCORDEES', leftX, y);
      y += 5;

      const permissions = [
        ['Interviewe(e)', detenteur.peutParler],
        ['Chanter / Jouer', detenteur.peutChanter],
        ['Etre filme(e)', detenteur.peutEtreFilme],
        ['Etre photographie(e)', detenteur.peutFilmer],
        ['Preter un instrument', detenteur.preterInstrument],
        ['Montrer un lieu sacre', detenteur.montrerLieuSacre]
      ];

      permissions.forEach(([label, granted]) => {
        drawCheckbox(doc, leftX, y, granted, label);
        y += 4.5;
      });

      y += 3;

      // CONSENTEMENT
      doc.setFontSize(11);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('CONSENTEMENT', leftX, y);
      y += 5;

      const consentement = detenteur.consentementSigne || localMedia.signature || detenteur.signature;
      doc.setFontSize(10);
      if (consentement) {
        doc.setTextColor(72, 187, 120);
        doc.setFont(undefined, 'bold');
        doc.text('SIGNE', leftX, y);
      } else {
        doc.setTextColor(229, 62, 62);
        doc.setFont(undefined, 'bold');
        doc.text('NON SIGNE', leftX, y);
      }
      y += 6;

      // SPECIFICITES VODUN
      if (detenteur.anonymiser || detenteur.nomTraditionnelJamaisEcrit) {
        doc.setFontSize(11);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('SPECIFICITES VODUN', leftX, y);
        y += 4;

        doc.setFontSize(9);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        if (detenteur.anonymiser) {
          drawCheckbox(doc, leftX, y, true, 'Anonymisation demandee');
          y += 4;
        }
        if (detenteur.nomTraditionnelJamaisEcrit) {
          drawCheckbox(doc, leftX, y, true, 'Nom traditionnel jamais ecrit');
          y += 4;
        }
      }

      // GPS
      const gps = detenteur.gps || detenteur.coordonneesGPS;
      if (gps) {
        y += 2;
        doc.setFontSize(11);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('LOCALISATION GPS', leftX, y);
        y += 4;

        doc.setFontSize(8);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        doc.text(String(gps), leftX, y);
        y += 4;
      }

      // NOTES
      if (detenteur.notes) {
        y += 2;
        doc.setFontSize(11);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('NOTES TERRAIN', leftX, y);
        y += 4;

        doc.setFontSize(9);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        const noteLines = doc.splitTextToSize(cleanText(detenteur.notes), 100);
        noteLines.slice(0, 4).forEach(line => {
          doc.text(line, leftX, y);
          y += 4;
        });
        if (noteLines.length > 4) {
          doc.text('...', leftX, y);
        }
      }

      // PIED DE PAGE
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont(undefined, 'normal');
      doc.text(
        'HWENDO 2026 - OBG International Benin - Patrimoine musical du Royaume Hwendo',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      // TELECHARGEMENT
      const fileName = 'HWENDO_' + cleanText(detenteur.nomComplet || 'detenteur').replace(/\s+/g, '_') + '.pdf';
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Erreur lors de la generation: ' + error.message);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      className="btn-action pdf"
      style={{
        background: 'linear-gradient(135deg, #C65D2C, #8B4513)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Telecharger PDF
    </button>
  );
}

export default PDFGenerator;
