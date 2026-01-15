/**
 * WeatherAPI 配置
 * Docs: https://www.weatherapi.com/docs/
 */
const CONFIG = {
    // API配置
    apiKey: '891aafbb098b43fbaf850924261501',
    baseUrl: 'http://api.weatherapi.com/v1',
    
    // 缓存配置（5分钟）
    cache: {
        enabled: true,
        duration: 5 * 60 * 1000,
        prefix: 'weather_cache_'
    },

    // 热门城市（用于首页展示）
    popularCities: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Chengdu'
    ],

    // 快捷城市列表
    quickCities: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 
        'Hangzhou', 'Chengdu', 'Wuhan', 'Chongqing', "Xi'an", 'Nanjing'
    ],

    // 天气图标映射
    icons: {
        'Sunny': '☀️', 'Clear': '☀️',
        'Partly cloudy': '⛅', 'Cloudy': '☁️', 'Overcast': '☁️',
        'Rain': '🌧️', 'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Snow': '❄️', 'Light snow': '❄️', 'Moderate snow': '❄️', 'Heavy snow': '⛄',
        'Thunder': '⛈️', 'Thunderstorm': '⛈️',
        'Fog': '🌫️', 'Mist': '🌫️', 'Haze': '🌫️'
    },

    // 中英文城市名映射
    cityNames: {
        '北京': 'Beijing', '上海': 'Shanghai', '广州': 'Guangzhou',
        '深圳': 'Shenzhen', '杭州': 'Hangzhou', '成都': 'Chengdu',
        '武汉': 'Wuhan', '重庆': 'Chongqing', '西安': "Xi'an", '南京': 'Nanjing'
    },

    // 星期映射
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
};
