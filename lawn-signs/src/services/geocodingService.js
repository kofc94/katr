/**
 * Geolocation & Reverse Geocoding service
 */

// Get current device GPS coordinates
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      (error) => {
        let msg = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow location access in settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      }
    );
  });
}

// Reverse geocode latitude and longitude to street address using OpenStreetMap Nominatim API
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KATR Lawn Sign Tracker App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.address) {
      const addr = data.address;
      const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
      const houseNumber = addr.house_number || '';
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';

      const parts = [];
      if (houseNumber && road) {
        parts.push(`${houseNumber} ${road}`);
      } else if (road) {
        parts.push(road);
      } else if (data.display_name) {
        // Fallback to first 2 components of display name
        const displayParts = data.display_name.split(',');
        parts.push(displayParts.slice(0, 2).join(', ').trim());
      }

      if (city) parts.push(city);
      if (state) parts.push(state);
      if (postcode) parts.push(postcode);

      const formattedAddress = parts.join(', ');
      return formattedAddress || data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }

    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
}

// Haversine formula to compute distance in miles between two GPS points
export function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}
