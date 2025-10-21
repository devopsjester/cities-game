import fs from 'fs/promises';
import path from 'path';
import { CityRecord } from '../types';
import logger from '../utils/logger';
import { externalAPIService } from './externalAPIService';

export class CityDatabaseBuilder {
  private readonly outputPath: string;

  constructor() {
    this.outputPath = path.join(__dirname, '../../data/cities.json');
  }

  /**
   * Build comprehensive city database from multiple sources
   */
  async buildDatabase(): Promise<CityRecord[]> {
    logger.info('Starting comprehensive city database build...');
    const startTime = Date.now();

    try {
      // Fetch from all sources in parallel (with some delay to avoid overwhelming APIs)
      const sources = await this.fetchFromAllSources();

      // Deduplicate and merge
      const mergedCities = this.deduplicateAndMerge(sources.flat());

      // Sort by importance (population, then alphabetically)
      const sortedCities = this.sortCities(mergedCities);

      // Save to file
      await this.saveCityDatabase(sortedCities);

      const buildTime = Date.now() - startTime;
      logger.info(`Database build completed in ${buildTime}ms`);
      logger.info(`Total cities in database: ${sortedCities.length}`);

      return sortedCities;
    } catch (error) {
      logger.error('Error building city database:', error);
      throw error;
    }
  }

  private async fetchFromAllSources(): Promise<CityRecord[][]> {
    const sources: Promise<CityRecord[]>[] = [];

    // Load existing custom cities first
    sources.push(this.loadExistingCities());

    // Fetch from external APIs with controlled timing
    logger.info(
      `API Flags - GEONAMES: ${process.env.ENABLE_GEONAMES}, OSM: ${process.env.ENABLE_OSM}, REST_COUNTRIES: ${process.env.ENABLE_REST_COUNTRIES}`
    );

    if (process.env.ENABLE_GEONAMES === 'true') {
      logger.info('Adding GeoNames source');
      sources.push(this.fetchWithDelay(() => externalAPIService.fetchFromGeoNames(50000), 0));
    }

    if (process.env.ENABLE_OSM === 'true') {
      logger.info('Adding OSM source');
      sources.push(this.fetchWithDelay(() => externalAPIService.fetchFromOSM(10000), 2000));
    }

    if (process.env.ENABLE_REST_COUNTRIES === 'true') {
      logger.info('Adding REST Countries source');
      sources.push(this.fetchWithDelay(() => externalAPIService.fetchFromRestCountries(), 4000));
    }

    // If no external APIs are enabled, just use a larger set of sample cities
    if (sources.length === 1) {
      logger.warn('No external APIs enabled, using expanded sample database');
      sources.push(this.createExpandedSampleDatabase());
    }

    return Promise.all(sources);
  }

  private async fetchWithDelay<T>(fetchFn: () => Promise<T>, delayMs: number): Promise<T> {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return fetchFn();
  }

  private async loadExistingCities(): Promise<CityRecord[]> {
    try {
      const data = await fs.readFile(this.outputPath, 'utf-8');
      const cities = JSON.parse(data) as CityRecord[];
      logger.info(`Loaded ${cities.length} existing cities`);
      return cities;
    } catch (error) {
      logger.info('No existing cities file found, starting fresh');
      return [];
    }
  }

  private deduplicateAndMerge(allCities: CityRecord[]): CityRecord[] {
    const cityMap = new Map<string, CityRecord>();

    for (const city of allCities) {
      const key = city.normalizedName;
      const existing = cityMap.get(key);

      if (!existing) {
        cityMap.set(key, city);
      } else {
        // Merge data, preferring more complete information
        cityMap.set(key, this.mergeCityData(existing, city));
      }
    }

    logger.info(`Deduplicated ${allCities.length} cities to ${cityMap.size} unique cities`);
    return Array.from(cityMap.values());
  }

