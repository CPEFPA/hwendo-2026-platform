const fs = require('fs');
const path = require('path');

const newPdfGenerator = `import { jsPDF } from 'jspdf';

function PDFGenerator({ detenteur }) {
  const generatePDF = () => {
    if (!detenteur) {
      alert('Aucune donnée disponible');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Fonction utilitaire pour ajouter du texte avec retour à la ligne
      const addWrappedText = (text, x, yPos, maxWidth, lineHeight) => {
        const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
        lines.forEach(line => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, x, yPos);
          yPos += lineHeight;
        });
        return yPos;
      };

      // ===== EN-TÊTE =====
      doc.setFillColor(198, 93, 44); // Ocre
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('HWENDO 2026', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text('Mission de sauvegarde du patrimoine musical', pageWidth / 2, 22, { align: 'center' });
      doc.text('Royaume Hwendo - Palais Royal DADA DA AGBO HOUNON HOUNAN', pageWidth / 2, 28, { align: 'center' });

      // Reset couleur
      doc.setTextColor(44, 24, 16);
      y = 50;

      // ===== TITRE =====
      doc.setFontSize(16);
      doc.setTextColor(139, 69, 19);
      doc.text('FICHE DETENTEUR DE SAVOIRS TRADITIONNELS', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // ===== RÉFÉRENCE =====
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Référence: ' + (detenteur.reference || detenteur.id || 'N/A'), 15, y);
      doc.text('Date: ' + new Date(detenteur.createdAt || Date.now()).toLocaleDateString('fr-FR'), pageWidth - 15, y, { align: 'right' });
      y += 10;

      // Ligne de séparation
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;

      // ===== IDENTITÉ =====
      doc.setFontSize(13);
      doc.setTextColor(198, 93, 44);
      doc.text('IDENTITÉ', 15, y);
      y += 6;

      doc.setFontSize(11);
      doc.setTextColor(44, 24, 16);

      const identite = [
        ['Nom complet', detenteur.nomComplet],
        ['Surnom rituel', detenteur.surnomRituel || 'Non spécifié'],
        ['Âge', detenteur.age ? detenteur.age + ' ans' : 'Non spécifié'],
        ['Sexe', detenteur.sexe === 'M' ? 'Masculin' : detenteur.sexe === 'F' ? 'Féminin' : detenteur.sexe || 'N/A'],
        ['Village d\\'origine', detenteur.village],
        ['Fonction au palais', detenteur.fonctionPalais || 'Non spécifiée'],
        ['Téléphone', detenteur.telephone || 'Non spécifié'],
        ['Langue', detenteur.langue || 'Non spécifiée']
      ];

      identite.forEach(([label, value]) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.text(label + ' :', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(value || 'N/A'), 80, y);
        y += 7;
      });

      y += 5;

      // ===== CONSENTEMENT =====
      doc.setFontSize(13);
      doc.setTextColor(198, 93, 44);
      doc.text('CONSENTEMENT', 15, y);
      y += 6;

      doc.setFontSize(11);
      doc.setTextColor(44, 24, 16);
      doc.setFont(undefined, 'bold');
      doc.text('Statut :', 20, y);
      doc.setFont(undefined, 'normal');
      
      const consentement = detenteur.consentementSigne || detenteur.signature;
      doc.text(consentement ? 'SIGNÉ' : 'NON SIGNÉ', 80, y);
      
      if (consentement) {
        doc.setTextColor(72, 187, 120);
        doc.text('✓', 75, y);
      } else {
        doc.setTextColor(229, 62, 62);
        doc.text('✗', 75, y);
      }
      doc.setTextColor(44, 24, 16);
      y += 10;

      // ===== PERMISSIONS =====
      doc.setFontSize(13);
      doc.setTextColor(198, 93, 44);
      doc.text('PERMISSIONS ACCORDÉES', 15, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(44, 24, 16);

      const permissions = [
        ['Être interviewé(e)', detenteur.peutParler],
        ['Chanter / Jouer', detenteur.peutChanter],
        ['Être filmé(e)', detenteur.peutEtreFilme],
        ['Être photographié(e)', detenteur.peutFilmer],
        ['Prêter un instrument', detenteur.preterInstrument],
        ['Montrer un lieu sacré', detenteur.montrerLieuSacre]
      ];

      permissions.forEach(([label, granted]) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const icon = granted ? '✓' : '✗';
        doc.setTextColor(granted ? 72 : 229, granted ? 187 : 62, granted ? 120 : 62);
        doc.text(icon, 20, y);
        doc.setTextColor(44, 24, 16);
        doc.text(label, 28, y);
        y += 6;
      });

      y += 5;

      // ===== SPÉCIFICITÉS VODUN =====
      if (detenteur.anonymiser || detenteur.nomTraditionnelJamaisEcrit) {
        doc.setFontSize(13);
        doc.setTextColor(198, 93, 44);
        doc.text('SPÉCIFICITÉS VODUN', 15, y);
        y += 6;

        doc.setFontSize(10);
        doc.setTextColor(44, 24, 16);

        if (detenteur.anonymiser) {
          doc.text('🕶️ Anonymisation du nom demandée', 20, y);
          y += 6;
        }
        if (detenteur.nomTraditionnelJamaisEcrit) {
          doc.text('🤐 Nom traditionnel ne doit jamais être écrit', 20, y);
          y += 6;
        }
        y += 3;
      }

      // ===== LOCALISATION =====
      if (detenteur.gps || detenteur.coordonneesGPS) {
        doc.setFontSize(13);
        doc.setTextColor(198, 93, 44);
        doc.text('LOCALISATION GPS', 15, y);
        y += 6;

        doc.setFontSize(10);
        doc.setTextColor(44, 24, 16);
        doc.text('Coordonnées: ' + (detenteur.gps || detenteur.coordonneesGPS), 20, y);
        y += 10;
      }

      // ===== NOTES =====
      if (detenteur.notes) {
        doc.setFontSize(13);
        doc.setTextColor(198, 93, 44);
        doc.text('NOTES TERRAIN', 15, y);
        y += 6;

        doc.setFontSize(10);
        doc.setTextColor(44, 24, 16);
        y = addWrappedText(detenteur.notes, 20, y, pageWidth - 40, 5);
        y += 5;
      }

      // ===== SIGNATURE =====
      if (detenteur.signature && detenteur.signature.startsWith('data:image')) {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(13);
        doc.setTextColor(198, 93, 44);
        doc.text('SIGNATURE MANUSCRITE', 15, y);
        y += 5;

        try {
          doc.addImage(detenteur.signature, 'PNG', 20, y, 120, 50);
          y += 60;
        } catch (e) {
          console.warn('Erreur signature:', e);
        }
      }

      // ===== PIED DE PAGE =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          'HWENDO 2026 - OBG International Bénin - Page ' + i + '/' + pageCount,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // ===== TÉLÉCHARGEMENT =====
      const fileName = 'HWENDO_' + (detenteur.nomComplet || 'detenteur').replace(/\\s+/g, '_') + '.pdf';
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Erreur lors de la génération du PDF: ' + error.message);
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

console.log('✅ PDFGenerator.jsx corrigé (sans db.get)');