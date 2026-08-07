import DetenteurForm from './components/DetenteurForm';
import DetenteurList from './components/DetenteurList';

function App() {
  return (
    <div style={{fontFamily: 'Arial', backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
      <header style={{backgroundColor: '#1a1a2e', color: 'white', padding: '30px', textAlign: 'center'}}>
        <h1>🎵 HWENDO 2026</h1>
        <p>Mission de collecte patrimoniale</p>
      </header>
      <DetenteurForm />
      <DetenteurList />
    </div>
  );
}

export default App;
