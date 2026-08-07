const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// POST : Créer un détenteur
router.post('/', async (req, res) => {
  try {
    const detenteur = await prisma.detenteur.create({ data: req.body });
    res.status(201).json(detenteur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET : Lister tous les détenteurs
router.get('/', async (req, res) => {
  try {
    const detenteurs = await prisma.detenteur.findMany({
      include: { mission: true }
    });
    res.json(detenteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
