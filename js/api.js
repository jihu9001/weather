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

    // Build request URL
    buildUrl(endpoint, params) {
        const url = new URL(`${CONFIG.baseUrl}${endpoint}`);
        url.searchParams.set('key', CONFIG.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    },

    // Send request
    async request(endpoint, params = {}, useCache = true) {
        // Use stable cache key format: endpoint_q_city
        const city = params.q || 'unknown';
        const cacheKey = `${CONFIG.cache.prefix}${endpoint}_${city}`;
        
        if (useCache && CONFIG.cache.enabled) {
            const cached = this.getCache(cacheKey);
            if (cached) {
                console.log('Cache hit:', cacheKey);
                return { success: true, data: cached, fromCache: true };
            }
        }

        const url = this.buildUrl(endpoint, params);
        
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
            
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
            console.error('API request failed:', error.message);
            return { success: false, error: error.message };
        }
    },

    // Search city
    async search(q) {
        return this.request('/search.json', { q });
    },

    // Get current weather
    async current(q) {
        return this.request('/current.json', { q, lang: 'zh' });
    },

    // Get forecast
    async forecast(q, days = 7) {
        return this.request('/forecast.json', { q, days, lang: 'zh' });
    }
};

/**
 * Weather Data Formatter
 */
const WeatherFormatter = {
    // Format current weather
    formatCurrent(data) {
        const location = data.location || {};
        const current = data.current || {};
        const condition = current.condition || {};

        return {
            city: location.name || 'Unknown',
            country: location.country || '',
            region: location.region || '',
            temp: Math.round(current.temp_c) || 0,
            feelsLike: Math.round(current.feelslike_c) || 0,
            condition: condition.text || 'Unknown',
            code: condition.code || 0,
            wind: current.wind_kph || 0,
            windDir: current.wind_dir || '',
            windDegree: current.wind_degree || 0,
            pressure: current.pressure_mb || 0,
            humidity: current.humidity || 0,
            visibility: current.vis_km || 0,
            uv: current.uv || 0,
            gust: current.gust_kph || 0,
            isDay: current.is_day === 1,
            lastUpdated: current.last_updated || '',
            localTime: location.localtime || ''
        };
    },

    // Format forecast data
    formatForecast(data) {
        if (!data.forecast || !data.forecast.forecastday) {
            return [];
        }

        return data.forecast.forecastday.map(item => {
            const day = item.day || {};
            const condition = day.condition || {};
            const date = new Date(item.date);

            return {
                date: item.date,
                weekday: CONFIG.weekdays[date.getDay()] || '',
                tempMax: Math.round(day.maxtemp_c) || 0,
                tempMin: Math.round(day.mintemp_c) || 0,
                tempAvg: Math.round(day.avgtemp_c) || 0,
                condition: condition.text || 'Unknown',
                code: condition.code || 0,
                windMax: day.maxwind_kph || 0,
                precip: day.totalprecip_mm || 0,
                humidity: day.avghumidity || 0,
                uv: day.uv || 0,
                chanceOfRain: day.daily_chance_of_rain || 0,
                chanceOfSnow: day.daily_chance_of_snow || 0,
                sunrise: item.astro?.sunrise || '',
                sunset: item.astro?.sunset || ''
            };
        });
    },

    // Get weather icon
    getIcon(condition) {
        if (!condition) return '🌤️';
        return CONFIG.icons[condition] || '🌤️';
    }
};
