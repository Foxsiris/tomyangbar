const express = require('express');
const iikoService = require('../services/iikoService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Health check - доступен всем
router.get('/health', async (req, res) => {
  try {
    const result = await iikoService.healthCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Получение организаций - только для админа
router.get('/organizations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const organizations = await iikoService.getOrganizations();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение терминальных групп - только для админа
router.get('/terminal-groups', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const terminalGroups = await iikoService.getTerminalGroups();
    res.json(terminalGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение меню из iiko - временно публичный для настройки
router.get('/menu', async (req, res) => {
  try {
    const menu = await iikoService.getMenu();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение типов оплаты - временно публичный для настройки
router.get('/payment-types', async (req, res) => {
  try {
    const paymentTypes = await iikoService.getPaymentTypes();
    res.json(paymentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

