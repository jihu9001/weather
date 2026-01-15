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

    // 天气图标映射（包含中英文）
    icons: {
        // 英文
        'Sunny': '☀️', 'Clear': '☀️',
        'Partly cloudy': '⛅', 'Cloudy': '☁️', 'Overcast': '☁️',
        'Rain': '🌧️', 'Light rain': '🌧️', 'Moderate rain': '🌧️', 'Heavy rain': '🌧️',
        'Snow': '❄️', 'Light snow': '❄️', 'Moderate snow': '❄️', 'Heavy snow': '⛄',
        'Thunder': '⛈️', 'Thunderstorm': '⛈️',
        'Fog': '🌫️', 'Mist': '🌫️', 'Haze': '🌫️',
        // 中文（WeatherAPI lang=zh 返回）
        '晴天': '☀️', '晴': '☀️', '晴朗': '☀️',
        '少云': '⛅', '局部多云': '⛅',
        '阴': '☁️', '阴天': '☁️',
        '小雨': '🌧️', '中雨': '🌧️', '大雨': '🌧️', '暴雨': '⛈️',
        '小雪': '❄️', '中雪': '❄️', '大雪': '❄️', '暴雪': '⛄',
        '雷阵雨': '⛈️',
        '雾': '🌫️', '薄雾': '🌫️',
        '霾': '🌫️', '沙尘暴': '🌪️'
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
