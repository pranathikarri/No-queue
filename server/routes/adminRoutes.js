const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');
const QueueState = require('../models/QueueState');
const Slot = require('../models/Slot');
const { Op } = require('sequelize');

// Helper to verify shop ownership
const verifyOwnership = async (shopId, userId) => {
  if (!userId || !shopId) return false;
  const sid = shopId.toUpperCase().trim();
  const shop = await Shop.findOne({ where: { shopId: sid } });
  return shop && shop.ownerId === userId;
};

// POST /nextCustomer
router.post('/nextCustomer', async (req, res) => {
  try {
    const { shopId, userId } = req.body;
    
    if (!(await verifyOwnership(shopId, userId))) {
      return res.status(403).json({ error: "Unauthorized: You don't own this shop" });
    }

    let state = await QueueState.findOne({ where: { shopId } });
    if (!state) return res.status(404).json({ error: "Shop state not found" });

    // Mark previous as completed if it was serving
    await Queue.update(
      { status: 'completed' },
      { where: { shopId, status: 'serving' } }
    );

    // Get next waiting customer
    const nextInLine = await Queue.findOne({ 
      where: { shopId, status: 'waiting' },
      order: [['sortOrder', 'ASC']]
    });
    
    if (nextInLine) {
      nextInLine.status = 'serving';
      await nextInLine.save();
      
      state.currentServingNumber = nextInLine.queueNumber;
      await state.save();
      
      return res.json({ nextCustomer: nextInLine, currentServing: state.currentServingNumber });
    }

    res.json({ message: "No more customers in queue", currentServing: state.currentServingNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /skipCustomer
router.post('/skipCustomer', async (req, res) => {
  try {
    const { shopId, userId, queueNumber } = req.body;
    if (!(await verifyOwnership(shopId, userId))) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Queue.update(
      { status: 'skipped' },
      { where: { shopId, queueNumber } }
    );
    res.json({ message: `Customer ${queueNumber} skipped` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /resetQueue
router.post('/resetQueue', async (req, res) => {
  try {
    const { shopId, userId } = req.body;
    if (!(await verifyOwnership(shopId, userId))) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Queue.destroy({ where: { shopId } });
    await QueueState.update(
      { currentServingNumber: 0, totalQueue: 0 },
      { where: { shopId } }
    );
    res.json({ message: "Queue reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /createSlot
router.post('/createSlot', async (req, res) => {
  try {
    const { shopId, userId, date, timeRange, capacity } = req.body;
    const sid = shopId.toUpperCase().trim();
    
    if (!(await verifyOwnership(sid, userId))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log(`[SLOT CREATE] Request for ${sid} on ${date} ${timeRange} (Cap: ${capacity})`);

    if (!date || !timeRange || !capacity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slot = await Slot.create({ shopId: sid, date, timeRange, capacity });
    console.log(`[SLOT SUCCESS] Created slot ID: ${slot.id}`);
    res.status(201).json(slot);
  } catch (err) {
    console.error(`[SLOT ERROR] ${err.message}`);
    res.status(500).json({ error: "Failed to create slot" });
  }
});

// GET /getSlots/:shopId
router.get('/getSlots/:shopId', async (req, res) => {
  try {
    const sid = req.params.shopId.toUpperCase().trim();
    console.log(`[SLOTS FETCH] Fetching for admin: ${sid}`);
    const slots = await Slot.findAll({ 
      where: { shopId: sid }, 
      order: [['date', 'ASC'], ['timeRange', 'ASC']] 
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// POST /verifyToken
router.post('/verifyToken', async (req, res) => {
  try {
    const { shopId, userId, tokenId } = req.body;
    const sid = shopId.toUpperCase().trim();
    if (!(await verifyOwnership(sid, userId))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if token exists for this shop
    const token = await Queue.findOne({ where: { id: tokenId, shopId: sid } });
    
    if (!token) {
      return res.status(404).json({ error: "Invalid token or token does not belong to this shop" });
    }

    res.json({ 
      success: true, 
      message: "Token verified successfully", 
      tokenDetails: {
        customerName: token.customerName,
        description: token.description,
        queueNumber: token.queueNumber,
        status: token.status,
        date: token.scheduledDate,
        time: token.timeSlot
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify token" });
  }
});


// GET /waitingCustomers/:shopId
router.get('/waitingCustomers/:shopId', async (req, res) => {
  try {
    const sid = req.params.shopId.toUpperCase().trim();
    const waiting = await Queue.findAll({
      where: { shopId: sid, status: 'waiting' },
      order: [['sortOrder', 'ASC']]
    });
    res.json(waiting);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch waiting customers" });
  }
});

// POST /reorderQueue
router.post('/reorderQueue', async (req, res) => {
  try {
    const { shopId, userId, orderedIds } = req.body;
    const sid = shopId.toUpperCase().trim();

    if (!(await verifyOwnership(sid, userId))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // Update sortOrder for each customer in the list
    for (let i = 0; i < orderedIds.length; i++) {
      await Queue.update(
        { sortOrder: i + 1 },
        { where: { id: orderedIds[i], shopId: sid } }
      );
    }

    res.json({ success: true, message: "Queue reordered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reorder queue" });
  }
});

// GET /discover/:id - Unified detection for Admin Entrance
router.get('/discover/:id', async (req, res) => {
  try {
    const id = req.params.id.toUpperCase().trim();
    
    // 1. Check if it's a Shop
    const shop = await Shop.findOne({ where: { shopId: id } });
    if (shop) {
      return res.json({ 
        type: 'shop', 
        shopName: shop.shopName,
        ownerId: shop.ownerId,
        orgId: shop.orgId
      });
    }

    // 2. Check if it's an Organization
    const Organization = require('../models/Organization');
    const org = await Organization.findOne({ where: { orgId: id } });
    if (org) {
      const departments = await Shop.findAll({ where: { orgId: id } });
      const enriched = await Promise.all(departments.map(async (d) => {
        const waitingCount = await Queue.count({ where: { shopId: d.shopId, status: 'waiting' } });
        return {
          shopId: d.shopId,
          shopName: d.shopName,
          category: d.category,
          waitingCount
        };
      }));
      return res.json({ 
        type: 'org', 
        name: org.name,
        departments: enriched
      });
    }

    res.status(404).json({ error: "ID not found as Shop or Institution" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
