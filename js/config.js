/**
 * WeatherAPI Configuration
 * Docs: https://www.weatherapi.com/docs/
 */
const CONFIG = {
    // API Configuration
    apiKey: '891aafbb098b43fbaf850924261501',
    baseUrl: 'http://api.weatherapi.com/v1',
    
    // Cache Configuration (5 minutes)
    cache: {
        enabled: true,
        duration: 5 * 60 * 1000,
        prefix: 'weather_'
    },

    // Popular Cities for homepage
    popularCities: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu'
    ],

    // Quick Cities List
    quickCities: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 
        'Hangzhou', 'Chengdu', 'Wuhan', 'Chongqing', 'Xi\'an', 'Nanjing'
    ],

    // Weather Icons Mapping
    icons: {
        // English
        'Sunny': '☀️', 'Clear': '☀️',
        'Partly cloudy': '⛅', 'Cloudy': '☁️', 'Overcast': '☁️',
        'Rain': '🌧️', 'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Snow': '❄️', 'Light snow': '❄️', 'Moderate snow': '❄️', 'Heavy snow': '⛄',
        'Thunder': '⛈️', 'Thunderstorm': '⛈️',
        'Fog': '🌫️', 'Mist': '🌫️', 'Haze': '🌫️',
        // Chinese (lang=zh response)
        '晴天': '☀️', '晴': '☀️', '晴朗': '☀️',
        '少云': '⛅', '局部多云': '⛅',
        '阴': '☁️', '阴天': '☁️',
        '小雨': '🌧️', '中雨': '🌧️', '大雨': '🌧️', '暴雨': '⛈️',
        '小雪': '❄️', '中雪': '❄️', '大雪': '❄️', '暴雪': '⛄',
        '雷阵雨': '⛈️',
        '雾': '🌫️', '薄雾': '🌫️',
        '霾': '🌫️', '沙尘暴': '🌪️'
    },

    // Weekday mapping
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};
