/**
 * Google Maps Redirect & Navigation Helper
 * Directs customers to exact GPS pin coordinates or physical landmark on Google Maps.
 */

export function getGoogleMapsUrl(item) {
  if (!item) return 'https://www.google.com/maps';

  // 1. Direct verified Google Maps URL if available
  if (item.googleMapsUrl && typeof item.googleMapsUrl === 'string' && item.googleMapsUrl.startsWith('http')) {
    return item.googleMapsUrl;
  }

  // 2. Exact GPS Coordinates object: { lat, lng }
  if (item.coordinates && typeof item.coordinates === 'object') {
    const lat = item.coordinates.lat || item.coordinates.latitude;
    const lng = item.coordinates.lng || item.coordinates.longitude;
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
  }

  // 3. Flat lat / lng properties
  if (item.lat && item.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
  }

  // 4. Detailed address / landmark query
  const parts = [];
  const stayName = item.itemTitle || item.propertyTitle || item.title || '';
  const loc = item.location || item.address || item.destination || '';
  const dist = item.district || '';

  if (loc && loc.toLowerCase().includes('tamil nadu')) {
    parts.push(loc);
  } else {
    if (stayName) parts.push(stayName);
    if (loc) parts.push(loc);
    if (dist && !loc.toLowerCase().includes(dist.toLowerCase())) parts.push(dist);
    parts.push('Tamil Nadu');
  }

  const query = parts.filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function openGoogleMaps(item, e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const url = getGoogleMapsUrl(item);
  window.open(url, '_blank', 'noopener,noreferrer');
}
