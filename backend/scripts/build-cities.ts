#!/usr/bin/env tsx

import 'dotenv/config';
import { connectDatabase } from '../src/config/database';
import { cityDatabaseBuilder } from '../src/services/cityDatabaseBuilder';
import logger from '../src/utils/logger';

async function main() {
  const command = process.argv[2];

  try {
    // Connect to database first
    await connectDatabase();

    switch (command) {
      case 'build':
        logger.info('Starting full database build...');
        await cityDatabaseBuilder.buildDatabase();
        logger.info('Database build completed successfully!');
        break;

      case 'update':
        logger.info('Starting quick database update...');
        await cityDatabaseBuilder.quickUpdate();
        logger.info('Database update completed successfully!');
        break;

      case 'help':
      default:
        console.log(`
Usage: npm run build-cities <command>

Commands:
  build   - Build comprehensive database from all external APIs (slow, ~5-10 minutes)
  update  - Quick update with new cities from one API (fast, ~30 seconds)
  help    - Show this help message

Environment Variables:
  ENABLE_GEONAMES=true       - Enable GeoNames API (requires GEONAMES_USERNAME)
  ENABLE_OSM=true           - Enable OpenStreetMap Nominatim API
  ENABLE_REST_COUNTRIES=true - Enable REST Countries API
  GEONAMES_USERNAME=your_username - Required for GeoNames API

Examples:
  npm run build-cities build   # Full build (recommended first time)
  npm run build-cities update  # Quick update (for regular updates)

Note: If no external APIs are enabled, the system will use an expanded
sample database with ~50 major world cities.
        `);
        break;
    }
  } catch (error) {
    logger.error('Database build failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
