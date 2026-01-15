/**
 * WeatherAPI Configuration
 * Docs: https://www.weatherapi.com/docs/
 */
const CONFIG = {
    // API Configuration
    apiKey: '891aafbb098b43fbaf850924261501',
    baseUrl: 'https://api.weatherapi.com/v1',
    
    // Cache Configuration (5 minutes)
    cache: {
        enabled: true,
        duration: 5 * 60 * 1000,
        prefix: 'weather_'
    },

    // 16 Major Cities in China (API names)
    popularCities: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 
        'Hangzhou', 'Chengdu', 'Wuhan', 'Chongqing',
        'Xian', 'Nanjing', 'Tianjin', 'Suzhou',
        'Qingdao', 'Dalian', 'Xiamen', 'Shenyang'
    ],

    // City display names (shown in UI)
    cityDisplayNames: {
        'Beijing': 'Beijing',
        'Shanghai': 'Shanghai',
        'Guangzhou': 'Guangzhou',
        'Shenzhen': 'Shenzhen',
        'Hangzhou': 'Hangzhou',
        'Chengdu': 'Chengdu',
        'Wuhan': 'Wuhan',
        'Chongqing': 'Chongqing',
        'Xian': "Xi'an",
        'Nanjing': 'Nanjing',
        'Tianjin': 'Tianjin',
        'Suzhou': 'Suzhou',
        'Qingdao': 'Qingdao',
        'Dalian': 'Dalian',
        'Xiamen': 'Xiamen',
        'Shenyang': 'Shenyang'
    },

    // Weather Icons Mapping
    icons: {
        'Sunny': '☀️', 'Clear': '☀️',
        'Partly cloudy': '⛅', 'Cloudy': '☁️', 'Overcast': '☁️',
        'Rain': '🌧️', 'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Snow': '❄️', 'Light snow': '❄️', 'Moderate snow': '❄️', 'Heavy snow': '⛄',
        'Thunder': '⛈️', 'Thunderstorm': '⛈️',
        'Fog': '🌫️', 'Mist': '🌫️', 'Haze': '🌫️'
    },

    // Weekday mapping
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};
