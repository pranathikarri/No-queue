const { sequelize } = require('./db');
const Shop = require('./models/Shop');
const Slot = require('./models/Slot');
const Queue = require('./models/Queue');
const QueueState = require('./models/QueueState');

async function seed() {
  try {
    // Authenticate and sync
    await sequelize.authenticate();
    console.log('Database connected for seeding...');

    // 1. Create Shops
    const shops = [
      {
        shopId: 'APOLLO_01',
        shopName: 'Apollo Pharmacy',
        serviceType: 'Pharmacy',
        category: 'Pharmacy',
        city: 'Hyderabad',
        address: 'Hitech City Road, Phase 2',
        ownerId: 'bJ2typ4hW5QS7rhYnHRTClLuQvt2', // Using user ID found in DB
        maxSlotsPerTimeSlot: 10
      },
      {
        shopId: 'HDFC_BNK_01',
        shopName: 'HDFC Bank - Main Branch',
        serviceType: 'Banking',
        category: 'Bank / Finance',
        city: 'Mumbai',
        address: 'Nariman Point, South Mumbai',
        ownerId: 'bJ2typ4hW5QS7rhYnHRTClLuQvt2',
        maxSlotsPerTimeSlot: 15
      },
      {
        shopId: 'TECH_SALON',
        shopName: 'The Tech Salon',
        serviceType: 'Salon',
        category: 'Salon / Spa',
        city: 'Bangalore',
        address: 'Koramangala 4th Block',
        ownerId: 'bJ2typ4hW5QS7rhYnHRTClLuQvt2',
        maxSlotsPerTimeSlot: 8
      }
    ];

    for (const s of shops) {
      await Shop.findOrCreate({ where: { shopId: s.shopId }, defaults: s });
      await QueueState.findOrCreate({ where: { shopId: s.shopId }, defaults: { currentServingNumber: 0, totalQueue: 0 } });
    }
    console.log('Shops seeded.');

    // 2. Create Slots for Today and Tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const slots = [
      { shopId: 'APOLLO_01', date: today, timeRange: '09:00 AM - 10:00 AM', capacity: 10 },
      { shopId: 'APOLLO_01', date: today, timeRange: '10:00 AM - 11:00 AM', capacity: 10 },
      { shopId: 'HDFC_BNK_01', date: today, timeRange: '11:00 AM - 12:00 PM', capacity: 15 },
      { shopId: 'TECH_SALON', date: tomorrow, timeRange: '05:00 PM - 06:00 PM', capacity: 8 }
    ];

    for (const sl of slots) {
      await Slot.findOrCreate({ 
        where: { shopId: sl.shopId, date: sl.date, timeRange: sl.timeRange },
        defaults: sl
      });
    }
    console.log('Slots seeded.');

    // 3. Create sample Queue entries for Apollo Pharmacy
    const queueEntries = [
      {
        id: 'q1',
        shopId: 'APOLLO_01',
        userId: 'user_01',
        customerName: 'Rahul Sharma',
        queueNumber: 1,
        status: 'serving',
        scheduledDate: today,
        timeSlot: '09:00 AM - 10:00 AM'
      },
      {
        id: 'q2',
        shopId: 'APOLLO_01',
        userId: 'user_02',
        customerName: 'Priya Singh',
        queueNumber: 2,
        status: 'waiting',
        scheduledDate: today,
        timeSlot: '09:00 AM - 10:00 AM'
      },
      {
        id: 'q3',
        shopId: 'APOLLO_01',
        userId: 'user_03',
        customerName: 'Amit Verma',
        queueNumber: 3,
        status: 'waiting',
        scheduledDate: today,
        timeSlot: '10:00 AM - 11:00 AM'
      }
    ];

    for (const q of queueEntries) {
      await Queue.findOrCreate({ where: { id: q.id }, defaults: q });
    }

    // Update QueueState for Apollo
    await QueueState.update(
      { currentServingNumber: 1, totalQueue: 3 },
      { where: { shopId: 'APOLLO_01' } }
    );

    console.log('Queue data seeded.');
    console.log('Seeding completed successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
