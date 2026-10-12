const { PrismaClient } = require('@prisma/client');

// Shared singleton PrismaClient instance across the application
const prisma = new PrismaClient();

module.exports = prisma;
