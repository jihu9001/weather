// WeatherAPI配置
const CONFIG = {
    // WeatherAPI Key
    apiKey: '891aafbb098b43fbaf850924261501',

    // WeatherAPI基础URL
    apiBaseUrl: 'http://api.weatherapi.com/v1',

    // 缓存配置（5分钟）
    cacheConfig: {
        enabled: true,
        duration: 5 * 60 * 1000,
        prefix: 'weather_cache_'
    },

    // 主要展示城市列表（使用城市名）
    mainCities: [
        { name: 'Beijing', adcode: '110100' },
        { name: 'Shanghai', adcode: '310100' },
        { name: 'Guangzhou', adcode: '440100' },
        { name: 'Shenzhen', adcode: '440300' },
        { name: 'Hangzhou', adcode: '330100' },
        { name: 'Chengdu', adcode: '510100' }
    ],

    // 常用城市列表
    quickCities: [
        { name: 'Beijing' },
        { name: 'Shanghai' },
        { name: 'Guangzhou' },
        { name: 'Shenzhen' },
        { name: 'Hangzhou' },
        { name: 'Chengdu' },
        { name: 'Wuhan' },
        { name: 'Chongqing' },
        { name: "Xi'an" },
        { name: 'Nanjing' }
    ],

    // 天气图标映射
    weatherIcons: {
        'Sunny': '☀️', 'Clear': '☀️',
        'Partly cloudy': '⛅', 'Cloudy': '☁️', 'Overcast': '☁️',
        'Rain': '🌧️', 'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Snow': '❄️', 'Light snow': '❄️', 'Moderate snow': '❄️', 'Heavy snow': '⛄',
        'Thunder': '⛈️', 'Thunderstorm': '⛈️',
        'Fog': '🌫️', 'Mist': '🌫️',
        'Haze': '🌫️'
    }
};
