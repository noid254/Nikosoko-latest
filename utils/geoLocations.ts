import type { Coordinates, LocationCheckInLog, ServiceProvider } from '../types';

export interface KenyanEstateGeo {
  name: string;
  aliases: string[];
  county: string;
  lat: number;
  lng: number;
}

// Separate specific estates from generic city/county fallbacks
export const KENYAN_ESTATES: KenyanEstateGeo[] = [
  {
    name: 'Industrial Area',
    aliases: ['industrial area', 'enterprise road', 'commercial street', 'likoni road', 'dar es salaam rd', 'bandari road', 'lusingeti rd', 'donholm industrial'],
    county: 'Nairobi County',
    lat: -1.3100,
    lng: 36.8450
  },
  {
    name: 'Ruaka',
    aliases: ['ruaka', 'ruaka town', 'ruaka kiambu', 'two rivers', 'rosslyn', 'banana hill', 'muchatha', 'gacharage'],
    county: 'Kiambu County',
    lat: -1.2065,
    lng: 36.7767
  },
  {
    name: 'Kasarani',
    aliases: ['kasarani', 'kasarani nairobi', 'clay city', 'mirema', 'mwiki', 'sports view', 'seasons', 'sunton', 'hacienda', 'icdc'],
    county: 'Nairobi County',
    lat: -1.2215,
    lng: 36.8974
  },
  {
    name: 'Westlands',
    aliases: ['westlands', 'sarit', 'westgate', 'parklands', 'rhapta', 'mpaka', 'waiyaki way', 'chiromo', 'school lane'],
    county: 'Nairobi County',
    lat: -1.2674,
    lng: 36.8110
  },
  {
    name: 'Kilimani',
    aliases: ['kilimani', 'yaya', 'argwings kodhek', 'chaka', 'hurlingham', 'dennis pritt', 'wood avenue', 'rose avenue'],
    county: 'Nairobi County',
    lat: -1.2905,
    lng: 36.7865
  },
  {
    name: 'Lavington',
    aliases: ['lavington', 'james gichuru', 'kandara', 'valley arcade', 'kawasaki', 'chalbi', 'muthangari'],
    county: 'Nairobi County',
    lat: -1.2789,
    lng: 36.7692
  },
  {
    name: 'Karen',
    aliases: ['karen', 'hardy', 'karen shopping centre', 'bogani', 'dagoretti south', 'marula', 'langata south'],
    county: 'Nairobi County',
    lat: -1.3197,
    lng: 36.7065
  },
  {
    name: 'Upperhill',
    aliases: ['upperhill', 'upper hill', 'elgon road', 'hospital road', 'nhif', 'mara road', 'ragati road'],
    county: 'Nairobi County',
    lat: -1.2995,
    lng: 36.8163
  },
  {
    name: 'Roysambu',
    aliases: ['roysambu', 'thika road mall', 'trm', 'lumumba', 'zimmerman', 'kahawa west road'],
    county: 'Nairobi County',
    lat: -1.2185,
    lng: 36.8872
  },
  {
    name: 'Kahawa Sukari / Wendani',
    aliases: ['kahawa sukari', 'kahawa wendani', 'kahawa west', 'ku', 'kenyatta university', 'kahawa'],
    county: 'Kiambu / Nairobi County',
    lat: -1.1856,
    lng: 36.9298
  },
  {
    name: 'Ngong Road / Adams',
    aliases: ['ngong road', 'adams arcade', 'junction mall', 'dagoretti corner', 'riara', 'woodley', 'santack'],
    county: 'Nairobi County',
    lat: -1.3005,
    lng: 36.7725
  },
  {
    name: 'Ngong Town',
    aliases: ['ngong', 'ngong town', 'kajiado north', 'vet', 'matasia', 'kibiko'],
    county: 'Kajiado County',
    lat: -1.3614,
    lng: 36.6566
  },
  {
    name: 'Thika Town',
    aliases: ['thika', 'thika town', 'section 9', 'landless', 'makongeni', 'anja', 'thika cbd'],
    county: 'Kiambu County',
    lat: -1.0396,
    lng: 37.0900
  },
  {
    name: 'South B & South C',
    aliases: ['south b', 'south c', 'plainsview', 'akiba', 'bellevue', 'madaraka', 'strathmore', 'mombasa road'],
    county: 'Nairobi County',
    lat: -1.3167,
    lng: 36.8333
  },
  {
    name: 'Eastleigh',
    aliases: ['eastleigh', 'first avenue', 'section 1', 'section 2', 'pumwani', 'garissa lodge', 'general waruinge'],
    county: 'Nairobi County',
    lat: -1.2750,
    lng: 36.8500
  },
  {
    name: 'Buruburu & Donholm',
    aliases: ['buruburu', 'donholm', 'umoja', 'innercore', 'fedha', 'tena', 'komarock', 'kayole', 'outaring'],
    county: 'Nairobi County',
    lat: -1.2880,
    lng: 36.8890
  },
  {
    name: 'Kikuyu',
    aliases: ['kikuyu', 'ondiri', 'thogoto', 'gitaru', 'regen', 'sigona', 'kikuyu town'],
    county: 'Kiambu County',
    lat: -1.2464,
    lng: 36.6631
  },
  {
    name: 'Ongata Rongai',
    aliases: ['ongata rongai', 'rongai', 'maasai lodge', 'kware', 'rimpa', 'nazarene'],
    county: 'Kajiado County',
    lat: -1.3967,
    lng: 36.7600
  },
  {
    name: 'Kitengela',
    aliases: ['kitengela', 'kitengela town', 'noonkopir', 'yukos', 'milimani kitengela'],
    county: 'Kajiado County',
    lat: -1.4744,
    lng: 36.9589
  },
  {
    name: 'Syokimau & Mlolongo',
    aliases: ['syokimau', 'mlolongo', 'katani', 'gateway mall', 'sgr nairobi', 'jkia'],
    county: 'Machakos County',
    lat: -1.3900,
    lng: 36.9300
  },
  {
    name: 'Nairobi CBD',
    aliases: ['nairobi cbd', 'cbd', 'nairobi central', 'town', 'kenyatta avenue', 'moi avenue', 'nairobi hq', 'tom mboya', 'city centre', 'nairobi, kenya', 'nairobi'],
    county: 'Nairobi County',
    lat: -1.2864,
    lng: 36.8172
  },
  {
    name: 'Mombasa',
    aliases: ['mombasa', 'nyali', 'bamburi', 'shanzu', 'likoni', 'changamwe', 'mombasa cbd', 'diani'],
    county: 'Mombasa County',
    lat: -4.0435,
    lng: 39.6682
  },
  {
    name: 'Nakuru',
    aliases: ['nakuru', 'nakuru cbd', 'section 58', 'naka', 'milimani nakuru', 'lanet'],
    county: 'Nakuru County',
    lat: -0.3031,
    lng: 36.0800
  },
  {
    name: 'Kisumu',
    aliases: ['kisumu', 'kisumu cbd', 'milimani kisumu', 'mamboleo', 'nyalenda', 'kondele'],
    county: 'Kisumu County',
    lat: -0.0917,
    lng: 34.7680
  },
  {
    name: 'Eldoret',
    aliases: ['eldoret', 'eldoret cbd', 'elgon view', 'pioneer', 'kapsoya', 'kimumu'],
    county: 'Uasin Gishu County',
    lat: 0.5143,
    lng: 35.2698
  }
];

