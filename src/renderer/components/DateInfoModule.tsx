import React, { useState, useEffect } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import { LOCATION_PRESETS, findLocationByName, getDefaultLocation } from '../data/locations';

// Simple lunar calendar converter (basic implementation)
class LunarCalendar {
  private static lunarMonthDays = [29, 30];
  private static lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  private static lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  private static zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  static getLunarDate(date: Date): { year: string; month: string; day: string; zodiac: string } {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified lunar calculation (approximation)
    // For accurate conversion, use a proper lunar calendar library
    const lunarMonthIndex = (month - 1) % 12;
    const lunarDayIndex = (day - 1) % 30;
    const zodiacIndex = (year - 4) % 12;
    
    return {
      year: `${year}`,
      month: this.lunarMonths[lunarMonthIndex],
      day: this.lunarDays[lunarDayIndex],
      zodiac: this.zodiac[zodiacIndex]
    };
  }
}

interface WeatherData {
  temperature: string;
  condition: string;
  humidity: string;
  wind: string;
  forecast?: ForecastData[];
}

interface ForecastData {
  date: string;
  dayOfWeek: string;
  temperature: string;
  condition: string;
}

// Helper function to get weather icon based on condition
function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('晴')) return '☀️';
  if (conditionLower.includes('多云')) return '⛅';
  if (conditionLower.includes('阴')) return '☁️';
  if (conditionLower.includes('雨')) return '🌧️';
  if (conditionLower.includes('雪')) return '❄️';
  if (conditionLower.includes('雷')) return '⛈️';
  if (conditionLower.includes('雾')) return '🌫️';
  
  return '🌤️'; // Default icon
}

