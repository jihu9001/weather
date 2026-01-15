/**
 * WeatherAPI Service Module
 * Docs: https://www.weatherapi.com/docs/
 */
const WeatherAPI = {
    // Get cache
    getCache(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            const cached = JSON.parse(data);
            if (Date.now() > cached.expire) {
                localStorage.removeItem(key);
                return null;
            }
            return cached.data;
        } catch (e) {
            return null;
        }
    },

    // Set cache
    setCache(key, data) {
        try {
            const cacheData = {
                data: data,
                expire: Date.now() + CONFIG.cache.duration
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Cache write failed:', e);
        }
    },

    // Send request with cache
    async request(endpoint, params = {}, useCache = true) {
        const city = params.q || 'unknown';
        const cacheKey = `${CONFIG.cache.prefix}${endpoint}_${city}`;
        
        if (useCache && CONFIG.cache.enabled) {
            const cached = this.getCache(cacheKey);
            if (cached) {
                return { success: true, data: cached, fromCache: true };
            }
        }

        const url = new URL(`https://api.weatherapi.com/v1${endpoint}`);
        url.searchParams.set('key', CONFIG.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        try {
            const response = await fetch(url.toString(), { 
                signal: AbortSignal.timeout(10000) 
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            if (useCache && CONFIG.cache.enabled) {
                this.setCache(cacheKey, data);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get current weather
    async current(q) {
        return this.request('/current.json', { q, lang: 'zh' });
    },

    // Get forecast
    async forecast(q, days) {
        return this.request('/forecast.json', { q, days, lang: 'zh' });
    }
};

/**
 * Weather Data Formatter
 */
const WeatherFormatter = {
    formatCurrent(data) {
        const location = data.location || {};
        const current = data.current || {};
        const condition = current.condition || {};

        return {
            city: location.name || 'Unknown',
            country: location.country || '',
            temp: Math.round(current.temp_c) || 0,
            condition: condition.text || 'Unknown',
            wind: current.wind_kph || 0,
            windDir: current.wind_dir || '',
            humidity: current.humidity || 0,
            lastUpdated: current.last_updated || '',
            localTime: location.localtime || ''
        };
    },

    formatForecast(data) {
        if (!data.forecast || !data.forecast.forecastday) return [];

        return data.forecast.forecastday.map(item => {
            const day = item.day || {};
            const date = new Date(item.date);
            return {
                date: item.date,
                weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()],
                tempMax: Math.round(day.maxtemp_c) || 0,
                tempMin: Math.round(day.mintemp_c) || 0,
                condition: day.condition?.text || 'Unknown'
            };
        });
    },

    getIcon(condition) {
        if (!condition) return '🌤️';
        return CONFIG.icons[condition] || '🌤️';
    }
};
