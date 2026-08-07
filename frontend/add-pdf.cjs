const fs = require('fs');

// 1. Créer le composant PDFGenerator
fs.writeFileSync('src/components/PDFGenerator.jsx', `import html2pdf from 'html2pdf.js';

export default function PDFGenerator({ detenteur, signature, photo }) {
  const generatePDF = async () => {
    // Créer le contenu HTML du PDF
    const content = document.createElement('div');
    content.innerHTML = \`
      <div style="font-family: Arial; padding: 20px; color: #333;">
        <div style="text-align: center; border-bottom: 3px solid #1a1a2e; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #1a1a2e; margin: 0;">🎵 HWENDO 2026</h1>
          <h2 style="color: #e94560; margin: 5px 0;">CONSENTEMENT ÉCLAIRÉ</h2>
          <p style="margin: 5px 0; font-style: italic;">Mission de sauvegarde du patrimoine musical</p>
        </div>
        
        \${photo ? \`
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="\${photo}" style="max-width: 180px; max-height: 180px; border: 2px solid #1a1a2e; border-radius: 8px;" />
          </div>
        \` : ''}
        
        <h3 style="color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">IDENTITÉ DU SIGNATAIRE</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr><td style="padding: 4px; font-weight: bold;">Nom complet :</td><td style="padding: 4px;">\${detenteur.nomComplet}</td></tr>
          \${detenteur.surnomRituel ? \`<tr><td style="padding: 4px; font-weight: bold;">Surnom rituel :</td><td style="padding: 4px;">\${detenteur.surnomRituel}</td></tr>\` : ''}
          <tr><td style="padding: 4px; font-weight: bold;">Âge :</td><td style="padding: 4px;">\${detenteur.age || 'Non renseigné'}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Sexe :</td><td style="padding: 4px;">\${detenteur.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Village :</td><td style="padding: 4px;">\${detenteur.village}</td></tr>
          \${detenteur.fonctionPalais ? \`<tr><td style="padding: 4px; font-weight: bold;">Fonction :</td><td style="padding: 4px;">\${detenteur.fonctionPalais}</td></tr>\` : ''}
          \${detenteur.telephone ? \`<tr><td style="padding: 4px; font-weight: bold;">Téléphone :</td><td style="padding: 4px;">\${detenteur.telephone}</td></tr>\` : ''}
          <tr><td style="padding: 4px; font-weight: bold;">Langue :</td><td style="padding: 4px;">\${detenteur.langue || 'Non renseigné'}</td></tr>
        </table>
        
        <h3 style="color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">PERMISSIONS ACCORDÉES</h3>
        <table style="width: 100%; margin-bottom: 15px;">
          <tr><td style="padding: 3px;">\${detenteur.peutParler ? '☑' : '☐'} Être interviewé(e)</td><td style="padding: 3px;">\${detenteur.peutFilmer ? '☑' : '☐'} Être photographié(e)</td></tr>
          <tr><td style="padding: 3px;">\${detenteur.peutChanter ? '☑' : '☐'} Chanter / Jouer (audio)</td><td style="padding: 3px;">\${detenteur.preterInstrument ? '☑' : '☐'} Prêter un instrument</td></tr>
          <tr><td style="padding: 3px;">\${detenteur.peutEtreFilme ? '☑' : '☐'} Être filmé(e)</td><td style="padding: 3px;">\${detenteur.montrerLieuSacre ? '☑' : '☐'} Montrer un lieu sacré</td></tr>
        </table>
        
        <h3 style="color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">SPÉCIFICITÉS VODUN</h3>
        <p style="margin: 5px 0;">\${detenteur.anonymiser ? '☑' : '☐'} Le nom sera anonymisé</p>
        <p style="margin: 5px 0;">\${detenteur.nomTraditionnelJamaisEcrit ? '☑' : '☐'} Le nom traditionnel ne sera jamais écrit</p>
        
        <div style="background: #f0f4f8; padding: 10px; margin: 15px 0; border-left: 4px solid #e94560;">
          <p style="margin: 0; font-size: 12px;">Je soussigné(e) confirme avoir été informé(e) de l'objet de cette mission menée par Johnson Mario Apanh (CRES' POLY ART SARL / HCAC) et donne mon consentement libre et éclairé pour les permissions cochées ci-dessus.</p>
        </div>
        
        <p style="margin-top: 20px;"><strong>Fait à \${detenteur.village}, le \${new Date().toLocaleDateString('fr-FR')}</strong></p>
        
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>SIGNATURE DU DÉTENTEUR :</strong></p>
            \${signature ? \`<img src="\${signature}" style="max-width: 200px; max-height: 80px; margin-top: 10px;" />\` : '<div style="border-bottom: 1px solid #333; width: 200px; margin-top: 40px;"></div>'}
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 0;"><strong>L'ENQUÊTEUR :</strong></p>
            <p style="margin: 40px 0 0 0; font-style: italic; font-size: 12px;">Johnson Mario Apanh</p>
            <p style="margin: 0; font-size: 10px;">DG CRES' POLY ART SARL</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
          <p style="margin: 0;">HWENDO 2026 — Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
          <p style="margin: 2px 0;">Palais Royal DADA DA AGBO HOUNON HOUNAN</p>
        </div>
      </div>
    \`;
    
    document.body.appendChild(content);
    
    const options = {
      margin: 10,
      filename: 'CONSENTEMENT_' + detenteur.nomComplet.replace(/\\s+/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().from(content).set(options).save();
    document.body.removeChild(content);
  };

  return (
    <button 
      onClick={generatePDF}
      style={{
        display: 'inline-block',
        padding: '5px 10px',
        background: '#e94560',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      📥 Télécharger PDF
    </button>
  );
}
`);

// 2. Mettre à jour DetenteurList pour inclure le bouton PDF
const listContent = fs.readFileSync('src/components/DetenteurList.jsx', 'utf8');

// Ajouter l'import
let newListContent = listContent.replace(
  "import MediaDisplay from './MediaDisplay';",
  "import MediaDisplay from './MediaDisplay';\nimport PDFGenerator from './PDFGenerator';"
);

// Ajouter le bouton PDF à côté du lien docUrl
newListContent = newListContent.replace(
  /{d\.docUrl && \([\s\S]*?<\/a>\s*\)}/,
  `{d.docUrl && (
              <a href={d.docUrl} target="_blank" rel="noopener noreferrer" 
                style={{display:'inline-block', padding:'5px 10px', background:'#4299e1', color:'white', textDecoration:'none', borderRadius:'4px', fontSize:'12px'}}>
                📄 Voir Google Docs
              </a>
            )}
            <PDFGenerator detenteur={d} signature={d.signature} photo={d.photo} />`
);

fs.writeFileSync('src/components/DetenteurList.jsx', newListContent);

console.log('🎉 Bouton Télécharger PDF ajouté !');
