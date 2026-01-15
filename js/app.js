/**
 * Weather Query Application
 * API: https://www.weatherapi.com/docs/
 */
(function() {
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

    // Initialize
    function init() {
        clearCache();
        loadPopularCities();
        bindEvents();
    }

    // Clear cache
    function clearCache() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CONFIG.cache.prefix))
            .forEach(key => localStorage.removeItem(key));
    }

    // Load popular cities
    async function loadPopularCities() {
        elements.citiesGrid.innerHTML = '';
        elements.loading.classList.remove('hidden');

        const cities = CONFIG.popularCities;

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            try {
                const result = await WeatherAPI.current(city);
                if (result.success) {
                    const weather = WeatherFormatter.formatCurrent(result.data);
                    const card = createCityCard(weather, city);
                    elements.citiesGrid.appendChild(card);
                }
            } catch (e) {
                console.error('Load failed:', city, e.message);
            }
        }

        elements.loading.classList.add('hidden');
    }

    // Create city card
    function createCityCard(weather, cityName) {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;
        
        card.innerHTML = `
            <div class="city-card-header">
                <span class="city-name">${weather.city}</span>
                <span class="city-update">${weather.localTime?.split(' ')[1] || ''}</span>
            </div>
            <div class="city-weather">
                <span class="weather-icon-large">${WeatherFormatter.getIcon(weather.condition)}</span>
                <div class="weather-temp-info">
                    <span class="temp-value">${weather.temp}</span>
                    <span class="temp-unit">C</span>
                </div>
                <span class="weather-desc">${weather.condition}</span>
            </div>
            <div class="city-weather-details">
                <div class="detail-item">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${weather.windDir}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Speed</span>
                    <span class="detail-value">${weather.wind}km/h</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${weather.humidity}%</span>
                </div>
            </div>
        `;

        card.onclick = function() {
            showWeatherDetail(cityName);
        };

        return card;
    }

    // Show weather detail
    async function showWeatherDetail(cityName) {
        elements.weatherDetail.classList.remove('hidden');

        const [currentResult, forecastResult] = await Promise.all([
            WeatherAPI.current(cityName),
            WeatherAPI.forecast(cityName, 7)
        ]);

        if (currentResult.success) {
            renderWeatherDetail(WeatherFormatter.formatCurrent(currentResult.data));
        }

        if (forecastResult.success) {
            const forecast = WeatherFormatter.formatForecast(forecastResult.data);
            renderForecast(forecast.slice(1, 5));
        }

        const mainSection = $('main-cities-weather');
        mainSection.parentNode.insertBefore(elements.weatherDetail, mainSection);
        elements.weatherDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Render weather detail
    function renderWeatherDetail(weather) {
        $('detail-city').textContent = weather.country + ' - ' + weather.city;

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
                    <div class="detail-city-info">${weather.country} - ${weather.city}</div>
                    <div class="detail-update-time">Updated: ${weather.lastUpdated}</div>
                </div>
            </div>
            <div class="detail-weather-grid">
                <div class="detail-weather-item">
                    <span class="label">Wind</span>
                    <span class="value">${weather.windDir}</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Speed</span>
                    <span class="value">${weather.wind} km/h</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Humidity</span>
                    <span class="value">${weather.humidity}%</span>
                </div>
            </div>
        `;
    }

    // Render forecast
    function renderForecast(forecastList) {
        const container = $('forecast-list');
        container.innerHTML = '';

        forecastList.forEach(day => {
            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `
                <span class="forecast-date">${day.weekday} ${day.date.split('-').slice(1).join('-')}</span>
                <span class="forecast-icon">${WeatherFormatter.getIcon(day.condition)}</span>
                <span class="forecast-weather">${day.condition}</span>
                <span class="forecast-temp">${day.tempMin}° / ${day.tempMax}°</span>
            `;
            container.appendChild(item);
        });
    }

    // Search city
    async function searchCity() {
        const city = elements.cityInput.value.trim();
        if (!city) return showError('Please enter a city name');
        showWeatherDetail(city);
    }

    // Bind events
    function bindEvents() {
        elements.searchBtn.onclick = searchCity;

        elements.cityInput.onkeypress = function(e) {
            if (e.key === 'Enter') searchCity();
        };

        elements.quickCities.onclick = function(e) {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };

        elements.refreshBtn.onclick = function() {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;">↻</span> Loading...';
            loadPopularCities().then(function() {
                elements.refreshBtn.disabled = false;
                elements.refreshBtn.innerHTML = '↻ Refresh';
            });
        };

        elements.closeDetail.onclick = function() {
            elements.weatherDetail.classList.add('hidden');
        };
    }

    // Show error
    function showError(msg) {
        elements.errorMsg.textContent = msg;
        elements.error.classList.remove('hidden');
        setTimeout(function() {
            elements.error.classList.add('hidden');
        }, 3000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
