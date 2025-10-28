# Weather Integration Upgrade

## ✅ Switched to Open-Meteo (FREE!)

Your weather integration has been upgraded from OpenWeatherMap to **Open-Meteo** - a completely free weather API that requires **NO API KEY**!

## What Changed

### Before (OpenWeatherMap)
- ❌ Required API key registration
- ❌ Cost money after free tier
- ❌ Manual text input for location
- ❌ Complex setup

### After (Open-Meteo)
- ✅ **Completely FREE** forever
- ✅ **NO API key needed**
- ✅ Dropdown selection from 30+ cities
- ✅ Simple one-click setup

## Features

### 📍 Location Selection
- **30+ preset cities** including:
  - Chinese cities: Shanghai, Beijing, Shenzhen, Guangzhou, Hangzhou, etc.
  - International: New York, London, Paris, Tokyo, Singapore, etc.
- One-click dropdown selection
- Automatic coordinate mapping
- Default: Shanghai (上海·徐汇)

### 🌤️ Weather Data
- **Current conditions**:
  - Temperature (°C)
  - Weather condition (晴, 多云, 雨, etc.)
  - Humidity (%)
  - Wind speed (m/s)
- **3-day forecast**:
  - Date and day of week
  - High temperature
  - Weather condition

### 🔄 Auto-Refresh
- Updates every 30 minutes
- No manual refresh needed
- Reliable WMO weather codes

## How to Use

### 1. **Change Location** (in Settings)
```
1. Go to Settings → Appearance
2. Find "Weather Location" section
3. Click "✏️ Change"
4. Select your city from dropdown
5. Click "✓ Save Location"
```

### 2. **View Weather** (on Dashboard)
The DateInfoModule on the dashboard shows:
- Current time and date
- Lunar calendar
- **Real-time weather** with 3-day forecast

## Technical Details

### API
- **Service**: [Open-Meteo](https://open-meteo.com/)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Package**: `openmeteo` (npm)
- **License**: Free & Open Source
- **Rate Limits**: None (unlimited requests!)

### Data Points
```javascript
{
  current: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m'],
  daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
  timezone: 'auto'
}
```

### Location Presets
All locations are stored in `src/renderer/data/locations.ts` with:
- Name (e.g., "上海·徐汇")
- Latitude (e.g., 31.1880)
- Longitude (e.g., 121.4380)
- Timezone (e.g., "Asia/Shanghai")

## Advantages Over OpenWeatherMap

| Feature | OpenWeatherMap | Open-Meteo |
|---------|---------------|------------|
| **Cost** | Free tier limited, then paid | Always FREE |
| **API Key** | Required | Not needed |
| **Rate Limit** | 1,000/day (free) | Unlimited |
| **Setup** | Complex | Simple |
| **Data Quality** | Good | Excellent |
| **Updates** | 10 min | Real-time |

## Weather Code Mapping

Open-Meteo uses WMO (World Meteorological Organization) codes:

| Code | Condition (Chinese) |
|------|---------------------|
| 0 | 晴 (Clear) |
| 1-2 | 少云/多云 (Partly Cloudy) |
| 3 | 阴 (Overcast) |
| 45-48 | 雾 (Fog) |
| 51-57 | 小雨/冻雨 (Drizzle/Freezing Drizzle) |
| 61-67 | 雨/冻雨 (Rain/Freezing Rain) |
| 71-77 | 雪 (Snow) |
| 80-86 | 阵雨/阵雪 (Showers) |
| 95-99 | 雷雨 (Thunderstorm) |

## Files Modified

1. **Package**: Added `openmeteo` dependency
2. **Settings Interface**: Removed `weatherApiKey`, added `weatherLatitude` & `weatherLongitude`
3. **Location Data**: New `src/renderer/data/locations.ts` with 30+ cities
4. **DateInfoModule**: Switched from fetch to Open-Meteo API
5. **SettingsPage**: Replaced text input + API key with dropdown selector

## Why Open-Meteo?

1. **No Registration**: Works immediately, no signup
2. **No Costs**: Forever free, no hidden charges
3. **No Limits**: Unlimited API calls
4. **Better Data**: High-quality European weather models
5. **Privacy-Friendly**: No tracking, no API keys to leak
6. **Developer-Friendly**: Simple API, excellent documentation

## Future Enhancements

Want to add more locations? Edit `src/renderer/data/locations.ts`:

```typescript
{ 
  name: 'Your City', 
  latitude: 12.3456, 
  longitude: 78.9012, 
  timezone: 'Your/Timezone' 
}
```

---

**Enjoy FREE, unlimited weather data!** 🌤️🎉
