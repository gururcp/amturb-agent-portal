// ============================================================
// SEED SCRIPT - Initial Data Setup
// ============================================================
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user'); // ← lowercase
const Service = require('../models/service'); // ← lowercase
// ============================================================
// OWNER ACCOUNT DATA
// ============================================================
const ownerData = {
  name: 'Admin User',
  employeeId: 'admin',
  pin: '0000',
  role: 'owner',
  mustChangePIN: false,
  isActive: true
};
// ============================================================
// TEST AGENT DATA
// ============================================================
const testAgentData = {
  name: 'Test Agent',
  employeeId: 'agent',
  pin: '1234',
  role: 'agent',
  mustChangePIN: true,
  isActive: true
};
// ============================================================
// 9 SERVICES DATA
// ============================================================
const servicesData = [
  {
    slug: 'current_savings',
    name: 'Current/Savings Account',
    description: 'Basic banking account for deposits and withdrawals',
    isActive: true
  },
  {
    slug: 'daily_account',
    name: 'Daily Deposit Account',
    description: 'Daily deposit savings scheme',
    isActive: true
  },
  {
    slug: 'fixed_deposit',
    name: 'Fixed Deposit',
    description: 'Fixed term deposit with guaranteed returns',
    isActive: true
  },
  {
    slug: 'recurring_deposit',
    name: 'Recurring Deposit',
    description: 'Monthly recurring deposit scheme',
    isActive: true
  },
  {
    slug: 'monthly_interest',
    name: 'Monthly Interest Scheme',
    description: 'Deposit scheme with monthly interest payout',
    isActive: true
  },
  {
    slug: 'loan',
    name: 'Loan',
    description: 'Business and personal loans',
    isActive: true
  },
  {
    slug: 'sound_box',
    name: 'Sound Box',
    description: 'Payment notification device (auto-includes Current/Savings + UPI/QR)',
    isActive: true
  },
  {
    slug: 'upi_qr',
    name: 'UPI / QR Service',
    description: 'Digital payment acceptance via UPI and QR codes',
    isActive: true
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'Other banking services',
    isActive: true
  }
];
// ============================================================
// SEED FUNCTION
// ============================================================
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('✅ Cleared existing users and services\n');
    console.log('👤 Creating owner account...');
    const owner = await User.create(ownerData);
    console.log(`✅ Owner created: ${owner.name} (${owner.employeeId})`);
    console.log(`   Login with: ${owner.employeeId} / 0000\n`);
    console.log('👤 Creating test agent...');
    const agent = await User.create(testAgentData);
    console.log(`✅ Agent created: ${agent.name} (${agent.employeeId})`);
    console.log(`   Login with: ${agent.employeeId} / 1234\n`);
    console.log('🏷️  Creating services...');
    const services = await Service.insertMany(servicesData);
    console.log(`✅ Created ${services.length} services:`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} (${service.slug})`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 SUMMARY:');
    console.log(`   • Owner Account: admin / PIN: 0000`);
    console.log(`   • Test Agent: agent / PIN: 1234`);
    console.log(`   • Services: ${services.length} created`);
    console.log('\n🚀 You can now start building the API routes!\n');
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - data may already exist');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};
// ============================================================
// RUN SEED
// ============================================================
seedDatabase();