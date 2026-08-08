import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { db } from '../db/localDB';

function transliterate(text) {
  if (!text) return '';
  return String(text)
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/ë/g, 'e')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ô/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/û/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/î/g, 'i')
    .replace(/ï/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/É/g, 'E')
    .replace(/È/g, 'E')
    .replace(/À/g, 'A')
    .replace(/Ô/g, 'O')
    .replace(/Ù/g, 'U')
    .replace(/Û/g, 'U')
    .replace(/Ç/g, 'C')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE');
}

function PDFGenerator({ detenteur }) {
  const [localMedia, setLocalMedia] = useState({ photo: null, signature: null });

  useEffect(() => {
    loadLocalMedia();
  }, [detenteur]);

  const loadLocalMedia = async () => {
    try {
      const localDet = await db.detenteurs.where('nomComplet').equals(detenteur.nomComplet).first();
      
      if (localDet) {
        const signature = localDet.signature || null;
        let photo = null;
        if (localDet.photos && localDet.photos.length > 0) {
          photo = localDet.photos[0].data;
        } else {
          const files = await db.files.where('detenteurId').equals(localDet.id).toArray();
          const photoFile = files.find(f => f.type === 'photo');
          if (photoFile) photo = photoFile.data;
        }
        setLocalMedia({ photo, signature });
      }
    } catch (e) {
      console.warn('Erreur chargement medias locaux:', e);
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

      // EN-TÊTE COMPACT
      doc.setFillColor(198, 93, 44);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(transliterate('🎵 HWENDO 2026'), 15, 12);
      
      doc.setFontSize(9);
      doc.text(transliterate('Mission patrimoine musical - Royaume Hwendo'), 15, 18);
      doc.text(transliterate('Date: ' + new Date(detenteur.createdAt || Date.now()).toLocaleDateString('fr-FR')), pageWidth - 15, 12, { align: 'right' });

      doc.setTextColor(44, 24, 16);
      let y = 35;

      // TITRE
      doc.setFontSize(13);
      doc.setTextColor(139, 69, 19);
      doc.text(transliterate('FICHE DÉTENTEUR DE SAVOIRS'), pageWidth / 2, y, { align: 'center' });
      y += 3;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Ref: ' + (detenteur.reference || detenteur.id || '').substring(0, 20), pageWidth / 2, y, { align: 'center' });
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
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('📷', rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
        }
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(transliterate('Photo'), rightX - photoWidth/2, rightY + photoHeight/2, { align: 'center' });
        doc.text(transliterate('non disponible'), rightX - photoWidth/2, rightY + photoHeight/2 + 4, { align: 'center' });
      }

      rightY += photoHeight + 3;
      
      doc.setFontSize(8);
      doc.setTextColor(139, 69, 19);
      doc.text(transliterate('Signature manuscrite'), rightX - photoWidth/2, rightY, { align: 'center' });
      rightY += 2;

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
        doc.text(transliterate('Non signée'), rightX - sigWidth/2, rightY + sigHeight/2, { align: 'center' });
      }

      // COLONNE GAUCHE : INFORMATIONS
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text(transliterate('👤 IDENTITÉ'), leftX, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(44, 24, 16);

      const identite = [
        [transliterate('Nom'), transliterate(detenteur.nomComplet)],
        [transliterate('Surnom'), transliterate(detenteur.surnomRituel) || '-'],
        [transliterate('Âge'), detenteur.age ? detenteur.age + transliterate(' ans') : '-'],
        [transliterate('Sexe'), detenteur.sexe === 'M' ? transliterate('Masculin') : detenteur.sexe === 'F' ? transliterate('Féminin') : '-'],
        [transliterate('Village'), transliterate(detenteur.village)],
        [transliterate('Fonction'), transliterate(detenteur.fonctionPalais) || '-'],
        [transliterate('Téléphone'), transliterate(detenteur.telephone) || '-'],
        [transliterate('Langue'), transliterate(detenteur.langue) || '-']
      ];

      identite.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', leftX, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || '-'), leftX + 22, y);
        y += 4;
      });

      y += 3;

      // PERMISSIONS
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text(transliterate('🎭 PERMISSIONS'), leftX, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(44, 24, 16);

      const permissions = [
        [transliterate('🎤 Interviewé'), detenteur.peutParler],
        [transliterate('🎵 Chanter'), detenteur.peutChanter],
        [transliterate('🎥 Filmé'), detenteur.peutEtreFilme],
        [transliterate('📸 Photographié'), detenteur.peutFilmer],
        [transliterate('🪘 Prêt instrument'), detenteur.preterInstrument],
        [transliterate('🏛️ Lieu sacré'), detenteur.montrerLieuSacre]
      ];

      permissions.forEach(([label, granted]) => {
        doc.setTextColor(granted ? 72 : 229, granted ? 187 : 62, granted ? 120 : 62);
        doc.text(granted ? '✓' : '✗', leftX, y);
        doc.setTextColor(44, 24, 16);
        doc.text(label, leftX + 4, y);
        y += 4;
      });

      y += 3;

      // CONSENTEMENT
      doc.setFontSize(10);
      doc.setTextColor(198, 93, 44);
      doc.setFont(undefined, 'bold');
      doc.text(transliterate('✍️ CONSENTEMENT'), leftX, y);
      y += 5;

      const consentement = detenteur.consentementSigne || localMedia.signature || detenteur.signature;
      doc.setFontSize(10);
      if (consentement) {
        doc.setTextColor(72, 187, 120);
        doc.setFont(undefined, 'bold');
        doc.text('✓ ' + transliterate('SIGNÉ'), leftX, y);
      } else {
        doc.setTextColor(229, 62, 62);
        doc.setFont(undefined, 'bold');
        doc.text('✗ ' + transliterate('NON SIGNÉ'), leftX, y);
      }
      y += 6;

      // SPÉCIFICITÉS VODUN
      if (detenteur.anonymiser || detenteur.nomTraditionnelJamaisEcrit) {
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text(transliterate('🔒 VODUN'), leftX, y);
        y += 4;

        doc.setFontSize(8);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        if (detenteur.anonymiser) {
          doc.text(transliterate('🕶️ Anonymisation demandée'), leftX, y);
          y += 4;
        }
        if (detenteur.nomTraditionnelJamaisEcrit) {
          doc.text(transliterate('🤐 Nom jamais écrit'), leftX, y);
          y += 4;
        }
      }

      // GPS
      const gps = detenteur.gps || detenteur.coordonneesGPS;
      if (gps) {
        y += 2;
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text(transliterate('📍 LOCALISATION'), leftX, y);
        y += 4;

        doc.setFontSize(7);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        doc.text(gps, leftX, y);
        y += 4;
      }

      // NOTES
      if (detenteur.notes) {
        y += 2;
        doc.setFontSize(10);
        doc.setTextColor(198, 93, 44);
        doc.setFont(undefined, 'bold');
        doc.text(transliterate('📝 NOTES'), leftX, y);
        y += 4;

        doc.setFontSize(8);
        doc.setTextColor(44, 24, 16);
        doc.setFont(undefined, 'normal');
        const noteLines = doc.splitTextToSize(transliterate(detenteur.notes), 100);
        noteLines.slice(0, 4).forEach(line => {
          doc.text(line, leftX, y);
          y += 3.5;
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
        transliterate('HWENDO 2026 - OBG International Bénin - Patrimoine musical du Royaume Hwendo'),
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      // TÉLÉCHARGEMENT
      const fileName = 'HWENDO_' + transliterate(detenteur.nomComplet || 'detenteur').replace(/\s+/g, '_') + '.pdf';
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
      📥 Télécharger PDF
    </button>
  );
}

export default PDFGenerator;
