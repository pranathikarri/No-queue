const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');
const QueueState = require('../models/QueueState');

// Create Organization
router.post('/create', async (req, res) => {
  try {
    const { orgId, name, ownerId, description, accessCode, adminPassword } = req.body;
    const oid = orgId.toUpperCase().trim();

    const existing = await Organization.findOne({ where: { orgId: oid } });
    if (existing) return res.status(409).json({ error: 'Organization ID already exists' });

    const org = await Organization.create({
      orgId: oid,
      name,
      ownerId,
      description: description || '',
      accessCode: accessCode || '1234',
      adminPassword: adminPassword || 'admin'
    });

    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Organization Admin (for adding departments)
router.post('/verifyAdmin', async (req, res) => {
  try {
    const { orgId, adminPassword } = req.body;
    const oid = orgId.toUpperCase().trim();

    const org = await Organization.findOne({ where: { orgId: oid } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    if (org.adminPassword !== adminPassword) {
      return res.status(403).json({ error: 'Invalid Administrative Password' });
    }

    res.json({ success: true, orgName: org.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Department (Mini Portal) linked to Org
router.post('/createDepartment', async (req, res) => {
  try {
    const { 
      shopId, shopName, category, city, address, mapsUrl, 
      description, doctorName, experienceYears, orgId, ownerId, phoneNumber 
    } = req.body;
    const sid = shopId.toUpperCase().trim();

    const existing = await Shop.findOne({ where: { shopId: sid } });
    if (existing) return res.status(409).json({ error: 'Department ID already exists globally' });

    const shop = await Shop.create({
      shopId: sid,
      shopName,
      category,
      city,
      address: address || '',
      mapsUrl: mapsUrl || '',
      description: description || '',
      doctorName: doctorName || '',
      experienceYears: experienceYears || 0,
      phoneNumber: phoneNumber || '',
      orgId: orgId.toUpperCase().trim(),
      ownerId,
      serviceType: category
    });

    await QueueState.findOrCreate({ where: { shopId: sid } });

    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lookup Organization by Code (for Users)
router.post('/lookup', async (req, res) => {
  try {
    const { orgId, accessCode, shopId } = req.body;
    const oid = orgId.toUpperCase().trim();

    const org = await Organization.findOne({ where: { orgId: oid } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    if (org.adminPassword !== accessCode) {
      return res.status(403).json({ error: 'Invalid Organisation PIN' });
    }

    // If a specific shopId was requested, verify it belongs to this org
    if (shopId) {
      const sid = shopId.toUpperCase().trim();
      const shop = await Shop.findOne({ where: { shopId: sid, orgId: oid } });
      if (!shop) return res.status(404).json({ error: 'Department not found in this organization' });
      return res.json({ orgId: org.orgId, name: org.name, shopId: sid });
    }

    res.json({ orgId: org.orgId, name: org.name, description: org.description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all Departments (Shops) for an Organization
router.get('/departments/:orgId', async (req, res) => {
  try {
    const oid = req.params.orgId.toUpperCase().trim();
    
    // Check if Org actually exists first
    const Organization = require('../models/Organization');
    const org = await Organization.findOne({ where: { orgId: oid } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const shops = await Shop.findAll({ where: { orgId: oid } });

    // Enrich with queue counts
    const enriched = await Promise.all(shops.map(async (shop) => {
      const waitingCount = await Queue.count({ where: { shopId: shop.shopId, status: 'waiting' } });
      const state = await QueueState.findOne({ where: { shopId: shop.shopId } });
      
      return {
        shopId: shop.shopId,
        shopName: shop.shopName,
        category: shop.category,
        waitingCount,
        currentServing: state ? state.currentServingNumber : 0
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
