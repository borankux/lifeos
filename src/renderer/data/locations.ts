// Popular city locations with coordinates for weather
export interface LocationPreset {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  // China
  { name: '上海·徐汇', latitude: 31.1880, longitude: 121.4380, timezone: 'Asia/Shanghai' },
  { name: '北京', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { name: '深圳', latitude: 22.5431, longitude: 114.0579, timezone: 'Asia/Shanghai' },
  { name: '广州', latitude: 23.1291, longitude: 113.2644, timezone: 'Asia/Shanghai' },
  { name: '杭州', latitude: 30.2741, longitude: 120.1551, timezone: 'Asia/Shanghai' },
  { name: '成都', latitude: 30.5728, longitude: 104.0668, timezone: 'Asia/Shanghai' },
  { name: '重庆', latitude: 29.4316, longitude: 106.9123, timezone: 'Asia/Shanghai' },
  { name: '南京', latitude: 32.0603, longitude: 118.7969, timezone: 'Asia/Shanghai' },
  { name: '武汉', latitude: 30.5928, longitude: 114.3055, timezone: 'Asia/Shanghai' },
  { name: '西安', latitude: 34.2658, longitude: 108.9541, timezone: 'Asia/Shanghai' },
  
  // International
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Hong Kong', latitude: 22.3193, longitude: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: 'Seoul', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Bangkok', latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok' },
  { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Toronto', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Berlin', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' },
  { name: 'Moscow', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Madrid', latitude: 40.4168, longitude: -3.7038, timezone: 'Europe/Madrid' },
];

export function findLocationByName(name: string): LocationPreset | undefined {
  return LOCATION_PRESETS.find(loc => loc.name === name);
}

export function getDefaultLocation(): LocationPreset {
  return LOCATION_PRESETS[0]; // Shanghai by default
}
