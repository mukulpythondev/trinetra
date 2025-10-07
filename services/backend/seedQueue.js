const mongoose = require('mongoose');
const QueueSlot = require('../backend/src/models/QueueSlot');

mongoose.connect('mongodb+srv://mukulgenious123_db_user:vDZhFVakdZapyxIT@cluster0.rsegru3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')



async function seed() {
  const slots = [
    { slotId: 'slot1', templeId: 'kedarnath', start_time: '06:00', end_time: '07:00', max_capacity: 50 },
    { slotId: 'slot2', templeId: 'kedarnath', start_time: '07:00', end_time: '08:00', max_capacity: 50 },
    { slotId: 'slot3', templeId: 'kedarnath', start_time: '08:00', end_time: '09:00', max_capacity: 50 },
  ];

  await QueueSlot.deleteMany({});
  await QueueSlot.insertMany(slots);
  console.log('Slots seeded ✅');
  mongoose.disconnect();
}

seed();
