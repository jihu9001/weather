// API调用模块
const API = {
    // 地理编码：将城市名转换为城市编码
    async geocode(city) {
        const params = new URLSearchParams({
            address: city,
            key: CONFIG.apiKey
        });

        const url = `${CONFIG.apiBaseUrl}/geocode/geo?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                return {
                    success: true,
                    adcode: data.geocodes[0].adcode,
                    city: data.geocodes[0].city || data.geocodes[0].district,
                    formattedAddress: data.geocodes[0].formatted_address
                };
            } else {
                return {
                    success: false,
                    error: data.info || '未找到该城市'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: '网络请求失败，请检查网络连接'
            };
        }
    },

    // 获取实时天气
    async getLiveWeather(adcode) {
        const params = new URLSearchParams({
            city: adcode,
            extensions: 'base',
            key: CONFIG.apiKey
        });

        const url = `${CONFIG.apiBaseUrl}/weather/weatherInfo?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === '1' && data.lives && data.lives.length > 0) {
                return {
                    success: true,
                    data: data.lives[0]
                };
            } else {
                return {
                    success: false,
                    error: data.info || '获取天气信息失败'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: '网络请求失败，请检查网络连接'
            };
        }
    },

    // 获取天气预报
    async getForecast(adcode) {
        const params = new URLSearchParams({
            city: adcode,
            extensions: 'all',
            key: CONFIG.apiKey
        });

        const url = `${CONFIG.apiBaseUrl}/weather/weatherInfo?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === '1' && data.forecasts && data.forecasts.length > 0) {
                return {
                    success: true,
                    data: data.forecasts[0].casts
                };
            } else {
                return {
                    success: false,
                    error: data.info || '获取天气预报失败'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: '网络请求失败，请检查网络连接'
            };
        }
    }
};
