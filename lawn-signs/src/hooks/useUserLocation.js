import { useCallback, useEffect, useState } from 'react';
import { getCurrentLocation } from '../services/geocodingService';

/**
 * Single source of GPS truth for the app.
 *
 * Hoisted to App so the home/map/list views share one fix instead of each
 * firing its own `getCurrentPosition` (which on mobile means three permission
 * prompts' worth of battery for the same coordinates).
 */
export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      return loc;
    } catch (err) {
      setError(err.message || 'Could not get your location.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, isLocating, error, refresh };
}