/**
 * Calculates accurate great-circle distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers (rounded to 1 decimal place)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lon1 - lon2) < 0.0001) {
    return 0.5; // same neighborhood
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 0.3) return 0.5;
  return Math.round(d * 10) / 10;
}

/**
 * Resolves coordinates for a location string using the curated Kenyan estate geo-database.
 * Prioritizes specific estate names and longer multi-word matches before generic city names.
 */
export function resolveLocationCoordinates(
  locationString: string,
  fallback?: Coordinates
): { lat: number; lng: number; estateName: string; county: string; displayName: string } {
  const clean = (locationString || '').toLowerCase().trim();

  if (!clean) {
    return {
      lat: -1.2065,
      lng: 36.7767,
      estateName: 'Ruaka',
      county: 'Kiambu County',
      displayName: 'Ruaka, Kiambu County'
    };
  }

  // Pass 1: Try specific non-generic estates first (excluding generic 'Nairobi CBD' / 'Nairobi' alias)
  for (const estate of KENYAN_ESTATES) {
    if (estate.name === 'Nairobi CBD') continue; // Test specific sub-areas first

    const matchesName = clean.includes(estate.name.toLowerCase());
    const matchesAlias = estate.aliases.some((alias) => {
      // Exact word boundary or substring match
      return clean.includes(alias);
    });

    if (matchesName || matchesAlias) {
      return {
        lat: estate.lat,
        lng: estate.lng,
        estateName: estate.name,
        county: estate.county,
        displayName: `${estate.name}, ${estate.county}`
      };
    }
  }

  // Pass 2: Check Nairobi CBD / General Nairobi
  const nairobiCbd = KENYAN_ESTATES.find((e) => e.name === 'Nairobi CBD');
  if (nairobiCbd) {
    if (
      clean.includes('cbd') ||
      clean.includes('nairobi') ||
      clean.includes('town') ||
      clean.includes('central') ||
      clean.includes('hq')
    ) {
      return {
        lat: nairobiCbd.lat,
        lng: nairobiCbd.lng,
        estateName: 'Nairobi CBD',
        county: nairobiCbd.county,
        displayName: 'Nairobi CBD, Nairobi County'
      };
    }
  }

  // Fallback to provided GPS coordinates if valid
  if (fallback && typeof fallback.lat === 'number' && typeof fallback.lng === 'number' && fallback.lat !== 0) {
    return {
      lat: fallback.lat,
      lng: fallback.lng,
      estateName: locationString || 'Current Location',
      county: 'Kenya',
      displayName: locationString || 'Detected Location'
    };
  }

  // Default reference hub
  return {
    lat: -1.2065,
    lng: 36.7767,
    estateName: 'Ruaka',
    county: 'Kiambu County',
    displayName: locationString || 'Ruaka, Kiambu County'
  };
}

