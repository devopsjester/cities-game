import express, { Request, Response, NextFunction } from 'express';
import { cityValidationService } from '../services/cityValidationService';
import CustomCityModel from '../models/CustomCity';

const router = express.Router();

// Get city database stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = cityValidationService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Validate a city
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cityName } = req.body;
    
    if (!cityName) {
      res.status(400).json({ error: 'City name is required' });
      return;
    }
    
    const result = cityValidationService.validateCity(cityName);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get city suggestions
router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    
    const suggestions = cityValidationService.getSuggestions(
      q as string,
      limit ? parseInt(limit as string) : 10
    );
    
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

// Admin: Add custom city
router.post('/admin/cities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, country, region } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'City name is required' });
      return;
    }
    
    await cityValidationService.addCustomCity(name, country, region, 'admin');
    
    res.status(201).json({ message: 'City added successfully' });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all custom cities
router.get('/admin/cities', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cities = await CustomCityModel.find().sort({ createdAt: -1 });
    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Admin: Approve custom city
router.patch('/admin/cities/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = await CustomCityModel.findById(req.params.id);
    
    if (!city) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    
    city.isApproved = true;
    await city.save();
    
    // Refresh city validation service
    await cityValidationService.refresh();
    
    res.json({ message: 'City approved successfully' });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete custom city
router.delete('/admin/cities/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = await CustomCityModel.findByIdAndDelete(req.params.id);
    
    if (!city) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    
    // Refresh city validation service
    await cityValidationService.refresh();
    
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
