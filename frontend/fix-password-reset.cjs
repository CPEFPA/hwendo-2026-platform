const fs = require('fs');
const path = require('path');

console.log('🔐 Ajout de la protection par mot de passe...\n');

let content = fs.readFileSync(path.join(__dirname, 'src/components/DetenteurList.jsx'), 'utf8');

// Mot de passe de protection
const PASSWORD = '1972Albertine';

// Ajouter l'état pour le mot de passe
const oldStates = `  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetting, setResetting] = useState(false);`;

const newStates = `  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetText, setResetText] = useState('');
  const [resetting, setResetting] = useState(false);
  const PROTECTED_PASSWORD = '${PASSWORD}';`;

if (content.includes(oldStates)) {
  content = content.replace(oldStates, newStates);
  console.log('✅ États password ajoutés');
}

// Modifier le clic sur le bouton Réinitialiser pour afficher d'abord le mot de passe
const oldClick = `onClick={() => setShowReset(true)}`;
const newClick = `onClick={() => { setShowPassword(true); setPassword(''); setPasswordError(''); }}`;

if (content.includes(oldClick)) {
  content = content.replace(oldClick, newClick);
  console.log('✅ Clic sur Réinitialiser modifié');
}

// Ajouter le modal de mot de passe AVANT le modal de confirmation
const modalInsertion = `      {/* Modal MOT DE PASSE */}
      {showPassword && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '30px',
            maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#C65D2C', marginTop: 0 }}>
              ${String.fromCodePoint(0x1F512)} Accès protégé
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
              Cette action est réservée aux administrateurs. Veuillez saisir le mot de passe pour continuer.
            </p>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Mot de passe :
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (password === PROTECTED_PASSWORD) {
                    setShowPassword(false);
                    setShowReset(true);
                  } else {
                    setPasswordError('Mot de passe incorrect');
                  }
                }
              }}
              placeholder="Saisissez le mot de passe"
              autoFocus
              style={{
                width: '100%', padding: '10px', border: '2px solid #C65D2C',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {passwordError && (
              <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                ${String.fromCodePoint(0x274C)} {passwordError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setShowPassword(false); setPassword(''); setPasswordError(''); }}
                style={{
                  flex: 1, padding: '12px', background: '#f0f0f0', color: '#333',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (password === PROTECTED_PASSWORD) {
                    setShowPassword(false);
                    setShowReset(true);
                  } else {
                    setPasswordError('Mot de passe incorrect');
                  }
                }}
                style={{
                  flex: 1, padding: '12px',
                  background: password ? '#C65D2C' : '#ccc',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: password ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}`;

// Insérer le modal password juste avant le modal de confirmation existant
const resetModalMarker = `      {/* Modal de confirmation */}
      {showReset && (`;

if (content.includes(resetModalMarker)) {
  content = content.replace(resetModalMarker, modalInsertion + '\n      {showReset && (');
  console.log('✅ Modal mot de passe ajouté');
} else {
  console.log('⚠️  Marqueur du modal non trouvé');
}

fs.writeFileSync(
  path.join(__dirname, 'src/components/DetenteurList.jsx'),
  content,
  'utf8'
);

console.log('\n🎉 Protection par mot de passe ajoutée !');
console.log('   🔐 Mot de passe : ' + PASSWORD);
console.log('   📋 Processus :');
console.log('      1. Clic sur "Réinitialiser"');
console.log('      2. Saisie du mot de passe');
console.log('      3. Validation → affichage de la fenêtre SUPPRIMER');
console.log('      4. Taper SUPPRIMER pour confirmer');