/**
 * Calculates the exact distance in km between two location names (e.g. "Ruaka" vs "Kasarani")
 */
export function calculateDistanceBetweenLocations(
  fromLocation: string,
  toLocation: string,
  fromCoords?: Coordinates,
  toCoords?: Coordinates
): { distanceKm: number; fromEstate: string; toEstate: string; description: string } {
  const fromGeo = fromCoords && fromCoords.lat ? { ...fromCoords, estateName: fromLocation, county: '' } : resolveLocationCoordinates(fromLocation);
  const toGeo = toCoords && toCoords.lat ? { ...toCoords, estateName: toLocation, county: '' } : resolveLocationCoordinates(toLocation);

  const distanceKm = calculateHaversineDistance(fromGeo.lat, fromGeo.lng, toGeo.lat, toGeo.lng);

  return {
    distanceKm,
    fromEstate: fromGeo.estateName,
    toEstate: toGeo.estateName,
    description: `${distanceKm} km from ${fromGeo.estateName} to ${toGeo.estateName}`
  };
}

/**
 * Recalculates and updates provider list distances relative to a given user check-in location
 */
export function recalculateProvidersDistances(
  providers: ServiceProvider[],
  userLocation: string,
  userCoords?: Coordinates
): ServiceProvider[] {
  const userGeo = userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lng === 'number' && userCoords.lat !== 0
    ? { lat: userCoords.lat, lng: userCoords.lng, estateName: userLocation }
    : resolveLocationCoordinates(userLocation);

  return providers.map((provider) => {
    // Resolves provider geo based on provider's stated location
    const proGeo = resolveLocationCoordinates(provider.location || '');
    let proLat = proGeo.lat;
    let proLng = proGeo.lng;

    if (
      typeof provider.latitude === 'number' &&
      typeof provider.longitude === 'number' &&
      provider.latitude >= -5 &&
      provider.latitude <= 5 &&
      provider.longitude >= 33 &&
      provider.longitude <= 42 &&
      !provider.location
    ) {
      proLat = provider.latitude;
      proLng = provider.longitude;
    }

    const distanceKm = calculateHaversineDistance(userGeo.lat, userGeo.lng, proLat, proLng);

    return {
      ...provider,
      distanceKm,
      latitude: proLat,
      longitude: proLng
    };
  });
}

/**
 * Helper to get and save check-in logs to LocalStorage
 */
const CHECKIN_LOGS_KEY = 'nikosoko_db_location_checkin_logs';

export function getLocalCheckInLogs(): LocationCheckInLog[] {
  try {
    const data = localStorage.getItem(CHECKIN_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load check-in logs from localStorage', e);
    return [];
  }
}

export function saveLocalCheckInLog(log: LocationCheckInLog): void {
  try {
    const existing = getLocalCheckInLogs();
    // Mark previous logs from same user as inactive
    const updated = existing.map(l => l.userId === log.userId ? { ...l, isActive: false } : l);
    const newList = [log, ...updated].slice(0, 100); // Keep last 100 logs
    localStorage.setItem(CHECKIN_LOGS_KEY, JSON.stringify(newList));
  } catch (e) {
    console.error('Failed to save check-in log to localStorage', e);
  }
}

/**
 * Records a verified check-in log both locally and attempts sending to SQLite backend
 */
export async function recordLocationCheckIn(
  user: ServiceProvider | { id: string; name: string; phone?: string; role?: string },
  locationName: string,
  coords?: Coordinates,
  checkInType: LocationCheckInLog['checkInType'] = 'manual_update',
  notes?: string
): Promise<LocationCheckInLog> {
  const resolved = resolveLocationCoordinates(locationName, coords);
  const now = new Date().toISOString();

  const newLog: LocationCheckInLog = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: user.id || 'guest',
    userName: user.name || 'User',
    userPhone: user.phone || '',
    userRole: ('role' in user ? user.role : 'Member') || 'Member',
    locationName: resolved.displayName,
    estateName: resolved.estateName,
    county: resolved.county,
    latitude: coords?.lat || resolved.lat,
    longitude: coords?.lng || resolved.lng,
    accuracyMeters: coords ? 15 : 100,
    checkInType,
    notes: notes || `Checked in at ${resolved.displayName}`,
    timestamp: now,
    isActive: true
  };

  // Save to local storage
  saveLocalCheckInLog(newLog);

  // Send to API server
  try {
    const res = await fetch('/api/locations/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newLog,
        providerId: user.id
      })
    });
    if (res.ok) {
      const serverLog = await res.json();
      return serverLog.log || newLog;
    }
  } catch (e) {
    console.warn('API checkin log call failed (using local log):', e);
  }

  return newLog;
}
