const fs = require('fs');

// 1. Corriger le PDFGenerator (photo carrée + pleine largeur + copyright)
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

    const content = document.createElement('div');
    content.innerHTML = \`
      <div style="font-family: 'Georgia', serif; color: #2C1810; background: white; padding: 20px; font-size: 10px; line-height: 1.4; width: 100%;">
        
        <!-- EN-TÊTE -->
        <div style="text-align: center; border-bottom: 3px double #DAA520; padding-bottom: 10px; margin-bottom: 15px;">
          <h1 style="color: #2C1810; margin: 0; font-size: 20px; letter-spacing: 3px;">🎵 HWENDO 2026</h1>
          <h2 style="color: #C65D2C; margin: 4px 0; font-size: 14px;">CONSENTEMENT ÉCLAIRÉ</h2>
          <p style="margin: 2px 0; font-style: italic; color: #6B5D54; font-size: 9px;">
            Mission de sauvegarde du patrimoine musical • Palais Royal DADA DA AGBO HOUNON HOUNAN
          </p>
        </div>
        
        <!-- CORPS : 2 COLONNES PLEINE LARGEUR -->
        <div style="display: flex; gap: 20px; margin-bottom: 15px; width: 100%;">
          
          <!-- COLONNE GAUCHE : Informations (65%) -->
          <div style="flex: 1; min-width: 0;">
            <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px; font-size: 12px; margin: 0 0 8px 0;">
              👤 IDENTITÉ DU SIGNATAIRE
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
              <tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; width: 30%; font-size: 10px;">Nom complet :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.nomComplet}</td></tr>
              \${detenteur.surnomRituel ? \`<tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Surnom rituel :</td><td style="padding: 3px 5px; font-size: 10px; font-style: italic;">\${detenteur.surnomRituel}</td></tr>\` : ''}
              <tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Âge / Sexe :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.age || '?'} ans • \${detenteur.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
              <tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Village :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.village}</td></tr>
              \${detenteur.fonctionPalais ? \`<tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Fonction :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.fonctionPalais}</td></tr>\` : ''}
              \${detenteur.telephone ? \`<tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Téléphone :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.telephone}</td></tr>\` : ''}
              <tr><td style="padding: 3px 5px; font-weight: bold; color: #8B4513; font-size: 10px;">Langue :</td><td style="padding: 3px 5px; font-size: 10px;">\${detenteur.langue || 'Non renseigné'}</td></tr>
            </table>
            
            <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px; font-size: 12px; margin: 0 0 8px 0;">
              🎭 PERMISSIONS ACCORDÉES
            </h3>
            <table style="width: 100%; margin-bottom: 12px; font-size: 10px;">
              <tr>
                <td style="padding: 3px;">\${detenteur.peutParler ? '☑' : '☐'} Être interviewé(e)</td>
                <td style="padding: 3px;">\${detenteur.peutFilmer ? '☑' : '☐'} Être photographié(e)</td>
              </tr>
              <tr>
                <td style="padding: 3px;">\${detenteur.peutChanter ? '☑' : '☐'} Chanter / Jouer</td>
                <td style="padding: 3px;">\${detenteur.preterInstrument ? '☑' : '☐'} Prêter un instrument</td>
              </tr>
              <tr>
                <td style="padding: 3px;">\${detenteur.peutEtreFilme ? '☑' : '☐'} Être filmé(e)</td>
                <td style="padding: 3px;">\${detenteur.montrerLieuSacre ? '☑' : '☐'} Montrer un lieu sacré</td>
              </tr>
            </table>
            
            <h3 style="color: #C65D2C; border-bottom: 1px solid #DAA520; padding-bottom: 3px; font-size: 12px; margin: 0 0 8px 0;">
              🔒 SPÉCIFICITÉS VODUN
            </h3>
            <div style="font-size: 10px; margin-bottom: 12px;">
              <p style="margin: 3px 0;">\${detenteur.anonymiser ? '☑' : '☐'} Nom anonymisé dans les publications</p>
              <p style="margin: 3px 0;">\${detenteur.nomTraditionnelJamaisEcrit ? '☑' : '☐'} Nom traditionnel jamais écrit</p>
            </div>
          </div>
          
          <!-- COLONNE DROITE : Photo + Signature (35%) -->
          <div style="width: 35%; display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <!-- PHOTO CARRÉE NON DÉFORMÉE -->
            <div style="width: 160px; height: 160px; overflow: hidden; border: 3px solid #C65D2C; border-radius: 8px; background: #FDF5E6;">
              \${photos.length > 0 
                ? \`<img src="\${photos[0]}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />\`
                : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #6B5D54; font-size: 11px;">📷<br/>Photo non disponible</div>'}
            </div>
            <p style="margin: 0; font-size: 8px; color: #6B5D54; text-align: center; font-style: italic;">Photo du détenteur</p>
            
            <!-- SIGNATURE -->
            <div style="width: 100%; text-align: center; margin-top: auto;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #8B4513; font-size: 10px;">✍️ SIGNATURE :</p>
              \${detenteur.signature 
                ? \`<img src="\${detenteur.signature}" style="max-width: 100%; max-height: 60px; display: inline-block;" />\` 
                : '<div style="border-bottom: 1px solid #2C1810; height: 50px;"></div>'}
            </div>
          </div>
        </div>
        
        <!-- DÉCLARATION OBG INTERNATIONAL BÉNIN -->
        <div style="background: #FDF5E6; padding: 10px 15px; margin-bottom: 15px; border-left: 4px solid #C65D2C; border-radius: 4px;">
          <p style="margin: 0; font-size: 10px; line-height: 1.6;">
            Je soussigné(e) confirme avoir été informé(e) de l'objet de cette mission menée par 
            <strong>Johnson Mario Apanh (OBG International Bénin)</strong> et donne mon consentement libre et éclairé 
            pour les permissions cochées ci-dessus.
          </p>
        </div>
        
        <!-- DATE ET SIGNATURES -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; margin-bottom: 15px;">
          <div style="font-size: 10px;">
            <p style="margin: 0;"><strong>Fait à \${detenteur.village}, le \${new Date().toLocaleDateString('fr-FR')}</strong></p>
          </div>
          <div style="text-align: right; font-size: 10px;">
            <p style="margin: 0; font-weight: bold; color: #8B4513;">L'ENQUÊTEUR :</p>
            <p style="margin: 25px 0 0 0; font-style: italic;">Johnson Mario Apanh</p>
            <p style="margin: 0; font-size: 9px; color: #6B5D54;">OBG International Bénin</p>
          </div>
        </div>
        
        <!-- COPYRIGHT -->
        <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px double #DAA520; font-size: 8px; color: #6B5D54;">
          <p style="margin: 0; font-weight: bold;">Tout droit réservé OBG International Bénin</p>
          <p style="margin: 2px 0 0 0;">HWENDO 2026 • Mission de sauvegarde du patrimoine musical du royaume Hwendo</p>
        </div>
      </div>
    \`;
    
    document.body.appendChild(content);
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: 'CONSENTEMENT_' + detenteur.nomComplet.replace(/\\s+/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        windowWidth: 900
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

// 2. Créer la page Politique de confidentialité
fs.writeFileSync('src/components/PolitiqueConfidentialite.jsx', `export default function PolitiqueConfidentialite() {
  return (
    <div style={{maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139,69,19,0.1)'}}>
      <div style={{textAlign: 'center', borderBottom: '3px double #DAA520', paddingBottom: '20px', marginBottom: '30px'}}>
        <h1 style={{color: '#2C1810', margin: 0, fontSize: '26px', letterSpacing: '2px'}}>🎵 HWENDO 2026</h1>
        <h2 style={{color: '#C65D2C', margin: '8px 0', fontSize: '20px'}}>POLITIQUE DE CONFIDENTIALITÉ</h2>
        <p style={{color: '#6B5D54', fontSize: '13px', fontStyle: 'italic'}}>
          Mission de sauvegarde du patrimoine musical du royaume Hwendo
        </p>
      </div>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>1. Responsable de traitement</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          La présente politique s'applique à la mission HWENDO 2026 menée par <strong>Johnson Mario Apanh</strong>, 
          agissant pour le compte d'<strong>OBG International Bénin</strong>.
        </p>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>2. Données collectées</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>Dans le cadre de la mission, nous collectons :</p>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li>Identité : nom, surnom rituel, âge, sexe, village, fonction au palais</li>
          <li>Contact : numéro de téléphone, langue parlée</li>
          <li>Image : photographies, enregistrements vidéo</li>
          <li>Voix : enregistrements audio de chants et paroles</li>
          <li>Signature manuscrite du consentement</li>
          <li>Localisation GPS des lieux de collecte</li>
        </ul>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>3. Finalités de la collecte</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Les données sont collectées exclusivement pour :
        </p>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li>La sauvegarde du patrimoine musical du royaume Hwendo</li>
          <li>La recherche scientifique et la documentation culturelle</li>
          <li>La constitution d'archives pour les générations futures</li>
          <li>La valorisation culturelle autorisée par les détenteurs</li>
        </ul>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>4. Base légale : le consentement</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Toute collecte repose sur le <strong>consentement libre et éclairé</strong> du détenteur, matérialisé par 
          la signature d'un document de consentement. Le détenteur peut retirer son consentement à tout moment 
          sans justification.
        </p>
      </section>

      <section style={{marginBottom: '25px', background: '#FDF5E6', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #C65D2C'}}>
        <h3 style={{color: '#C65D2C', fontSize: '16px', marginTop: 0}}>5. Spécificités culturelles et cultuelles</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Une attention particulière est portée aux savoirs traditionnels et cultuels :
        </p>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li>Les <strong>noms traditionnels</strong> ne sont jamais écrits sans autorisation explicite</li>
          <li>Les <strong>chants sacrés</strong> ne sont diffusés qu'avec l'accord du représentant du roi</li>
          <li>Les <strong>lieux et objets sacrés</strong> ne sont filmés qu'avec permission expresse</li>
          <li>En cas d'apparition d'un esprit lors d'une cérémonie, la capture est immédiatement interrompue</li>
        </ul>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>6. Destinataires des données</h3>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li>OBG International Bénin (responsable de la mission)</li>
          <li>Les archives du Palais Royal DADA DA AGBO HOUNON HOUNAN</li>
          <li>Les institutions culturelles dûment autorisées</li>
        </ul>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Aucune donnée n'est vendue ni transmise à des tiers commerciaux.
        </p>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>7. Durée de conservation</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Les données sont conservées <strong>de manière illimitée</strong> dans le cadre de la mission patrimoniale, 
          sauf demande expresse de retrait du détenteur ou de ses ayants droit.
        </p>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>8. Droits des détenteurs</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>Conformément à la réglementation, chaque détenteur dispose des droits suivants :</p>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li><strong>Droit d'accès</strong> : consulter les données collectées</li>
          <li><strong>Droit de rectification</strong> : corriger des informations inexactes</li>
          <li><strong>Droit à l'anonymisation</strong> : masquer son identité dans les publications</li>
          <li><strong>Droit de retrait</strong> : retirer son consentement à tout moment</li>
        </ul>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>9. Sécurité des données</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Les données sont stockées de manière sécurisée via :
        </p>
        <ul style={{lineHeight: '1.8', color: '#2C1810', marginLeft: '20px'}}>
          <li>Une base de données locale chiffrée sur l'appareil de collecte</li>
          <li>Un stockage cloud sécurisé (Google Drive avec authentification)</li>
          <li>Un accès restreint aux membres autorisés de la mission</li>
        </ul>
      </section>

      <section style={{marginBottom: '25px'}}>
        <h3 style={{color: '#C65D2C', borderBottom: '1px solid #DAA520', paddingBottom: '5px', fontSize: '16px'}}>10. Contact</h3>
        <p style={{lineHeight: '1.7', color: '#2C1810'}}>
          Pour exercer vos droits ou poser une question :
        </p>
        <p style={{lineHeight: '1.8', color: '#2C1810', background: '#FDF5E6', padding: '12px', borderRadius: '6px'}}>
          <strong>OBG International Bénin</strong><br/>
          Responsable : Johnson Mario Apanh<br/>
          Mission HWENDO 2026
        </p>
      </section>

      <div style={{textAlign: 'center', marginTop: '30px', paddingTop: '15px', borderTop: '2px double #DAA520', fontSize: '11px', color: '#6B5D54'}}>
        <p style={{margin: 0, fontWeight: 'bold'}}>Tout droit réservé OBG International Bénin</p>
        <p style={{margin: '3px 0 0 0'}}>Dernière mise à jour : Août 2026</p>
      </div>
    </div>
  );
}
`);

// 3. Mettre à jour App.jsx pour ajouter la page politique
const appContent = fs.readFileSync('src/App.jsx', 'utf8');
let newAppContent = appContent.replace(
  "import DetenteurList from './components/DetenteurList';",
  "import DetenteurList from './components/DetenteurList';\nimport PolitiqueConfidentialite from './components/PolitiqueConfidentialite';"
);

// Ajouter le bouton dans le menu
newAppContent = newAppContent.replace(
  `<li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button disabled style={{opacity: 0.6, cursor: 'default'}}>
              <span className="icon">⚙️</span> Paramètres
            </button>
          </li>`,
  `<li style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <button className={view === 'politique' ? 'active' : ''} onClick={() => setView('politique')}>
              <span className="icon">🔒</span> Confidentialité
            </button>
          </li>`
);

// Ajouter le rendu conditionnel
newAppContent = newAppContent.replace(
  `{view === 'list' && (
          <>
            <div className="page-header">
              <h2>👥 Détenteurs enregistrés</h2>
              <p>Liste complète des personnes ayant participé à la mission</p>
            </div>
            <DetenteurList />
          </>
        )}`,
  `{view === 'list' && (
          <>
            <div className="page-header">
              <h2>👥 Détenteurs enregistrés</h2>
              <p>Liste complète des personnes ayant participé à la mission</p>
            </div>
            <DetenteurList />
          </>
        )}
        {view === 'politique' && (
          <>
            <div className="page-header">
              <h2>🔒 Politique de confidentialité</h2>
              <p>Engagement de protection des données et des savoirs traditionnels</p>
            </div>
            <PolitiqueConfidentialite />
          </>
        )}`
);

fs.writeFileSync('src/App.jsx', newAppContent);

console.log('🎉 PDF corrigé + Politique de confidentialité ajoutée !');
