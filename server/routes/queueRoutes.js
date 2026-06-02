const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Queue = require('../models/Queue');
const QueueState = require('../models/QueueState');
const { Op } = require('sequelize');

// Helper: get/increment queue counter for a shop
async function getNextQueueNumber(shopId) {
  let [state, created] = await QueueState.findOrCreate({
    where: { shopId },
    defaults: { totalQueue: 0 }
  });
  
  state.totalQueue += 1;
  await state.save();
  return state.totalQueue;
}

// ─── POST /createShop ─────────────────────────────────────────────────────────
router.post('/createShop', async (req, res) => {
  try {
    const { 
      shopId, shopName, serviceType, category, city, address, 
      location, description, ownerId, phoneNumber 
    } = req.body;
    const sid = shopId.toUpperCase().trim();

    const existing = await Shop.findOne({ where: { shopId: sid } });
    if (existing) return res.status(409).json({ error: 'Shop ID already exists' });

    const shop = await Shop.create({
      shopId: sid, 
      shopName, 
      serviceType: serviceType || category,
      category: category || serviceType,
      city, 
      address: address || '',
      mapsUrl: location?.mapsUrl || '',
      phoneNumber: phoneNumber || '',
      description: description || '',
      ownerId: ownerId || ''
    });

    // Also seed QueueState for the new shop
    await QueueState.findOrCreate({ where: { shopId: sid } });

    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /findShops?category=&city= ───────────────────────────────────────────
router.get('/findShops', async (req, res) => {
  try {
    const { category, city } = req.query;
    const where = {};
    if (category) where.category = { [Op.like]: `%${category}%` };
    if (city)     where.city = { [Op.like]: `%${city}%` };

    const Organization = require('../models/Organization');
    const shops = await Shop.findAll({ 
      where,
      include: [
        { model: Organization, as: 'organization', attributes: ['name'] }
      ],
      limit: 30,
      order: [['createdAt', 'DESC']]
    });

    // Enrich each shop with live queue count
    const enriched = await Promise.all(shops.map(async (shop) => {
      const waitingCount = await Queue.count({ where: { shopId: shop.shopId, status: 'waiting' } });
      const state = await QueueState.findOne({ where: { shopId: shop.shopId } });
      
      const obj = shop.toJSON();
      obj.avgRating = shop.getAvgRating();
      obj.waitingCount = waitingCount;
      obj.currentServing = state ? state.currentServingNumber : 0;
      return obj;
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /rateShop ───────────────────────────────────────────────────────────
router.post('/rateShop', async (req, res) => {
  try {
    const { shopId, rating } = req.body; // rating: 1–5
    const shop = await Shop.findOne({ where: { shopId } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    
    shop.ratingTotal += Number(rating);
    shop.ratingCount += 1;
    await shop.save();
    
    res.json({ avgRating: shop.getAvgRating() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /shopDetails/:shopId ────────────────────────────────────────────────
router.get('/shopDetails/:shopId', async (req, res) => {
  try {
    const sid = req.params.shopId.toUpperCase().trim();
    const shop = await Shop.findOne({ where: { shopId: sid } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    
    const waitingCount = await Queue.count({ where: { shopId: sid, status: 'waiting' } });
    const state = await QueueState.findOne({ where: { shopId: sid } });
    
    res.json({
      shopName: shop.shopName,
      category: shop.category,
      waitingCount,
      approxWaitTime: waitingCount * (state ? state.averageServiceTime : 5),
      maxSlots: shop.maxSlotsPerTimeSlot,
      ownerId: shop.ownerId,
      orgId: shop.orgId // Added for PIN detection
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Slot = require('../models/Slot');

// ...

// ─── GET /getAvailableSlots/:shopId ──────────────────────────────────────────
router.get('/getAvailableSlots/:shopId', async (req, res) => {
  try {
    const sid = req.params.shopId.toUpperCase().trim();
    console.log(`[CUSTOMER FETCH] Getting slots for: ${sid}`);
    
    // Return all slots for this shop. 
    // Filtering by date can be tricky with timezones, so we'll let the frontend handle the display.
    const slots = await Slot.findAll({ 
      where: { shopId: sid },
      order: [['date', 'ASC'], ['timeRange', 'ASC']]
    });
    
    console.log(`[CUSTOMER FETCH] Found ${slots.length} slots`);
    res.json(slots);
  } catch (err) {
    console.error(`[CUSTOMER FETCH ERROR] ${err.message}`);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// ─── POST /joinQueue ──────────────────────────────────────────────────────────
router.post('/joinQueue', async (req, res) => {
  try {
    const { shopId, userId, customerName, description, scheduledDate, timeSlot, pin } = req.body;
    const sid = shopId.toUpperCase().trim();

    if (!scheduledDate || !timeSlot) {
      return res.status(400).json({ error: 'Date and Time Slot are required' });
    }

    let shop = await Shop.findOne({ where: { shopId: sid } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    // Organization Pin Check
    if (shop.orgId) {
      const Organization = require('../models/Organization');
      const org = await Organization.findOne({ where: { orgId: shop.orgId } });
      if (org && org.accessCode !== pin) {
        return res.status(403).json({ error: 'Invalid Organization PIN. This is a private institutional queue.' });
      }
    }

    // Check if a specific slot exists for this date/time
    const specificSlot = await Slot.findOne({ where: { shopId: sid, date: scheduledDate, timeRange: timeSlot } });
    const capacityLimit = specificSlot ? specificSlot.capacity : shop.maxSlotsPerTimeSlot;

    // Check slot availability
    const slotCount = await Queue.count({ 
      where: { 
        shopId: sid, 
        scheduledDate, 
        timeSlot,
        status: { [Op.ne]: 'skipped' }
      }
    });

    if (slotCount >= capacityLimit) {
      return res.status(400).json({ error: 'Sorry slots not available in selected slot' });
    }

    const queueNumber = await getNextQueueNumber(sid);
    const newEntry = await Queue.create({ 
      shopId: sid, 
      userId, 
      customerName, 
      description: description || '', 
      queueNumber, 
      sortOrder: queueNumber, // Default sort order is the queue number
      status: 'waiting', 
      scheduledDate, 
      timeSlot
    });

    res.status(201).json({ ...newEntry.toJSON(), shopName: shop.shopName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /queueStatus/:shopId ─────────────────────────────────────────────────
router.get('/queueStatus/:shopId', async (req, res) => {
  try {
    const sid = req.params.shopId.toUpperCase().trim();
    const state = await QueueState.findOne({ where: { shopId: sid } });
    const waitingCount = await Queue.count({ where: { shopId: sid, status: 'waiting' } });
    
    res.json({
      currentServing: state ? state.currentServingNumber : 0,
      totalInQueue:   state ? state.totalQueue : 0,
      waitingCount,
      averageServiceTime: state ? state.averageServiceTime : 10
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /userAppointments/:userId ───────────────────────────────────────────
router.get('/userAppointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Queue.findAll({ 
      where: { userId },
      order: [['joinedAt', 'DESC']]
    });
    
    const enriched = await Promise.all(appointments.map(async (app) => {
      const shop = await Shop.findOne({ where: { shopId: app.shopId } });
      const state = await QueueState.findOne({ where: { shopId: app.shopId } });
      
      const ahead = await Queue.count({
        where: {
          shopId: app.shopId,
          status: 'waiting',
          sortOrder: { [Op.lt]: app.sortOrder }
        }
      });

      return {
        ...app.toJSON(),
        shopName: shop ? shop.shopName : 'Unknown Shop',
        peopleAhead: ahead,
        averageServiceTime: state ? state.averageServiceTime : 10,
        currentServing: state ? state.currentServingNumber : 0
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
