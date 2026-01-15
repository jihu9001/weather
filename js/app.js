// 主应用逻辑
(function() {
    // DOM元素缓存
    var elements = {
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

    // 中英文城市映射
    var cityNameMap = {
        '北京': 'Beijing', '上海': 'Shanghai', '广州': 'Guangzhou',
        '深圳': 'Shenzhen', '杭州': 'Hangzhou', '成都': 'Chengdu',
        '武汉': 'Wuhan', '重庆': 'Chongqing', '西安': "Xi'an",
        '南京': 'Nanjing', 'beijing': 'Beijing', 'shanghai': 'Shanghai',
        'guangzhou': 'Guangzhou', 'shenzhen': 'Shenzhen',
        'hangzhou': 'Hangzhou', 'chengdu': 'Chengdu',
        'wuhan': 'Wuhan', 'chongqing': 'Chongqing',
        "xi'an": "Xi'an", 'xian': "Xi'an", 'nanjing': 'Nanjing'
    };

    // 获取英文城市名
    function getEnglishName(city) {
        var enName = cityNameMap[city];
        if (enName) return enName;
        // 如果是中文但没有映射，返回原值（WeatherAPI支持中文）
        return city;
    }

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

        var cities = CONFIG.mainCities;

        for (var i = 0; i < cities.length; i++) {
            var city = cities[i];
            var enName = getEnglishName(city.name);

            console.log('[' + (i + 1) + '/' + cities.length + '] 加载: ' + city.name);

            try {
                var result = await API.getLiveWeather(enName);
                if (result.success) {
                    var card = createCityCard(result.data, enName);
                    if (card) {
                        elements.citiesGrid.appendChild(card);
                        console.log('✓ ' + city.name + ' 加载成功');
                    }
                } else {
                    console.log('✗ ' + city.name + ' 失败: ' + result.error);
                }
            } catch (e) {
                console.error('✗ ' + city.name + ' 异常: ' + e.message);
            }
        }

        console.log('加载完成');
    }

    // 创建城市天气卡片
    function createCityCard(data, cityName) {
        if (!data) return null;

        var card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;

        var temp = data.temperature || '--';
        var icon = getWeatherIcon(data.weather);

        card.innerHTML =
            '<div class="city-card-header">' +
                '<span class="city-name">' + (data.city || cityName) + '</span>' +
                '<span class="city-update">' + Utils.formatTime(data.reporttime) + '</span>' +
            '</div>' +
            '<div class="city-weather">' +
                '<span class="weather-icon-large">' + icon + '</span>' +
                '<div class="weather-temp-info">' +
                    '<span class="temp-value">' + temp + '</span>' +
                    '<span class="temp-unit">°C</span>' +
                '</div>' +
                '<span class="weather-desc">' + (data.weather || '--') + '</span>' +
            '</div>' +
            '<div class="city-weather-details">' +
                '<div class="detail-item">' +
                    '<span class="detail-label">风向</span>' +
                    '<span class="detail-value">' + (data.winddirection || '--') + '</span>' +
                '</div>' +
                '<div class="detail-item">' +
                    '<span class="detail-label">风力</span>' +
                    '<span class="detail-value">' + (data.windpower || '--') + '</span>' +
                '</div>' +
                '<div class="detail-item">' +
                    '<span class="detail-label">湿度</span>' +
                    '<span class="detail-value">' + (data.humidity || '--') + '%</span>' +
                '</div>' +
            '</div>';

        card.onclick = function() {
            showWeatherDetail(cityName);
        };

        return card;
    }

    // 获取天气图标
    function getWeatherIcon(weather) {
        if (!weather) return '🌤️';
        return CONFIG.weatherIcons[weather] || '🌤️';
    }

    // 显示天气详情
    async function showWeatherDetail(cityName) {
        var enName = getEnglishName(cityName);
        console.log('显示天气详情:', cityName, enName);

        // 获取实时天气和预报
        var liveResult = await API.getLiveWeather(enName);
        var forecastResult = await API.getForecast(enName, 7);

        if (liveResult.success) {
            renderCurrentWeatherDetail(liveResult.data);
        }

        if (forecastResult.success && forecastResult.data.length > 0) {
            renderForecast(forecastResult.data.slice(1, 5));
        }

        // 显示详情区域
        elements.weatherDetail.classList.remove('hidden');

        // 将详情区域移动到热门城市天气上方
        var mainCitiesSection = document.getElementById('main-cities-weather');
        mainCitiesSection.parentNode.insertBefore(elements.weatherDetail, mainCitiesSection);

        // 滚动到详情区域
        elements.weatherDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 渲染实时天气详情
    function renderCurrentWeatherDetail(data) {
        document.getElementById('detail-city').textContent = data.city || '未知城市';

        var card = document.getElementById('current-weather-card');
        card.innerHTML =
            '<div class="detail-weather-main">' +
                '<div class="detail-weather-left">' +
                    '<span class="detail-weather-icon">' + getWeatherIcon(data.weather) + '</span>' +
                    '<div>' +
                        '<div class="detail-temp">' + data.temperature + '°</div>' +
                        '<div class="detail-weather-desc">' + data.weather + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="detail-weather-info">' +
                    '<div class="detail-city-info">' + data.province + ' · ' + data.city + '</div>' +
                    '<div class="detail-update-time">更新时间: ' + data.reporttime + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="detail-weather-grid">' +
                '<div class="detail-weather-item">' +
                    '<span class="label">风向</span>' +
                    '<span class="value">' + data.winddirection + '</span>' +
                '</div>' +
                '<div class="detail-weather-item">' +
                    '<span class="label">风力</span>' +
                    '<span class="value">' + data.windpower + '</span>' +
                '</div>' +
                '<div class="detail-weather-item">' +
                    '<span class="label">湿度</span>' +
                    '<span class="value">' + data.humidity + '%</span>' +
                '</div>' +
                '<div class="detail-weather-item">' +
                    '<span class="label">体感温度</span>' +
                    '<span class="value">' + data.temperature + '°C</span>' +
                '</div>' +
            '</div>';
    }

    // 渲染天气预报
    function renderForecast(forecastData) {
        var forecastList = document.getElementById('forecast-list');
        forecastList.innerHTML = '';

        for (var i = 0; i < forecastData.length; i++) {
            var day = forecastData[i];
            var item = document.createElement('div');
            item.className = 'forecast-item';

            item.innerHTML =
                '<span class="forecast-date">' + (day.week || '') + ' ' + Utils.formatDate(day.date) + '</span>' +
                '<span class="forecast-icon">' + getWeatherIcon(day.dayweather) + '</span>' +
                '<span class="forecast-weather">' + day.dayweather + '</span>' +
                '<span class="forecast-temp">' + day.nighttemp + '° / ' + day.daytemp + '°</span>';

            forecastList.appendChild(item);
        }
    }

    // 绑定快捷城市点击事件
    function bindQuickCityEvents() {
        elements.quickCities.onclick = function(e) {
            if (e.target.classList.contains('city-tag')) {
                var city = e.target.dataset.city;
                var enName = getEnglishName(city);

                console.log('点击快捷城市:', city, enName);

                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };
    }

    // 绑定搜索事件
    function bindSearchEvents() {
        // 搜索按钮点击
        elements.searchBtn.onclick = function() {
            var city = elements.cityInput.value.trim();
            if (city) {
                searchAndShowDetail(city);
            }
        };

        // 回车键搜索
        elements.cityInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                var city = elements.cityInput.value.trim();
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
        console.log('搜索:', city);
        showLoading();

        try {
            // WeatherAPI直接使用城市名
            var enName = getEnglishName(city);
            await showWeatherDetail(enName);
            hideLoading();
        } catch (error) {
            console.error('搜索失败:', error);
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
