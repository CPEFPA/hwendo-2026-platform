const fs = require('fs');

// Réécrire PDFGenerator avec layout compact 1 page
fs.writeFileSync('src/components/PDFGenerator.jsx', `import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { db } from '../db/localDB';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function PDFGenerator({ detenteurId }) {
  const [loading, setLoading] = useState(false);
  const [detenteur, setDetenteur] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => { loadData(); }, [detenteurId]);

  const loadData = async () => {
    try {
      const d = await db.detenteurs.get(detenteurId);
      setDetenteur(d);
      const allFiles = await db.files.where('detenteurId').equals(detenteurId).toArray();
      const photoFiles = allFiles.filter(f => f.type === 'photo' && f.blob);
      const photoBase64 = [];
      for (const f of photoFiles) {
        try {
          const base64 = await blobToBase64(f.blob);
          photoBase64.push(base64);
        } catch (e) { console.error(e); }
      }
      setPhotos(photoBase64);
    } catch (e) { console.error(e); }
  };

  const generatePDF = async () => {
    if (!detenteur) return;
    setLoading(true);

    // Photo et signature dans la colonne droite
    const rightColumn = \`
      <div style="width: 32%; display: flex; flex-direction: column; gap: 10px;">
        \${photos.length > 0 
          ? \`<div style="text-align: center;">
              <img src="\${photos[0]}" style="width: 100%; max-height: 160px; object-fit: cover; border: 2px solid #C65D2C; border-radius: 6px;" />
              <p style="margin: 3px 0; font-size: 8px; color: #6B5D54; text-align: center;">Photo du détenteur</p>
            </div>\`
          : '<div style="height: 100px;"></div>'}
        
        <div style="text-align: center; margin-top: auto;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #8B4513; font-size: 9px;">SIGNATURE :</p>
          \${detenteur.signature 
            ? \`<img src="\${detenteur.signature}" style="max-width: 100%; max-height: 50px;" />\` 
            : '<div style="border-bottom: 1px solid #2C1810; height: 40px;"></div>'}
        </div>
      </div>
    \`;

    const content = document.createElement('div');
    content.innerHTML = \`
      <div style="font-family: 'Georgia', serif; color: #2C1810; background: white; padding: 15px; font-size: 10px; line-height: 1.4;">
        
        <!-- EN-TÊTE COMPACT -->
        <div style="text-align: center; border-bottom: 3px double #DAA520; padding-bottom: 8px; margin-bottom: 12px;">
          <h1 style="color: #2C1810; margin: 0; font-size: 18px; letter-spacing: 2px;">🎵 HWENDO 2026</h1>
          <h2 style="color: #C65D2C; margin: 3px 0; font-size: 13px;">CONSENTEMENT ÉCLAIRÉ</h2>
          <p style="margin: 2px 0; font-style: italic; color: #6B5D54; font-size: 8px;">
            Mission de sauvegarde du patrimoine musical • Palais Royal DADA DA AGBO HOUNON HOUNAN
          </p>
        </div>
        
        <!-- CORPS : 2 COLONNES -->
        <div style="display: flex; gap: 15px; margin-bottom: 12px;">
          
          <!-- COLONNE GAUCHE : Informations -->
          <div style="width: 68%;">
            <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 2px; font-size: 11px; margin: 0 0 6px 0;">
              👤 IDENTITÉ DU SIGNATAIRE
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; width: 32%; font-size: 9px;">Nom complet :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.nomComplet}</td></tr>
              \${detenteur.surnomRituel ? \`<tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Surnom rituel :</td><td style="padding: 2px 4px; font-size: 9px; font-style: italic;">\${detenteur.surnomRituel}</td></tr>\` : ''}
              <tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Âge / Sexe :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.age || '?'} ans • \${detenteur.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
              <tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Village :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.village}</td></tr>
              \${detenteur.fonctionPalais ? \`<tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Fonction :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.fonctionPalais}</td></tr>\` : ''}
              \${detenteur.telephone ? \`<tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Téléphone :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.telephone}</td></tr>\` : ''}
              <tr><td style="padding: 2px 4px; font-weight: bold; color: #8B4513; font-size: 9px;">Langue :</td><td style="padding: 2px 4px; font-size: 9px;">\${detenteur.langue || 'Non renseigné'}</td></tr>
            </table>
            
            <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 2px; font-size: 11px; margin: 0 0 6px 0;">
              🎭 PERMISSIONS ACCORDÉES
            </h3>
            <table style="width: 100%; margin-bottom: 10px; font-size: 9px;">
              <tr>
                <td style="padding: 2px;">\${detenteur.peutParler ? '☑' : '☐'} Être interviewé(e)</td>
                <td style="padding: 2px;">\${detenteur.peutFilmer ? '☑' : '☐'} Être photographié(e)</td>
              </tr>
              <tr>
                <td style="padding: 2px;">\${detenteur.peutChanter ? '☑' : '☐'} Chanter / Jouer</td>
                <td style="padding: 2px;">\${detenteur.preterInstrument ? '☑' : '☐'} Prêter un instrument</td>
              </tr>
              <tr>
                <td style="padding: 2px;">\${detenteur.peutEtreFilme ? '☑' : '☐'} Être filmé(e)</td>
                <td style="padding: 2px;">\${detenteur.montrerLieuSacre ? '☑' : '☐'} Montrer un lieu sacré</td>
              </tr>
            </table>
          </div>
          
          <!-- COLONNE DROITE : Photo + Signature -->
          \${rightColumn}
        </div>
        
        <!-- SPÉCIFICITÉS VODUN -->
        <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 2px; font-size: 11px; margin: 0 0 5px 0;">
          🔒 SPÉCIFICITÉS VODUN
        </h3>
        <div style="display: flex; gap: 20px; margin-bottom: 10px; font-size: 9px;">
          <span>\${detenteur.anonymiser ? '☑' : '☐'} Nom anonymisé dans les publications</span>
          <span>\${detenteur.nomTraditionnelJamaisEcrit ? '☑' : '☐'} Nom traditionnel jamais écrit</span>
        </div>
        
        <!-- DÉCLARATION OBG BÉNIN -->
        <div style="background: #FDF5E6; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #C65D2C; border-radius: 3px;">
          <p style="margin: 0; font-size: 9px; line-height: 1.5;">
            Je soussigné(e) confirme avoir été informé(e) de l'objet de cette mission menée par 
            <strong>Johnson Mario Apanh (OBG Bénin)</strong> et donne mon consentement libre et éclairé 
            pour les permissions cochées ci-dessus.
          </p>
        </div>
        
        <!-- DATE ET SIGNATURES -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
          <div style="font-size: 9px;">
            <p style="margin: 0;"><strong>Fait à \${detenteur.village}, le \${new Date().toLocaleDateString('fr-FR')}</strong></p>
          </div>
          <div style="text-align: right; font-size: 9px;">
            <p style="margin: 0; font-weight: bold; color: #8B4513;">L'ENQUÊTEUR :</p>
            <p style="margin: 20px 0 0 0; font-style: italic;">Johnson Mario Apanh</p>
            <p style="margin: 0; font-size: 8px; color: #6B5D54;">OBG Bénin</p>
          </div>
        </div>
        
        <!-- PIED DE PAGE -->
        <div style="text-align: center; margin-top: 15px; padding-top: 8px; border-top: 2px double #DAA520; font-size: 7px; color: #6B5D54;">
          <p style="margin: 0;">HWENDO 2026 • Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
          <p style="margin: 1px 0;">Johnson Mario Apanh • OBG Bénin</p>
        </div>
      </div>
    \`;
    
    document.body.appendChild(content);
    
    const options = {
      margin: [8, 8, 8, 8],
      filename: 'CONSENTEMENT_' + detenteur.nomComplet.replace(/\\s+/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        windowWidth: 800
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    try {
      await html2pdf().from(content).set(options).save();
    } catch (e) {
      alert('Erreur PDF: ' + e.message);
    }
    document.body.removeChild(content);
    setLoading(false);
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={loading}
      className="btn-action pdf"
    >
      {loading ? '⏳ Génération...' : '📥 Télécharger PDF'}
    </button>
  );
}
`);

console.log('🎉 PDF optimisé : 1 page + photo à droite !');
