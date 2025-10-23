import fs from 'fs/promises';
import Fuse from 'fuse.js';
import path from 'path';
import CustomCityModel from '../models/CustomCity';
import { CityRecord, GameMove, ValidationResult } from '../types';
import { extractNextLetter, normalizeCityName } from '../utils/gameUtils';
import logger from '../utils/logger';
import { externalAPIService } from './externalAPIService';

export class CityValidationService {
  private cities: Map<string, CityRecord> = new Map();
  private fuzzyMatcher?: Fuse<string>;
  private initialized = false;

  async initialize(): Promise<void> {
    const startTime = Date.now();
    logger.info('Initializing city validation service...');

    try {
      // Load prebuilt city database
      await this.loadCityDatabase();

      // Load custom cities from database
      await this.loadCustomCities();

      // Initialize fuzzy search
      this.initializeFuzzySearch();

      const loadTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      logger.info(`City database loaded successfully in ${loadTime}ms`);
      logger.info(`Loaded ${this.cities.size} cities into memory`);
      logger.info(`Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize city validation service:', error);
      throw error;
    }
  }

  private async loadCityDatabase(): Promise<void> {
    try {
      const dbPath = path.join(__dirname, '../../data/cities.json');
      const fileExists = await fs
        .access(dbPath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        logger.warn('City database file not found, creating with sample data');
        await this.createSampleDatabase(dbPath);
      }

      const data = await fs.readFile(dbPath, 'utf-8');
      const cities: CityRecord[] = JSON.parse(data);

      for (const city of cities) {
        this.cities.set(city.normalizedName, city);
      }

      logger.info(`Loaded ${cities.length} cities from database file`);
    } catch (error) {
      logger.error('Error loading city database:', error);
      // Continue with empty database rather than failing
      await this.createSampleDatabase(path.join(__dirname, '../../data/cities.json'));
    }
  }

  private async createSampleDatabase(dbPath: string): Promise<void> {
    // Create a sample database with common cities for testing
    const sampleCities: CityRecord[] = [
      {
        name: 'Aberdeen',
        normalizedName: 'aberdeen',
        displayName: 'Aberdeen',
        country: 'Scotland',
        source: 'custom',
      },
      {
        name: 'Newark',
        normalizedName: 'newark',
        displayName: 'Newark',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'Kinshasa',
        normalizedName: 'kinshasa',
        displayName: 'Kinshasa',
        country: 'DR Congo',
        source: 'custom',
      },
      {
        name: 'Ann Arbor',
        normalizedName: 'ann arbor',
        displayName: 'Ann Arbor',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'Rochester',
        normalizedName: 'rochester',
        displayName: 'Rochester',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'New York City',
        normalizedName: 'new york city',
        displayName: 'New York City',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'Kansas City',
        normalizedName: 'kansas city',
        displayName: 'Kansas City',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'York',
        normalizedName: 'york',
        displayName: 'York',
        country: 'United Kingdom',
        source: 'custom',
      },
      {
        name: 'Tokyo',
        normalizedName: 'tokyo',
        displayName: 'Tokyo',
        country: 'Japan',
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
        name: 'London',
        normalizedName: 'london',
        displayName: 'London',
        country: 'United Kingdom',
        source: 'custom',
      },
      {
        name: 'Nairobi',
        normalizedName: 'nairobi',
        displayName: 'Nairobi',
        country: 'Kenya',
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
        name: 'Los Angeles',
        normalizedName: 'los angeles',
        displayName: 'Los Angeles',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'Seattle',
        normalizedName: 'seattle',
        displayName: 'Seattle',
        country: 'United States',
        source: 'custom',
      },
      {
        name: 'Edmonton',
        normalizedName: 'edmonton',
        displayName: 'Edmonton',
        country: 'Canada',
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
        name: 'Sydney',
        normalizedName: 'sydney',
        displayName: 'Sydney',
        country: 'Australia',
        source: 'custom',
      },
      {
        name: 'Yerevan',
        normalizedName: 'yerevan',
        displayName: 'Yerevan',
        country: 'Armenia',
        source: 'custom',
      },
      {
        name: 'Nicosia',
        normalizedName: 'nicosia',
        displayName: 'Nicosia',
        country: 'Cyprus',
        source: 'custom',
      },
    ];

    const dir = path.dirname(dbPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(sampleCities, null, 2));

    for (const city of sampleCities) {
      this.cities.set(city.normalizedName, city);
    }

    logger.info(`Created sample database with ${sampleCities.length} cities`);
  }

  private async loadCustomCities(): Promise<void> {
    try {
      const customCities = await CustomCityModel.find({ isApproved: true });

      for (const city of customCities) {
        const cityRecord: CityRecord = {
          name: city.name,
          normalizedName: city.normalizedName,
          displayName: city.name,
          country: city.country,
          region: city.region,
          source: 'custom',
        };

        // Custom cities override existing entries
        this.cities.set(cityRecord.normalizedName, cityRecord);
      }

      logger.info(`Loaded ${customCities.length} custom cities`);
    } catch (error) {
      logger.error('Error loading custom cities:', error);
    }
  }

  private initializeFuzzySearch(): void {
    const cityNames = Array.from(this.cities.keys());
    this.fuzzyMatcher = new Fuse(cityNames, {
      threshold: 0.3,
      distance: 100,
      includeScore: true,
    });
  }

  /**
   * Validates a city name
   */
  async validateCity(
    cityName: string,
    usedCities: Set<string> = new Set(),
    gameHistory: GameMove[] = []
  ): Promise<ValidationResult> {
    if (!this.initialized) {
      throw new Error('City validation service not initialized');
    }

    const normalized = normalizeCityName(cityName);
    const nextLetter = extractNextLetter(cityName);

    // Check for duplicate
    const isDuplicate = usedCities.has(normalized);
    let duplicateMove: GameMove | undefined;

    if (isDuplicate) {
      duplicateMove = gameHistory.find((move) => move.normalizedCityName === normalized);
    }

    // Primary: Exact match in memory
    const exactMatch = this.cities.get(normalized);
    if (exactMatch) {
      return {
        isValid: true,
        normalizedName: normalized,
        displayName: exactMatch.displayName,
        nextStartingLetter: nextLetter,
        source: exactMatch.source === 'custom' ? 'custom' : 'memory',
        confidence: 1.0,
        isDuplicate,
        duplicateMove,
        city: exactMatch,
      };
    }

    // Secondary: Fuzzy matching for typos
    if (this.fuzzyMatcher) {
      const fuzzyResults = this.fuzzyMatcher.search(normalized);

      if (fuzzyResults.length > 0) {
        const suggestions = fuzzyResults.slice(0, 3).map((result: { item: string }) => {
          const city = this.cities.get(result.item);
          return city?.displayName || result.item;
        });

        return {
          isValid: false,
          normalizedName: normalized,
          displayName: cityName,
          nextStartingLetter: nextLetter,
          source: 'memory',
          confidence: 0.8,
          isDuplicate: false,
          suggestions,
        };
      }
    }

    // Tertiary: API fallback for unknown cities (if enabled)
    if (process.env.ENABLE_API_FALLBACK === 'true') {
      try {
        const apiResult = await externalAPIService.validateCityAPI(cityName);
        if (apiResult.isValid && apiResult.cityData) {
          // Add to in-memory cache for future lookups
          this.cities.set(apiResult.cityData.normalizedName, apiResult.cityData);

          return {
            isValid: true,
            normalizedName: apiResult.cityData.normalizedName,
            displayName: apiResult.cityData.displayName,
            nextStartingLetter: extractNextLetter(apiResult.cityData.displayName),
            source: 'api_fallback',
            confidence: 0.9,
            isDuplicate,
            duplicateMove,
            city: apiResult.cityData,
          };
        }
      } catch (error) {
        logger.warn('API fallback failed:', error);
      }
    }

    // City not found
    return {
      isValid: false,
      normalizedName: normalized,
      displayName: cityName,
      nextStartingLetter: nextLetter,
      source: 'memory',
      confidence: 0.0,
      isDuplicate: false,
      suggestions: [],
    };
  }

  /**
   * Get suggestions for autocomplete
   */
  getSuggestions(partialName: string, limit: number = 10): string[] {
    if (!this.initialized || !this.fuzzyMatcher) {
      return [];
    }

    const normalized = normalizeCityName(partialName);
    const results = this.fuzzyMatcher.search(normalized);

    return results.slice(0, limit).map((result: { item: string }) => {
      const city = this.cities.get(result.item);
      return city?.displayName || result.item;
    });
  }

  /**
   * Add a custom city (for admin panel)
   */
  async addCustomCity(
    name: string,
    country?: string,
    region?: string,
    addedBy: string = 'admin'
  ): Promise<void> {
    const normalized = normalizeCityName(name);

    const customCity = new CustomCityModel({
      name,
      normalizedName: normalized,
      country,
      region,
      addedBy,
      isApproved: true, // Auto-approve for now
    });

    await customCity.save();

    // Add to in-memory database
    const cityRecord: CityRecord = {
      name,
      normalizedName: normalized,
      displayName: name,
      country,
      region,
      source: 'custom',
    };

    this.cities.set(normalized, cityRecord);

    // Reinitialize fuzzy search
    this.initializeFuzzySearch();

    logger.info(`Added custom city: ${name}`);
  }

  /**
   * Refresh the city database
   */
  async refresh(): Promise<void> {
    await this.initialize();
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      totalCities: this.cities.size,
      initialized: this.initialized,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}

// Singleton instance
export const cityValidationService = new CityValidationService();
