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

// GET : Obtenir un détenteur par ID
router.get('/:id', async (req, res) => {
  try {
    const detenteur = await prisma.detenteur.findUnique({
      where: { id: req.params.id },
      include: { mission: true }
    });
    if (!detenteur) {
      return res.status(404).json({ error: 'Détenteur non trouvé' });
    }
    res.json(detenteur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE : Supprimer UN détenteur par ID
router.delete('/:id', async (req, res) => {
  try {
    await prisma.detenteur.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Détenteur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE : Supprimer TOUS les détenteurs (réinitialisation complète)
router.delete('/', async (req, res) => {
  try {
    const result = await prisma.detenteur.deleteMany({});
    res.json({
      success: true,
      message: 'Tous les détenteurs ont été supprimés',
      count: result.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;