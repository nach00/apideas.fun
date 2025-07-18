#!/usr/bin/env node

// This script sets up the database provider based on the DATABASE_URL
// It's used during Heroku deployment to automatically detect PostgreSQL

const fs = require('fs');
const path = require('path');

// Detect database provider from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || '';
let provider = 'sqlite';

if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
  provider = 'postgresql';
  console.log('Detected PostgreSQL database');
} else if (databaseUrl.includes('mysql://')) {
  provider = 'mysql';
  console.log('Detected MySQL database');
} else {
  console.log('Using SQLite database (default)');
}

// Set the DATABASE_PROVIDER environment variable
process.env.DATABASE_PROVIDER = provider;

console.log(`Database provider set to: ${provider}`);
console.log('Running prisma db push...');

// Execute prisma db push
const { execSync } = require('child_process');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('Database push completed successfully');
} catch (error) {
  console.error('Database push failed:', error.message);
  process.exit(1);
}