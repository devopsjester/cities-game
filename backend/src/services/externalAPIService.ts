import axios from 'axios';
import { CityRecord } from '../types';
import logger from '../utils/logger';

interface GeoNamesCity {
  geonameId: number;
  name: string;
  countryName: string;
  adminName1?: string;
  population?: number;
  lat: string;
  lng: string;
}

interface OSMNominatimPlace {
  place_id: number;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country: string;
    state?: string;
  };
}

export class ExternalAPIService {
  private readonly geonamesUsername: string;
  private readonly rateLimitMs = 1000; // 1 second between requests
  private lastRequestTime = 0;

  constructor() {
    this.geonamesUsername = process.env.GEONAMES_USERNAME || 'demo';
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      await new Promise((resolve) => setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch cities from GeoNames API
   */
  async fetchFromGeoNames(maxRows: number = 10000): Promise<CityRecord[]> {
    logger.info('Fetching cities from GeoNames API...');
    const cities: CityRecord[] = [];
    let startRow = 0;
    const rowsPerRequest = 1000;

    try {
      while (startRow < maxRows) {
        await this.rateLimit();

        const response = await axios.get('http://api.geonames.org/searchJSON', {
          params: {
            featureClass: 'P', // Places (cities, towns, villages)
            featureCode: 'PPL,PPLA,PPLA2,PPLA3,PPLA4,PPLC', // Various city types
            maxRows: Math.min(rowsPerRequest, maxRows - startRow),
            startRow,
            username: this.geonamesUsername,
            orderby: 'population',
          },
          timeout: 30000,
        });

        const data = response.data;
        if (!data.geonames || data.geonames.length === 0) {
          break;
        }

        for (const place of data.geonames as GeoNamesCity[]) {
          const normalizedName = place.name.toLowerCase().trim();
          cities.push({
            name: place.name,
            normalizedName,
            displayName: place.name,
            country: place.countryName,
            region: place.adminName1,
            population: place.population,
            source: 'geonames',
          });
        }

        startRow += rowsPerRequest;
        logger.info(`Loaded ${cities.length} cities from GeoNames so far...`);

        // If we got less than requested, we've reached the end
        if (data.geonames.length < rowsPerRequest) {
          break;
        }
      }

      logger.info(`Completed GeoNames fetch: ${cities.length} cities`);
      return cities;
    } catch (error) {
      logger.error('Error fetching from GeoNames:', error);
      return cities; // Return what we have so far
    }
  }

  /**
   * Fetch major cities from OpenStreetMap Nominatim
   */
  async fetchFromOSM(limit: number = 5000): Promise<CityRecord[]> {
    logger.info('Fetching cities from OpenStreetMap Nominatim...');
    const cities: CityRecord[] = [];

    try {
      // Search for cities in batches by region/country to avoid hitting limits
      const regions = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];

      for (const region of regions) {
        await this.rateLimit();

        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: `city in ${region}`,
              format: 'json',
              limit: Math.floor(limit / regions.length),
              addressdetails: 1,
              extratags: 1,
            },
            timeout: 30000,
            headers: {
              'User-Agent': 'CitiesGame/1.0 (cities-game-app)',
            },
          });

          const places = response.data as OSMNominatimPlace[];

          for (const place of places) {
            const cityName = place.address.city || place.address.town || place.address.village;
            if (cityName) {
              const normalizedName = cityName.toLowerCase().trim();
              cities.push({
                name: cityName,
                normalizedName,
                displayName: cityName,
                country: place.address.country,
                region: place.address.state,
                source: 'osm',
              });
            }
          }
        } catch (regionError) {
          logger.warn(`Error fetching OSM data for ${region}:`, regionError);
        }
      }

      logger.info(`Completed OSM fetch: ${cities.length} cities`);
      return cities;
    } catch (error) {
      logger.error('Error fetching from OSM:', error);
      return cities;
    }
  }

  /**
   * Fetch cities from REST Countries API
   */
  async fetchFromRestCountries(): Promise<CityRecord[]> {
    logger.info('Fetching cities from REST Countries API...');
    const cities: CityRecord[] = [];

    try {
      await this.rateLimit();

      const response = await axios.get('https://countriesnow.space/api/v0.1/countries', {
        timeout: 30000,
      });

      const countries = response.data.data;

      for (const country of countries) {
        if (country.cities && Array.isArray(country.cities)) {
          for (const cityName of country.cities) {
            const normalizedName = cityName.toLowerCase().trim();
            cities.push({
              name: cityName,
              normalizedName,
              displayName: cityName,
              country: country.country,
              source: 'restcountries',
            });
          }
        }
      }

      logger.info(`Completed REST Countries fetch: ${cities.length} cities`);
      return cities;
    } catch (error) {
      logger.error('Error fetching from REST Countries:', error);
      return cities;
    }
  }

  /**
   * Validate a single city against external APIs (fallback)
   */
  async validateCityAPI(cityName: string): Promise<{ isValid: boolean; cityData?: CityRecord }> {
    try {
      await this.rateLimit();

      // Try GeoNames first
      const response = await axios.get('http://api.geonames.org/searchJSON', {
        params: {
          name_equals: cityName,
          featureClass: 'P',
          maxRows: 1,
          username: this.geonamesUsername,
        },
        timeout: 10000,
      });

      if (response.data.geonames && response.data.geonames.length > 0) {
        const place = response.data.geonames[0] as GeoNamesCity;
        return {
          isValid: true,
          cityData: {
            name: place.name,
            normalizedName: place.name.toLowerCase().trim(),
            displayName: place.name,
            country: place.countryName,
            region: place.adminName1,
            population: place.population,
            source: 'geonames',
          },
        };
      }

      return { isValid: false };
    } catch (error) {
      logger.error('Error validating city via API:', error);
      return { isValid: false };
    }
  }
}

export const externalAPIService = new ExternalAPIService();
