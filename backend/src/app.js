const express = require('express');
const cors = require('cors');
const detenteurRoutes = require('./routes/detenteurs');

const app = express();

app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/detenteurs', detenteurRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mission: 'HWENDO_2026' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🎵 Serveur HWENDO 2026 démarré sur http://localhost:' + PORT);
});
