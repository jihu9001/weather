// WeatherAPI调用模块
const API = {
    // 缓存配置
    cacheConfig: {
        enabled: true,
        duration: 5 * 60 * 1000, // 5分钟
        prefix: 'weather_cache_'
    },

    // 获取缓存
    getCache: function(key) {
        try {
            var data = localStorage.getItem(key);
            if (!data) return null;

            var cached = JSON.parse(data);
            var now = Date.now();

            if (cached.expire && now > cached.expire) {
                localStorage.removeItem(key);
                return null;
            }

            return cached.data;
        } catch (e) {
            return null;
        }
    },

    // 设置缓存
    setCache: function(key, data) {
        try {
            var cacheData = {
                data: data,
                expire: Date.now() + this.cacheConfig.duration
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('缓存写入失败:', e);
        }
    },

    // 生成缓存key
    getCacheKey: function(type, city) {
        return this.cacheConfig.prefix + type + '_' + city;
    },

    // 带超时的fetch
    fetchWithTimeout: async function(url, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    },

    // 获取实时天气
    async getLiveWeather(city) {
        // 检查缓存
        if (this.cacheConfig.enabled) {
            var cacheKey = this.getCacheKey('live', city);
            var cached = this.getCache(cacheKey);
            if (cached) {
                console.log('📦 使用缓存:', city);
                return { success: true, data: cached, fromCache: true };
            }
        }

        const url = `${CONFIG.apiBaseUrl}/current.json?key=${CONFIG.apiKey}&q=${encodeURIComponent(city)}&lang=zh`;

        try {
            const response = await this.fetchWithTimeout(url, 8000);

            if (!response.ok) {
                return { success: false, error: 'API请求失败' };
            }

            const data = await response.json();

            if (data.error) {
                return { success: false, error: data.error.message };
            }

            // 格式化数据以匹配现有UI
            var formattedData = this.formatCurrentWeather(data);

            // 写入缓存
            if (this.cacheConfig.enabled) {
                var cacheKey = this.getCacheKey('live', city);
                this.setCache(cacheKey, formattedData);
            }

            return { success: true, data: formattedData };
        } catch (error) {
            console.error('获取天气失败:', error);
            return { success: false, error: '网络请求失败' };
        }
    },

    // 获取天气预报（未来7天）
    async getForecast(city, days) {
        if (!days) days = 7;

        // 检查缓存
        if (this.cacheConfig.enabled) {
            var cacheKey = this.getCacheKey('forecast', city);
            var cached = this.getCache(cacheKey);
            if (cached) {
                console.log('📦 使用缓存:', city);
                return { success: true, data: cached, fromCache: true };
            }
        }

        const url = `${CONFIG.apiBaseUrl}/forecast.json?key=${CONFIG.apiKey}&q=${encodeURIComponent(city)}&days=${days}&lang=zh`;

        try {
            const response = await this.fetchWithTimeout(url, 8000);

            if (!response.ok) {
                return { success: false, error: 'API请求失败' };
            }

            const data = await response.json();

            if (data.error) {
                return { success: false, error: data.error.message };
            }

            // 格式化预报数据
            var formattedForecast = this.formatForecast(data);

            // 写入缓存
            if (this.cacheConfig.enabled) {
                var cacheKey = this.getCacheKey('forecast', city);
                this.setCache(cacheKey, formattedForecast);
            }

            return { success: true, data: formattedForecast };
        } catch (error) {
            console.error('获取预报失败:', error);
            return { success: false, error: '网络请求失败' };
        }
    },

    // 格式化实时天气数据（匹配原有UI结构）
    formatCurrentWeather: function(data) {
        var location = data.location || {};
        var current = data.current || {};

        return {
            province: location.country === 'China' ? '中国' : (location.country || ''),
            city: location.name || location.city || '未知',
            weather: current.condition ? current.condition.text : '未知',
            temperature: current.temp_c || '0',
            winddirection: current.wind_dir || '无',
            windpower: current.wind_kph ? (current.wind_kph + ' km/h') : '0',
            humidity: current.humidity || '0',
            reporttime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            temperature_float: current.temp_c || '0',
            humidity_float: current.humidity || '0'
        };
    },

    // 格式化预报数据
    formatForecast: function(data) {
        if (!data.forecast || !data.forecast.forecastday) {
            return [];
        }

        return data.forecast.forecastday.map(function(day) {
            var date = day.date;
            var dayData = day.day || {};

            return {
                date: date,
                week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(date).getDay()],
                dayweather: dayData.condition ? dayData.condition.text : '未知',
                nightweather: dayData.condition ? dayData.condition.text : '未知',
                daytemp: dayData.maxtemp_c || '0',
                nighttemp: dayData.mintemp_c || '0',
                daywind: dayData.maxwind_kph ? dayData.maxwind_kph + 'km/h' : '微风',
                nightwind: '微风'
            };
        });
    }
};