export function DateInfoModule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('上海·徐汇');
  const [latitude, setLatitude] = useState(31.1880);
  const [longitude, setLongitude] = useState(121.4380);

  // Load weather location and coordinates from settings
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const response = await window.api.settings.get();
        if (response.ok && response.data) {
          if (response.data.weatherLocation) {
            setLocation(response.data.weatherLocation);
            
            // Try to find preset location
            const preset = findLocationByName(response.data.weatherLocation);
            if (preset) {
              setLatitude(preset.latitude);
              setLongitude(preset.longitude);
            } else if (response.data.weatherLatitude && response.data.weatherLongitude) {
              setLatitude(response.data.weatherLatitude);
              setLongitude(response.data.weatherLongitude);
            }
          } else {
            // Use default Shanghai location
            const defaultLoc = getDefaultLocation();
            setLocation(defaultLoc.name);
            setLatitude(defaultLoc.latitude);
            setLongitude(defaultLoc.longitude);
          }
        }
      } catch (error) {
        console.error('Failed to load weather location:', error);
      }
    };
    loadLocation();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data from Open-Meteo API (FREE, no API key needed!)
  useEffect(() => {
    const fetchWeather = async () => {
      if (!latitude || !longitude) {
        setWeather({
          temperature: '--°C',
          condition: 'Location not set',
          humidity: '--',
          wind: '--',
          forecast: []
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch weather data from Open-Meteo (FREE!)
        const params = {
          latitude,
          longitude,
          current: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m'],
          daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
          timezone: 'auto'
        };
        
        const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', params);
        const response = responses[0];
        
        // Current weather
        const current = response.current()!;
        const currentTemp = current.variables(0)!.value(); // temperature_2m
        const currentHumidity = current.variables(1)!.value(); // relative_humidity_2m
        const currentWeatherCode = current.variables(2)!.value(); // weather_code
        const currentWindSpeed = current.variables(3)!.value(); // wind_speed_10m
        
        // Daily forecast
        const daily = response.daily()!;
        const dailyWeatherCode = daily.variables(0)!.valuesArray()!; // weather_code
        const dailyTempMax = daily.variables(1)!.valuesArray()!; // temperature_2m_max
        const dailyTempMin = daily.variables(2)!.valuesArray()!; // temperature_2m_min
        
        // Map WMO weather codes to Chinese conditions
        const mapWeatherCode = (code: number): string => {
          if (code === 0) return '晴';
          if (code === 1) return '少云';
          if (code === 2) return '多云';
          if (code === 3) return '阴';
          if (code >= 45 && code <= 48) return '雾';
          if (code >= 51 && code <= 55) return '小雨';
          if (code >= 56 && code <= 57) return '冻雨';
          if (code >= 61 && code <= 65) return '雨';
          if (code >= 66 && code <= 67) return '冻雨';
          if (code >= 71 && code <= 75) return '雪';
          if (code >= 80 && code <= 82) return '阵雨';
          if (code >= 85 && code <= 86) return '阵雪';
          if (code >= 95 && code <= 99) return '雷雨';
          return '晴';
        };
        
        // Process forecast (next 3 days)
        const forecast: ForecastData[] = [];
        const today = new Date();
        
        for (let i = 1; i <= 3 && i < dailyWeatherCode.length; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          forecast.push({
            date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            dayOfWeek: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
            temperature: `${Math.round(dailyTempMax[i])}°C`,
            condition: mapWeatherCode(dailyWeatherCode[i])
          });
        }
        
        setWeather({
          temperature: `${Math.round(currentTemp)}°C`,
          condition: mapWeatherCode(currentWeatherCode),
          humidity: `${Math.round(currentHumidity)}%`,
          wind: `${currentWindSpeed.toFixed(1)}m/s`,
          forecast
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setWeather({
          temperature: '--°C',
          condition: 'Failed to load',
          humidity: '--',
          wind: '--',
          forecast: []
        });
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [latitude, longitude]);

  // Calculate various date information
  const gregorianDate = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weekDay = currentTime.toLocaleDateString('zh-CN', {
    weekday: 'long',
  });

  const timeString = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Get lunar calendar info
  const lunar = LunarCalendar.getLunarDate(currentTime);
  const lunarDateStr = `${lunar.year}年 ${lunar.month}月${lunar.day}`;
  const lunarYearAnimal = lunar.zodiac; // 生肖

  // Calculate week number (ISO week)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const weekNumber = getWeekNumber(currentTime);

  // Calculate fiscal week (assuming fiscal year starts April 1)
  const getFiscalWeek = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const fiscalYearStart = month < 3 
      ? new Date(year - 1, 3, 1) // Previous year April 1
      : new Date(year, 3, 1);    // Current year April 1
    
    const diff = date.getTime() - fiscalYearStart.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  const fiscalWeek = getFiscalWeek(currentTime);

  // Get day of year
  const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dayOfYear = getDayOfYear(currentTime);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      flex: 1,
      minWidth: 0
    }}>
      {/* Main Date & Time Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          lineHeight: 1.2
        }}>
          {timeString}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}>
          {gregorianDate} {weekDay}
        </div>
      </div>

      {/* Divider */}
      <div style={{ 
        width: '1px', 
        height: '48px', 
        background: 'rgba(255, 255, 255, 0.1)' 
      }} />

      {/* Lunar Calendar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-primary)',
          fontWeight: 600
        }}>
          🌙 {lunarDateStr}
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-tertiary)'
        }}>
          {lunarYearAnimal}年
        </div>
      </div>

      {/* Divider */}
      <div style={{ 
        width: '1px', 
        height: '48px', 
        background: 'rgba(255, 255, 255, 0.1)' 
      }} />

      {/* Week Info Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.125rem',
        minWidth: '110px',
        flexShrink: 0
      }}>
        <div style={{ 
          fontSize: '0.7rem', 
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>📅 第{weekNumber}周 (年)</div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>💼 第{fiscalWeek}周 (财年)</div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>🗓️ 第{dayOfYear}天</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ 
        width: '1px', 
        height: '48px', 
        background: 'rgba(255, 255, 255, 0.1)' 
      }} />

      {/* Weather Section */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        minWidth: '220px',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {/* Today's Weather Card */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          padding: '0.5rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flex: 1
        }}>
          <div style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-tertiary)',
            fontWeight: 500
          }}>
            📍 {location}
          </div>
          {loading ? (
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-tertiary)' 
            }}>
              加载中...
            </div>
          ) : weather ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.2rem' }}>
                  {getWeatherIcon(weather.condition)}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  {weather.temperature} {weather.condition}
                </div>
              </div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: 'var(--text-tertiary)',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <span>💧 {weather.humidity}</span>
                <span>🌬️ {weather.wind}</span>
              </div>
            </div>
          ) : (
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-tertiary)' 
            }}>
              暂无数据
            </div>
          )}
        </div>
        
        {/* Forecast Weather Cards */}
        {weather && weather.forecast && weather.forecast.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {weather.forecast.slice(0, 3).map((day, index) => (
              <div 
                key={`${day.date}-${index}`}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.125rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '60px',
                  alignItems: 'center'
                }}>
                <div style={{ 
                  fontSize: '0.6rem', 
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  {day.date}
                </div>
                <div style={{ 
                  fontSize: '0.55rem', 
                  color: 'var(--text-tertiary)'
                }}>
                  {day.dayOfWeek}
                </div>
                <div style={{ fontSize: '1rem', margin: '0.25rem 0' }}>
                  {getWeatherIcon(day.condition)}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  marginTop: '0.125rem'
                }}>
                  {day.temperature}
                </div>
                <div style={{ 
                  fontSize: '0.55rem', 
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {day.condition}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
