/**
 * 天气查询应用
 * API: https://www.weatherapi.com/docs/
 */
(function() {
    // DOM 元素
    const $ = id => document.getElementById(id);
    const elements = {
        cityInput: $('city-input'),
        searchBtn: $('search-btn'),
        citiesGrid: $('cities-grid'),
        quickCities: $('quick-cities'),
        refreshBtn: $('refresh-main'),
        weatherDetail: $('weather-detail'),
        closeDetail: $('close-detail'),
        loading: $('loading'),
        error: $('error'),
        errorMsg: $('error-message')
    };

    // 城市名转换（中文 → 英文）
    function toEnglishName(cnName) {
        return CONFIG.cityNames[cnName] || cnName;
    }

    // 初始化
    function init() {
        console.log('🌤️ 天气应用启动');
        
        // 清除旧缓存（兼容旧数据格式）
        clearCache();
        
        loadPopularCities();
        bindEvents();
        console.log('✓ 初始化完成');
    }

    // 加载热门城市天气
    async function loadPopularCities() {
        console.log('📍 加载热门城市...');
        elements.citiesGrid.innerHTML = '';

        const cities = CONFIG.popularCities;
        
        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            console.log(`[${i + 1}/${cities.length}] ${city}`);

            try {
                const result = await WeatherAPI.current(city);
                if (result.success) {
                    const weather = WeatherFormatter.formatCurrent(result.data);
                    const card = createCityCard(weather, city);
                    elements.citiesGrid.appendChild(card);
                    console.log(`✓ ${city}: ${weather.temp}°C, ${weather.condition}`);
                } else {
                    console.warn(`✗ ${city}: ${result.error}`);
                }
            } catch (e) {
                console.error(`✗ ${city}: ${e.message}`);
            }
        }
    }

    // 创建城市卡片
    function createCityCard(weather, cityName) {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;
        
        card.innerHTML = `
            <div class="city-card-header">
                <span class="city-name">${weather.city}</span>
                <span class="city-update">${formatTime(weather.localTime)}</span>
            </div>
            <div class="city-weather">
                <span class="weather-icon-large">${WeatherFormatter.getIcon(weather.condition)}</span>
                <div class="weather-temp-info">
                    <span class="temp-value">${weather.temp}</span>
                    <span class="temp-unit">°C</span>
                </div>
                <span class="weather-desc">${weather.condition}</span>
            </div>
            <div class="city-weather-details">
                <div class="detail-item">
                    <span class="detail-label">风向</span>
                    <span class="detail-value">${weather.windDir}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">风力</span>
                    <span class="detail-value">${weather.wind}km/h</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">湿度</span>
                    <span class="detail-value">${weather.humidity}%</span>
                </div>
            </div>
        `;

        card.onclick = () => showWeatherDetail(cityName);
        return card;
    }

    // 显示天气详情
    async function showWeatherDetail(cityName) {
        console.log(`🔍 查看 ${cityName} 详情`);

        const enName = toEnglishName(cityName);
        
        // 并行请求实时天气和预报
        const [currentResult, forecastResult] = await Promise.all([
            WeatherAPI.current(enName),
            WeatherAPI.forecast(enName, 7)
        ]);

        if (currentResult.success) {
            renderWeatherDetail(WeatherFormatter.formatCurrent(currentResult.data));
        }

        if (forecastResult.success) {
            const forecast = WeatherFormatter.formatForecast(forecastResult.data);
            renderForecast(forecast.slice(1, 5)); // 跳过今天
        }

        // 显示详情区域
        elements.weatherDetail.classList.remove('hidden');
        
        // 移动到热门城市上方
        const mainSection = $('main-cities-weather');
        mainSection.parentNode.insertBefore(elements.weatherDetail, mainSection);
        
        elements.weatherDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 渲染天气详情
    function renderWeatherDetail(weather) {
        $('detail-city').textContent = `${weather.country} · ${weather.city}`;

        const card = $('current-weather-card');
        card.innerHTML = `
            <div class="detail-weather-main">
                <div class="detail-weather-left">
                    <span class="detail-weather-icon">${WeatherFormatter.getIcon(weather.condition)}</span>
                    <div>
                        <div class="detail-temp">${weather.temp}°</div>
                        <div class="detail-weather-desc">${weather.condition}</div>
                    </div>
                </div>
                <div class="detail-weather-info">
                    <div class="detail-city-info">${weather.country} · ${weather.city}</div>
                    <div class="detail-update-time">更新时间: ${weather.lastUpdated}</div>
                </div>
            </div>
            <div class="detail-weather-grid">
                <div class="detail-weather-item">
                    <span class="label">体感温度</span>
                    <span class="value">${weather.feelsLike}°C</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">风向</span>
                    <span class="value">${weather.windDir} ${weather.windDegree}°</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">风速</span>
                    <span class="value">${weather.wind} km/h</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">湿度</span>
                    <span class="value">${weather.humidity}%</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">能见度</span>
                    <span class="value">${weather.visibility} km</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">气压</span>
                    <span class="value">${weather.pressure} mb</span>
                </div>
            </div>
        `;
    }

    // 渲染预报列表
    function renderForecast(forecastList) {
        const container = $('forecast-list');
        container.innerHTML = '';

        forecastList.forEach(day => {
            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `
                <span class="forecast-date">${day.weekday} ${formatDate(day.date)}</span>
                <span class="forecast-icon">${WeatherFormatter.getIcon(day.condition)}</span>
                <span class="forecast-weather">${day.condition}</span>
                <span class="forecast-temp">${day.tempMin}° / ${day.tempMax}°</span>
            `;
            container.appendChild(item);
        });
    }

    // 搜索城市
    async function searchCity() {
        const city = elements.cityInput.value.trim();
        if (!city) return showError('请输入城市名称');

        console.log(`🔍 搜索: ${city}`);
        showLoading();

        try {
            const enName = toEnglishName(city);
            await showWeatherDetail(enName);
            hideLoading();
        } catch (e) {
            showError(`搜索失败: ${e.message}`);
        }
    }

    // 绑定事件
    function bindEvents() {
        // 搜索按钮
        elements.searchBtn.onclick = searchCity;

        // 回车搜索
        elements.cityInput.onkeypress = e => {
            if (e.key === 'Enter') searchCity();
        };

        // 快捷城市点击
        elements.quickCities.onclick = e => {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };

        // 刷新按钮
        elements.refreshBtn.onclick = async () => {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.textContent = '⏳ 刷新中...';
            await loadPopularCities();
            elements.refreshBtn.disabled = false;
            elements.refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> 刷新';
        };

        // 关闭详情
        elements.closeDetail.onclick = () => {
            elements.weatherDetail.classList.add('hidden');
        };
    }

    // 格式化时间
    function formatTime(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(' ');
        return parts.length === 2 ? parts[1].substring(0, 5) : timeStr;
    }

    // 格式化日期
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
    }

    // 清除缓存（用于调试）
    function clearCache() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CONFIG.cache.prefix))
            .forEach(key => localStorage.removeItem(key));
        console.log('✓ 缓存已清除');
    }

    // 显示加载
    function showLoading() {
        elements.loading.classList.remove('hidden');
        elements.error.classList.add('hidden');
        elements.weatherDetail.classList.add('hidden');
    }

    // 隐藏加载
    function hideLoading() {
        elements.loading.classList.add('hidden');
    }

    // 显示错误
    function showError(msg) {
        elements.loading.classList.add('hidden');
        elements.errorMsg.textContent = msg;
        elements.error.classList.remove('hidden');
        setTimeout(() => elements.error.classList.add('hidden'), 3000);
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
