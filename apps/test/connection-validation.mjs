import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Attempt connection test
async function testConnection() {
  try {
    // This simple query tests if the connection works
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection test passed successfully!");
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    console.error("Details:", error.stack || error);
    process.exit(1); // Exit with failure code
  }
}

// Run the test
testConnection();