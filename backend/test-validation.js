import { CityValidationService } from '../src/services/cityValidationService.ts';

async function testCityValidation() {
  const service = CityValidationService.getInstance();
  await service.initialize();

  console.log('Testing city validation...');

  // Test some cities that should be valid
  const testCities = ['London', 'New York City', 'Tokyo', 'Aberdeen', 'Newark', 'oslo'];

  for (const city of testCities) {
    const result = service.validateCity(city);
    console.log(`${city}: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (!result.isValid && result.suggestions && result.suggestions.length > 0) {
      console.log(`  Suggestions: ${result.suggestions.join(', ')}`);
    }
  }
}

testCityValidation().catch(console.error);
