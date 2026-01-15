/**
 * WeatherAPI Service Module - Debug Version
 * No cache, detailed logging
 */
const WeatherAPI = {
    // Debug request without cache
    async request(endpoint, params = {}) {
        const url = new URL(`http://api.weatherapi.com/v1${endpoint}`);
        url.searchParams.set('key', CONFIG.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        console.log('API Request:', url.toString());

        try {
            const response = await fetch(url.toString(), { 
                signal: AbortSignal.timeout(10000) 
            });
            
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data.error || 'OK');
            
            if (data.error) {
                return { success: false, error: data.error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error.message);
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
