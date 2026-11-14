const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./src/db/db');
const User = require('./src/models/User');
const InventoryItem = require('./src/models/InventoryItem');

dotenv.config();

const ingredients = [
  { name: 'Classic Hand-Tossed', category: 'base', price: 120 },
  { name: 'Thin & Crispy Crust', category: 'base', price: 130 },
  { name: 'Cheese Burst', category: 'base', price: 180 },
  { name: 'Whole Wheat Thin', category: 'base', price: 140 },
  { name: 'Gluten-Free Base', category: 'base', price: 160 },
  { name: 'Classic Marinara', category: 'sauce', price: 30 },
  { name: 'Spicy Arrabbiata', category: 'sauce', price: 35 },
  { name: 'Creamy Alfredo', category: 'sauce', price: 45 },
  { name: 'Smoky BBQ', category: 'sauce', price: 40 },
  { name: 'Basil Pesto', category: 'sauce', price: 50 },
  { name: 'Mozzarella', category: 'cheese', price: 50 },
  { name: 'Cheddar Blend', category: 'cheese', price: 60 },
  { name: 'Vegan Cashew Cheese', category: 'cheese', price: 75 },
  { name: 'Bell Peppers', category: 'veggie', price: 25 },
  { name: 'Mushrooms', category: 'veggie', price: 30 },
  { name: 'Black Olives', category: 'veggie', price: 30 },
  { name: 'Jalapeños', category: 'veggie', price: 25 },
  { name: 'Sweet Corn', category: 'veggie', price: 20 },
  { name: 'Red Onions', category: 'veggie', price: 20 },
].map((ingredient, index) => ({
  ...ingredient,
  stockCount: 25 + (index % 10) * 5,
  threshold: 20,
}));

async function seed() {
  try {
    await connectDB();
    await User.deleteMany({});
    await InventoryItem.deleteMany({});

    const password = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Store Admin',
      email: 'admin@pizzadelivery.com',
      password,
      role: 'admin',
      isVerified: true,
    });
    await InventoryItem.insertMany(ingredients);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await require('mongoose').connection.close();
  }
}

seed();
