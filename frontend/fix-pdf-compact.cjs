const fs = require('fs');
const path = require('path');

const newPdfGenerator = `import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { db } from '../db/localDB';

function PDFGenerator({ detenteur }) {
  const [localMedia, setLocalMedia] = useState({ photo: null, signature: null });

  useEffect(() => {
    loadLocalMedia();
  }, [detenteur]);

  const loadLocalMedia = async () => {
    try {
      // Chercher la signature et photo depuis IndexedDB
      const localDet = await db.detenteurs.where('nomComplet').equals(detenteur.nomComplet).first();
      
      if (localDet) {
        // Signature
        const signature = localDet.signature || null;
        
        // Première photo
        let photo = null;
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
        } else {
          // Essayer de trouver dans files
          const files = await db.files.where('detenteurId').equals(localDet.id).toArray();
          const photoFile = files.find(f => f.type === 'photo');
          if (photoFile) photo = photoFile.data;
        }
        
        setLocalMedia({ photo, signature });
      }
    } catch (e) {
      console.warn('Erreur chargement médias locaux:', e);
    }
  };

  const generatePDF = async () => {
    if (!detenteur) {
      alert('Aucune donnée disponible');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ===== EN-TÊTE COMPACT =====
      doc.setFillColor(198, 93, 44);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('🎵 HWENDO 2026', 15, 12);
      
      doc.setFontSize(9);
      doc.text('Mission patrimoine musical - Royaume Hwendo', 15, 18);
      doc.text('Date: ' + new Date(detenteur.createdAt || Date.now()).toLocaleDateString('fr-FR'), pageWidth - 15, 12, { align: 'right' });

      doc.setTextColor(44, 24, 16);
      let y = 35;

      // ===== TITRE =====
      doc.setFontSize(13);
      doc.setTextColor(139, 69, 19);
      doc.text('FICHE DÉTENTEUR DE SAVOIRS', pageWidth / 2, y, { align: 'center' });
      y += 3;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Réf: ' + (detenteur.reference || detenteur.id || '').substring(0, 20), pageWidth / 2, y, { align: 'center' });
      y += 6;

      // Ligne de séparation
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.3);
      doc.line(15, y, pageWidth - 15, y);
      y += 4;

      // ===== DEUX COLONNES =====
      const leftX = 15;
      const rightX = pageWidth - 15;
      const photoWidth = 45;
      const photoHeight = 55;
      const sigWidth = 45;
      const sigHeight = 20;

      // ===== COLONNE DROITE : PHOTO + SIGNATURE =====
      let rightY = y;

      // Cadre photo
      doc.setDrawColor(198, 93, 44);
      doc.setLineWidth(0.5);
      doc.rect(rightX - photoWidth, rightY, photoWidth, photoHeight);

      if (localMedia.photo && localMedia.photo.startsWith('data:image')) {
        try {
          doc.addImage(localMedia.photo, 'JPEG', rightX - photoWidth, rightY, photoWidth, photoHeight);
        } catch (e) {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('📷', rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
        }
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Photo', rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
        doc.text('non disponible', rightX - photoWidth/2, rightY + photoHeight/2 + 4, { align: 'center' });
      }

      rightY += photoHeight + 3;
      
      // Label signature
      doc.setFontSize(8);
      doc.setTextColor(139, 69, 19);
      doc.text('Signature manuscrite', rightX - photoWidth/2, rightY, { align: 'center' });
      rightY += 2;

      // Cadre signature
      doc.setDrawColor(198, 93, 44);
      doc.rect(rightX - sigWidth, rightY, sigWidth, sigHeight);

      const signature = localMedia.signature || detenteur.signature;
      if (signature && signature.startsWith('data:image')) {
        try {
          doc.addImage(signature, 'PNG', rightX - sigWidth, rightY, sigWidth, sigHeight);
        } catch (e) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('✍️', rightX - sigWidth/2, rightY + sigHeight/2, { align: 'center' });
        }
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Non signée', rightX - sigWidth/2, rightY + sigHeight/2, { align: 'center' });
      }

      // ===== COLONNE GAUCHE : INFORMATIONS =====
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('👤 IDENTITÉ', leftX, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(44, 24, 16);

      const contentWidth = pageWidth - 30 - photoWidth - 5; // Largeur dispo à gauche

      const identite = [
        ['Nom', detenteur.nomComplet],
        ['Surnom', detenteur.surnomRituel || '-'],
        ['Âge', detenteur.age ? detenteur.age + ' ans' : '-'],
        ['Sexe', detenteur.sexe === 'M' ? 'Masculin' : detenteur.sexe === 'F' ? 'Féminin' : '-'],
        ['Village', detenteur.village],
        ['Fonction', detenteur.fonctionPalais || '-'],
        ['Téléphone', detenteur.telephone || '-'],
        ['Langue', detenteur.langue || '-']
      ];

      identite.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', leftX, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || '-'), leftX + 22, y);
        y += 4;
      });

      y += 3;

      // ===== PERMISSIONS =====
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('🎭 PERMISSIONS', leftX, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(44, 24, 16);

      const permissions = [
        ['🎤 Interviewé', detenteur.peutParler],
        ['🎵 Chanter', detenteur.peutChanter],
        ['🎥 Filmé', detenteur.peutEtreFilme],
        ['📸 Photographié', detenteur.peutFilmer],
        ['🪘 Prêt instrument', detenteur.preterInstrument],
        ['🏛️ Lieu sacré', detenteur.montrerLieuSacre]
      ];

      permissions.forEach(([label, granted]) => {
        doc.setTextColor(granted ? 72 : 229, granted ? 187 : 62, granted ? 120 : 62);
        doc.text(granted ? '✓' : '✗', leftX, y);
        doc.setTextColor(44, 24, 16);
        doc.text(label, leftX + 4, y);
        y += 4;
      });

      y += 3;

      // ===== CONSENTEMENT =====
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text('✍️ CONSENTEMENT', leftX, y);
      y += 5;

      const consentement = detenteur.consentementSigne || localMedia.signature || detenteur.signature;
      doc.setFontSize(10);
      if (consentement) {
        doc.setTextColor(72, 187, 120);
        doc.setFont(undefined, 'bold');
        doc.text('✓ SIGNÉ', leftX, y);
      } else {
        doc.setTextColor(229, 62, 62);
        doc.setFont(undefined, 'bold');
        doc.text('✗ NON SIGNÉ', leftX, y);
      }
      y += 6;

      // ===== SPÉCIFICITÉS VODUN =====
      if (detenteur.anonymiser || detenteur.nomTraditionnelJamaisEcrit) {
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('🔒 VODUN', leftX, y);
        y += 4;

        doc.setFontSize(8);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        if (detenteur.anonymiser) {
          doc.text('🕶️ Anonymisation demandée', leftX, y);
          y += 4;
        }
        if (detenteur.nomTraditionnelJamaisEcrit) {
          doc.text('🤐 Nom jamais écrit', leftX, y);
          y += 4;
        }
      }

      // ===== GPS =====
      const gps = detenteur.gps || detenteur.coordonneesGPS;
      if (gps) {
        y += 2;
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('📍 LOCALISATION', leftX, y);
        y += 4;

        doc.setFontSize(7);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        doc.text(gps, leftX, y);
        y += 4;
      }

      // ===== NOTES =====
      if (detenteur.notes) {
        y += 2;
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text('📝 NOTES', leftX, y);
        y += 4;

        doc.setFontSize(8);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        const noteLines = doc.splitTextToSize(detenteur.notes, contentWidth);
        noteLines.slice(0, 4).forEach(line => {
          doc.text(line, leftX, y);
          y += 3.5;
        });
        if (noteLines.length > 4) {
          doc.text('...', leftX, y);
        }
      }

      // ===== PIED DE PAGE =====
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont(undefined, 'normal');
      doc.text(
        'HWENDO 2026 - OBG International Bénin - Patrimoine musical du Royaume Hwendo',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      // ===== TÉLÉCHARGEMENT =====
      const fileName = 'HWENDO_' + (detenteur.nomComplet || 'detenteur').replace(/\\s+/g, '_') + '.pdf';
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Erreur lors de la génération: ' + error.message);
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
      📥 Télécharger PDF
    </button>
  );
}

export default PDFGenerator;
`;

fs.writeFileSync(
  path.join(__dirname, 'src/components/PDFGenerator.jsx'),
  newPdfGenerator,
  'utf8'
);

console.log('✅ PDFGenerator optimisé : photo + signature à droite, tout sur 1 page');