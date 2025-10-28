import React, { useState, useEffect } from 'react';

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

  // Load weather location from settings
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const response = await window.api.settings.get();
        if (response.ok && response.data?.weatherLocation) {
          setLocation(response.data.weatherLocation);
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

  // Fetch weather data (simulated - you can integrate real API)
  useEffect(() => {
    // Simulated weather data based on location setting
    // In production, integrate with weather API like OpenWeatherMap or QWeather
    const fetchWeather = async () => {
      try {
        // Simulated data with forecast
        const today = new Date();
        const forecast = [];
        
        // Generate 3 days of forecast
        for (let i = 1; i <= 3; i++) {
          const forecastDate = new Date(today);
          forecastDate.setDate(today.getDate() + i);
          
          // Simple forecast simulation
          const temps = ['19°C', '20°C', '18°C', '21°C', '17°C'];
          const conditions = ['多云', '晴', '小雨', '阴', '晴转多云'];
          
          forecast.push({
            date: forecastDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            dayOfWeek: forecastDate.toLocaleDateString('zh-CN', { weekday: 'short' }),
            temperature: temps[i % temps.length],
            condition: conditions[i % conditions.length]
          });
        }
        
        setWeather({
          temperature: '18°C',
          condition: '多云',
          humidity: '65%',
          wind: '东北风 3级',
          forecast
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [location]);

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
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(98, 0, 238, 0.1) 0%, rgba(3, 218, 198, 0.1) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      flex: 1,
      minWidth: 0,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem'
        }}>
          <div>📅 第{weekNumber}周 (年)</div>
          <div>💼 第{fiscalWeek}周 (财年)</div>
          <div>🗓️ 第{dayOfYear}天</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ 
        width: '1px', 
        height: '48px', 
        background: 'rgba(255, 255, 255, 0.1)' 
      }} />

      {/* Weather Section */}
      <div style={{ display: 'flex', gap: '0.75rem', minWidth: '220px' }}>
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