  private mergeCityData(existing: CityRecord, incoming: CityRecord): CityRecord {
    // Prefer data from more reliable sources
    const sourceReliability: Record<string, number> = {
      geonames: 4,
      osm: 3,
      restcountries: 2,
      custom: 5, // Custom entries have highest priority
    };

    const existingReliability = sourceReliability[existing.source] || 1;
    const incomingReliability = sourceReliability[incoming.source] || 1;

    // If incoming source is more reliable, prefer it
    if (incomingReliability > existingReliability) {
      return {
        ...existing,
        ...incoming,
        // Always keep the most complete data
        population: incoming.population || existing.population,
        region: incoming.region || existing.region,
        latitude: incoming.latitude || existing.latitude,
        longitude: incoming.longitude || existing.longitude,
      };
    }

    // Otherwise, just fill in missing data from incoming
    return {
      ...existing,
      population: existing.population || incoming.population,
      region: existing.region || incoming.region,
      latitude: existing.latitude || incoming.latitude,
      longitude: existing.longitude || incoming.longitude,
    };
  }

  private sortCities(cities: CityRecord[]): CityRecord[] {
    return cities.sort((a, b) => {
      // First, sort by population (larger cities first)
      if (a.population && b.population) {
        if (a.population !== b.population) {
          return b.population - a.population;
        }
      } else if (a.population && !b.population) {
        return -1;
      } else if (!a.population && b.population) {
        return 1;
      }

      // Then by alphabetical order
      return a.displayName.localeCompare(b.displayName);
    });
  }

  private async saveCityDatabase(cities: CityRecord[]): Promise<void> {
    const dataDir = path.dirname(this.outputPath);

    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Create backup of existing database
    try {
      await fs.access(this.outputPath);
      const backupPath = this.outputPath.replace('.json', `.backup.${Date.now()}.json`);
      await fs.copyFile(this.outputPath, backupPath);
      logger.info(`Created backup at ${backupPath}`);
    } catch {
      // No existing file to backup
    }

    // Save new database
    await fs.writeFile(this.outputPath, JSON.stringify(cities, null, 2));
    logger.info(`Saved ${cities.length} cities to ${this.outputPath}`);
  }

