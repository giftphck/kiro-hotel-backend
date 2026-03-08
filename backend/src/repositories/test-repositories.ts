/**
 * Simple test script to verify repository implementations
 * Run with: npx ts-node src/repositories/test-repositories.ts
 */

import { testConnection } from '../config/database.config';
import * as roomRepository from './room.repository';
import customerRepository from './customer.repository';
import bookingRepository from './booking.repository';
import roomPriceRepository from './room-price.repository';

async function testRepositories() {
  console.log('Testing repository implementations...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('✓ Database connection successful\n');

    // Test Room Repository
    console.log('2. Testing Room Repository...');
    const rooms = await roomRepository.getAllRooms();
    console.log(`✓ Found ${rooms.length} rooms`);
    if (rooms.length > 0) {
      console.log(`  Sample room: ${rooms[0].roomNumber} (${rooms[0].roomStatus})`);
    }
    console.log();

    // Test Customer Repository
    console.log('3. Testing Customer Repository...');
    const customers = await customerRepository.getAllCustomers();
    console.log(`✓ Found ${customers.length} customers`);
    console.log();

    // Test Booking Repository
    console.log('4. Testing Booking Repository...');
    const bookings = await bookingRepository.getBookings();
    console.log(`✓ Found ${bookings.length} bookings`);
    console.log();

    // Test Room Price Repository
    console.log('5. Testing Room Price Repository...');
    const roomPrices = await roomPriceRepository.getRoomPrices();
    console.log(`✓ Found ${roomPrices.length} room prices`);
    console.log();

    console.log('All repository tests passed! ✓');
    process.exit(0);
  } catch (error) {
    console.error('Repository test failed:', error);
    process.exit(1);
  }
}

testRepositories();
