// 主应用逻辑
(function() {
    // DOM元素缓存
    const elements = {
        cityInput: document.getElementById('city-input'),
        searchBtn: document.getElementById('search-btn'),
        citiesGrid: document.getElementById('cities-grid'),
        quickCities: document.getElementById('quick-cities'),
        refreshBtn: document.getElementById('refresh-main'),
        weatherDetail: document.getElementById('weather-detail'),
        closeDetailBtn: document.getElementById('close-detail'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        errorMessage: document.getElementById('error-message')
    };

    // 初始化
    function init() {
        console.log('初始化应用...');

        // 加载主要城市天气
        loadMainCitiesWeather();

        // 绑定快捷城市点击事件
        bindQuickCityEvents();

        // 绑定搜索事件
        bindSearchEvents();

        console.log('初始化完成');
    }

    // 加载主要城市天气
    async function loadMainCitiesWeather() {
        console.log('加载热门城市天气...');
        elements.citiesGrid.innerHTML = '';

        const cities = CONFIG.mainCities;

        for (const city of cities) {
            try {
                const card = await createCityCard(city.name, city.adcode);
                if (card) {
                    elements.citiesGrid.appendChild(card);
                }
            } catch (error) {
                console.error(`加载${city.name}天气失败:`, error);
            }
        }
    }

    // 创建城市天气卡片
    async function createCityCard(cityName, adcode) {
        console.log(`获取${cityName}天气, adcode:`, adcode);

        // 如果没有adcode，先通过地理编码获取
        let finalAdcode = adcode;
        if (!finalAdcode) {
            const geocodeResult = await API.geocode(cityName);
            if (!geocodeResult.success) {
                console.error(`获取${cityName}编码失败:`, geocodeResult.error);
                return null;
            }
            finalAdcode = geocodeResult.adcode;
        }

        const result = await API.getLiveWeather(finalAdcode);

        if (!result.success) {
            console.error(`获取${cityName}天气失败:`, result.error);
            return null;
        }

        const data = result.data;
        console.log(`${cityName}天气数据:`, data);

        const card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;
        card.dataset.adcode = finalAdcode;

        card.innerHTML = `
            <div class="city-card-header">
                <span class="city-name">${data.city}</span>
                <span class="city-update">${Utils.formatTime(data.reporttime)}</span>
            </div>
            <div class="city-weather">
                <span class="weather-icon-large">${Utils.getWeatherIcon(data.weather)}</span>
                <div class="weather-temp-info">
                    <span class="temp-value">${data.temperature}</span>
                    <span class="temp-unit">°C</span>
                </div>
                <span class="weather-desc">${data.weather}</span>
            </div>
            <div class="city-weather-details">
                <div class="detail-item">
                    <span class="detail-label">风向</span>
                    <span class="detail-value">${data.winddirection}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">风力</span>
                    <span class="detail-value">${data.windpower}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">湿度</span>
                    <span class="detail-value">${data.humidity}%</span>
                </div>
            </div>
        `;

        // 点击查看详情
        card.onclick = function() {
            showWeatherDetail(cityName, finalAdcode);
        };

        return card;
    }

    // 显示天气详情
    async function showWeatherDetail(cityName, adcode) {
        console.log('显示天气详情:', cityName, adcode);

        // 获取实时天气和预报
        const liveResult = await API.getLiveWeather(adcode);
        const forecastResult = await API.getForecast(adcode);

        console.log('实时天气:', liveResult);
        console.log('预报天气:', forecastResult);

        if (liveResult.success) {
            renderCurrentWeatherDetail(liveResult.data);
        }

        if (forecastResult.success) {
            renderForecast(forecastResult.data.slice(1, 5));
        }

        // 显示详情区域
        elements.weatherDetail.classList.remove('hidden');

        // 将详情区域移动到热门城市天气上方
        const mainCitiesSection = document.getElementById('main-cities-weather');
        mainCitiesSection.parentNode.insertBefore(elements.weatherDetail, mainCitiesSection);

        // 滚动到详情区域
        elements.weatherDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 渲染实时天气详情
    function renderCurrentWeatherDetail(data) {
        document.getElementById('detail-city').textContent = data.province + ' ' + data.city;

        const card = document.getElementById('current-weather-card');
        card.innerHTML = `
            <div class="detail-weather-main">
                <div class="detail-weather-left">
                    <span class="detail-weather-icon">${Utils.getWeatherIcon(data.weather)}</span>
                    <div>
                        <div class="detail-temp">${data.temperature}°</div>
                        <div class="detail-weather-desc">${data.weather}</div>
                    </div>
                </div>
                <div class="detail-weather-info">
                    <div class="detail-city-info">${data.province} · ${data.city}</div>
                    <div class="detail-update-time">更新时间: ${data.reporttime}</div>
                </div>
            </div>
            <div class="detail-weather-grid">
                <div class="detail-weather-item">
                    <span class="label">风向</span>
                    <span class="value">${data.winddirection}</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">风力</span>
                    <span class="value">${data.windpower}</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">湿度</span>
                    <span class="value">${data.humidity}%</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">体感温度</span>
                    <span class="value">${data.temperature}°C</span>
                </div>
            </div>
        `;
    }

    // 渲染天气预报
    function renderForecast(forecastData) {
        const forecastList = document.getElementById('forecast-list');
        forecastList.innerHTML = '';

        forecastData.forEach(function(day) {
            const item = document.createElement('div');
            item.className = 'forecast-item';

            item.innerHTML = `
                <span class="forecast-date">${Utils.getWeekday(day.date)} ${Utils.formatDate(day.date)}</span>
                <span class="forecast-icon">${Utils.getWeatherIcon(day.dayweather)}</span>
                <span class="forecast-weather">${day.dayweather}</span>
                <span class="forecast-temp">${day.nighttemp}° / ${day.daytemp}°</span>
            `;

            forecastList.appendChild(item);
        });
    }

    // 绑定快捷城市点击事件
    function bindQuickCityEvents() {
        console.log('绑定快捷城市点击事件');

        elements.quickCities.onclick = function(e) {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                console.log('点击城市:', city);

                // 查找城市信息
                const cityInfo = CONFIG.quickCities.find(function(c) {
                    return c.name === city;
                });

                if (cityInfo) {
                    elements.cityInput.value = city;
                    showWeatherDetail(cityInfo.name, cityInfo.adcode);
                }
            }
        };
    }

    // 绑定搜索事件
    function bindSearchEvents() {
        console.log('绑定搜索事件');

        // 搜索按钮点击
        elements.searchBtn.onclick = function() {
            const city = elements.cityInput.value.trim();
            console.log('搜索城市:', city);
            if (city) {
                searchAndShowDetail(city);
            }
        };

        // 回车键搜索
        elements.cityInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                const city = elements.cityInput.value.trim();
                if (city) {
                    searchAndShowDetail(city);
                }
            }
        };

        // 刷新按钮
        elements.refreshBtn.onclick = function() {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.innerHTML = '⏳ 刷新中...';
            loadMainCitiesWeather().then(function() {
                elements.refreshBtn.disabled = false;
                elements.refreshBtn.innerHTML = '🔄 刷新';
            });
        };

        // 关闭详情
        elements.closeDetailBtn.onclick = function() {
            elements.weatherDetail.classList.add('hidden');
        };
    }

    // 搜索并显示详情
    async function searchAndShowDetail(city) {
        console.log('搜索并显示:', city);

        showLoading();

        try {
            // 获取城市编码
            const geocodeResult = await API.geocode(city);
            console.log('地理编码结果:', geocodeResult);

            if (!geocodeResult.success) {
                showError(geocodeResult.error);
                return;
            }

            // 显示天气详情
            await showWeatherDetail(geocodeResult.city, geocodeResult.adcode);

            hideLoading();

        } catch (error) {
            console.error('搜索天气失败:', error);
            showError('查询天气失败，请稍后重试');
        }
    }

    // 显示加载状态
    function showLoading() {
        elements.loading.classList.remove('hidden');
        elements.error.classList.add('hidden');
        elements.weatherDetail.classList.add('hidden');
    }

    // 隐藏加载状态
    function hideLoading() {
        elements.loading.classList.add('hidden');
    }

    // 显示错误信息
    function showError(message) {
        elements.loading.classList.add('hidden');
        elements.errorMessage.textContent = message;
        elements.error.classList.remove('hidden');

        // 3秒后自动隐藏
        setTimeout(function() {
            elements.error.classList.add('hidden');
        }, 3000);
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