  private async createExpandedSampleDatabase(): Promise<CityRecord[]> {
    logger.info('Creating expanded sample database...');

    // Major world cities for better game experience
    const sampleCities: CityRecord[] = [
      // Major US cities
      {
        name: 'New York City',
        normalizedName: 'new york city',
        displayName: 'New York City',
        country: 'United States',
        population: 8336817,
        source: 'custom',
      },
      {
        name: 'Los Angeles',
        normalizedName: 'los angeles',
        displayName: 'Los Angeles',
        country: 'United States',
        population: 3979576,
        source: 'custom',
      },
      {
        name: 'Chicago',
        normalizedName: 'chicago',
        displayName: 'Chicago',
        country: 'United States',
        population: 2693976,
        source: 'custom',
      },
      {
        name: 'Houston',
        normalizedName: 'houston',
        displayName: 'Houston',
        country: 'United States',
        population: 2320268,
        source: 'custom',
      },
      {
        name: 'Phoenix',
        normalizedName: 'phoenix',
        displayName: 'Phoenix',
        country: 'United States',
        population: 1680992,
        source: 'custom',
      },
      {
        name: 'Philadelphia',
        normalizedName: 'philadelphia',
        displayName: 'Philadelphia',
        country: 'United States',
        population: 1584064,
        source: 'custom',
      },
      {
        name: 'San Antonio',
        normalizedName: 'san antonio',
        displayName: 'San Antonio',
        country: 'United States',
        population: 1547253,
        source: 'custom',
      },
      {
        name: 'San Diego',
        normalizedName: 'san diego',
        displayName: 'San Diego',
        country: 'United States',
        population: 1423851,
        source: 'custom',
      },
      {
        name: 'Dallas',
        normalizedName: 'dallas',
        displayName: 'Dallas',
        country: 'United States',
        population: 1343573,
        source: 'custom',
      },
      {
        name: 'San Jose',
        normalizedName: 'san jose',
        displayName: 'San Jose',
        country: 'United States',
        population: 1021795,
        source: 'custom',
      },

      // Major European cities
      {
        name: 'London',
        normalizedName: 'london',
        displayName: 'London',
        country: 'United Kingdom',
        population: 9648110,
        source: 'custom',
      },
      {
        name: 'Berlin',
        normalizedName: 'berlin',
        displayName: 'Berlin',
        country: 'Germany',
        population: 3669491,
        source: 'custom',
      },
      {
        name: 'Madrid',
        normalizedName: 'madrid',
        displayName: 'Madrid',
        country: 'Spain',
        population: 3223334,
        source: 'custom',
      },
      {
        name: 'Rome',
        normalizedName: 'rome',
        displayName: 'Rome',
        country: 'Italy',
        population: 2872800,
        source: 'custom',
      },
      {
        name: 'Paris',
        normalizedName: 'paris',
        displayName: 'Paris',
        country: 'France',
        population: 2161000,
        source: 'custom',
      },
      {
        name: 'Vienna',
        normalizedName: 'vienna',
        displayName: 'Vienna',
        country: 'Austria',
        population: 1911191,
        source: 'custom',
      },
      {
        name: 'Hamburg',
        normalizedName: 'hamburg',
        displayName: 'Hamburg',
        country: 'Germany',
        population: 1899160,
        source: 'custom',
      },
      {
        name: 'Warsaw',
        normalizedName: 'warsaw',
        displayName: 'Warsaw',
        country: 'Poland',
        population: 1790658,
        source: 'custom',
      },
      {
        name: 'Budapest',
        normalizedName: 'budapest',
        displayName: 'Budapest',
        country: 'Hungary',
        population: 1752286,
        source: 'custom',
      },
      {
        name: 'Barcelona',
        normalizedName: 'barcelona',
        displayName: 'Barcelona',
        country: 'Spain',
        population: 1620343,
        source: 'custom',
      },

      // Major Asian cities
      {
        name: 'Tokyo',
        normalizedName: 'tokyo',
        displayName: 'Tokyo',
        country: 'Japan',
        population: 37400068,
        source: 'custom',
      },
      {
        name: 'Delhi',
        normalizedName: 'delhi',
        displayName: 'Delhi',
        country: 'India',
        population: 32941309,
        source: 'custom',
      },
      {
        name: 'Shanghai',
        normalizedName: 'shanghai',
        displayName: 'Shanghai',
        country: 'China',
        population: 28516904,
        source: 'custom',
      },
      {
        name: 'Dhaka',
        normalizedName: 'dhaka',
        displayName: 'Dhaka',
        country: 'Bangladesh',
        population: 22478116,
        source: 'custom',
      },
      {
        name: 'São Paulo',
        normalizedName: 'são paulo',
        displayName: 'São Paulo',
        country: 'Brazil',
        population: 22429800,
        source: 'custom',
      },
      {
        name: 'Cairo',
        normalizedName: 'cairo',
        displayName: 'Cairo',
        country: 'Egypt',
        population: 21322750,
        source: 'custom',
      },
      {
        name: 'Mexico City',
        normalizedName: 'mexico city',
        displayName: 'Mexico City',
        country: 'Mexico',
        population: 21804515,
        source: 'custom',
      },
      {
        name: 'Beijing',
        normalizedName: 'beijing',
        displayName: 'Beijing',
        country: 'China',
        population: 21893095,
        source: 'custom',
      },
      {
        name: 'Mumbai',
        normalizedName: 'mumbai',
        displayName: 'Mumbai',
        country: 'India',
        population: 20961472,
        source: 'custom',
      },
      {
        name: 'Osaka',
        normalizedName: 'osaka',
        displayName: 'Osaka',
        country: 'Japan',
        population: 18967459,
        source: 'custom',
      },

      // More cities for better letter coverage
      {
        name: 'Amsterdam',
        normalizedName: 'amsterdam',
        displayName: 'Amsterdam',
        country: 'Netherlands',
        source: 'custom',
      },
      {
        name: 'Athens',
        normalizedName: 'athens',
        displayName: 'Athens',
        country: 'Greece',
        source: 'custom',
      },
      {
        name: 'Auckland',
        normalizedName: 'auckland',
        displayName: 'Auckland',
        country: 'New Zealand',
        source: 'custom',
      },
      {
        name: 'Belfast',
        normalizedName: 'belfast',
        displayName: 'Belfast',
        country: 'Northern Ireland',
        source: 'custom',
      },
      {
        name: 'Brisbane',
        normalizedName: 'brisbane',
        displayName: 'Brisbane',
        country: 'Australia',
        source: 'custom',
      },
      {
        name: 'Copenhagen',
        normalizedName: 'copenhagen',
        displayName: 'Copenhagen',
        country: 'Denmark',
        source: 'custom',
      },
      {
        name: 'Dublin',
        normalizedName: 'dublin',
        displayName: 'Dublin',
        country: 'Ireland',
        source: 'custom',
      },
      {
        name: 'Edinburgh',
        normalizedName: 'edinburgh',
        displayName: 'Edinburgh',
        country: 'Scotland',
        source: 'custom',
      },
      {
        name: 'Florence',
        normalizedName: 'florence',
        displayName: 'Florence',
        country: 'Italy',
        source: 'custom',
      },
      {
        name: 'Geneva',
        normalizedName: 'geneva',
        displayName: 'Geneva',
        country: 'Switzerland',
        source: 'custom',
      },
      {
        name: 'Helsinki',
        normalizedName: 'helsinki',
        displayName: 'Helsinki',
        country: 'Finland',
        source: 'custom',
      },
      {
        name: 'Istanbul',
        normalizedName: 'istanbul',
        displayName: 'Istanbul',
        country: 'Turkey',
        source: 'custom',
      },
      {
        name: 'Jerusalem',
        normalizedName: 'jerusalem',
        displayName: 'Jerusalem',
        country: 'Israel',
        source: 'custom',
      },
      {
        name: 'Kiev',
        normalizedName: 'kiev',
        displayName: 'Kiev',
        country: 'Ukraine',
        source: 'custom',
      },
      {
        name: 'Lisbon',
        normalizedName: 'lisbon',
        displayName: 'Lisbon',
        country: 'Portugal',
        source: 'custom',
      },
      {
        name: 'Melbourne',
        normalizedName: 'melbourne',
        displayName: 'Melbourne',
        country: 'Australia',
        source: 'custom',
      },
      {
        name: 'Naples',
        normalizedName: 'naples',
        displayName: 'Naples',
        country: 'Italy',
        source: 'custom',
      },
      {
        name: 'Oslo',
        normalizedName: 'oslo',
        displayName: 'Oslo',
        country: 'Norway',
        source: 'custom',
      },
      {
        name: 'Prague',
        normalizedName: 'prague',
        displayName: 'Prague',
        country: 'Czech Republic',
        source: 'custom',
      },
      {
        name: 'Quebec City',
        normalizedName: 'quebec city',
        displayName: 'Quebec City',
        country: 'Canada',
        source: 'custom',
      },
      {
        name: 'Reykjavik',
        normalizedName: 'reykjavik',
        displayName: 'Reykjavik',
        country: 'Iceland',
        source: 'custom',
      },
      {
        name: 'Stockholm',
        normalizedName: 'stockholm',
        displayName: 'Stockholm',
        country: 'Sweden',
        source: 'custom',
      },
      {
        name: 'Toronto',
        normalizedName: 'toronto',
        displayName: 'Toronto',
        country: 'Canada',
        source: 'custom',
      },
      {
        name: 'Utrecht',
        normalizedName: 'utrecht',
        displayName: 'Utrecht',
        country: 'Netherlands',
        source: 'custom',
      },
      {
        name: 'Vancouver',
        normalizedName: 'vancouver',
        displayName: 'Vancouver',
        country: 'Canada',
        source: 'custom',
      },
      {
        name: 'Wellington',
        normalizedName: 'wellington',
        displayName: 'Wellington',
        country: 'New Zealand',
        source: 'custom',
      },
      {
        name: 'Zurich',
        normalizedName: 'zurich',
        displayName: 'Zurich',
        country: 'Switzerland',
        source: 'custom',
      },
    ];

    return sampleCities;
  }

  /**
   * Quick update that only fetches a small amount of new data
   */
  async quickUpdate(): Promise<void> {
    logger.info('Performing quick database update...');

    try {
      // Load existing cities
      const existingCities = await this.loadExistingCities();

      // Just fetch a small batch from one API
      const newCities = await externalAPIService.fetchFromGeoNames(1000);

      // Merge and save
      const allCities = [...existingCities, ...newCities];
      const deduplicated = this.deduplicateAndMerge(allCities);
      const sorted = this.sortCities(deduplicated);

      await this.saveCityDatabase(sorted);

      logger.info(`Quick update completed. Database now has ${sorted.length} cities`);
    } catch (error) {
      logger.error('Error during quick update:', error);
      throw error;
    }
  }
}

export const cityDatabaseBuilder = new CityDatabaseBuilder();
