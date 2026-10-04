import { searchLocations } from '../services/geocodingService.js';

/**
 * GET /api/locations/search?q=<query>
 * Search operational locations via geocoding service (requires authentication)
 */
export async function searchLocationsHandler(req, res) {
  try {
    const rawQuery = req.query.q;

    if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query parameter (q) is required'
      });
    }

    const query = rawQuery.trim();
    if (query.length < 3) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query must be at least 3 characters long'
      });
    }

    const results = await searchLocations(query);
    return res.status(200).json(results);
  } catch (err) {
    console.error('[AEGIS-LOCATIONS] Search error:', err.message);
    return res.status(500).json({
      error: 'Location Search Failed',
      message: 'Unable to query location intelligence service',
      details: err.message
    });
  }
}
