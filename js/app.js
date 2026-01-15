/**
 * Weather Query Application
 * API: https://www.weatherapi.com/docs/
 */
(function() {
    // DOM Elements
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
        console.log('Weather App Started');
        clearCache();
        loadPopularCities();
        bindEvents();
        console.log('Initialization Complete');
    }

    // Clear old cache
    function clearCache() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CONFIG.cache.prefix))
            .forEach(key => localStorage.removeItem(key));
        console.log('Cache cleared');
    }

    // Load popular cities weather
    async function loadPopularCities() {
        console.log('Loading popular cities...');
        elements.citiesGrid.innerHTML = '';

        const cities = CONFIG.popularCities;
        let loaded = 0;
        let failed = 0;

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            console.log(`[${i + 1}/${cities.length}] Loading ${city}`);

            try {
                const result = await WeatherAPI.current(city);
                if (result.success) {
                    const weather = WeatherFormatter.formatCurrent(result.data);
                    const card = createCityCard(weather, city);
                    elements.citiesGrid.appendChild(card);
                    console.log(`OK: ${city} - ${weather.temp}C, ${weather.condition}`);
                    loaded++;
                } else {
                    console.warn(`Failed: ${city} - ${result.error}`);
                    failed++;
                }
            } catch (e) {
                console.error(`Error: ${city} - ${e.message}`);
                failed++;
            }
        }

        console.log(`Loaded: ${loaded}/${cities.length}, Failed: ${failed}`);
    }

    // Create city card
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

        card.onclick = () => showWeatherDetail(cityName);
        return card;
    }

    // Show weather detail
    async function showWeatherDetail(cityName) {
        console.log(`Viewing: ${cityName}`);

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

        elements.weatherDetail.classList.remove('hidden');
        
        const mainSection = $('main-cities-weather');
        mainSection.parentNode.insertBefore(elements.weatherDetail, mainSection);
        
        elements.weatherDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Render weather detail
    function renderWeatherDetail(weather) {
        $('detail-city').textContent = `${weather.country} - ${weather.city}`;

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
                    <span class="label">Feels Like</span>
                    <span class="value">${weather.feelsLike}C</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Wind</span>
                    <span class="value">${weather.windDir} ${weather.windDegree}°</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Speed</span>
                    <span class="value">${weather.wind} km/h</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Humidity</span>
                    <span class="value">${weather.humidity}%</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Visibility</span>
                    <span class="value">${weather.visibility} km</span>
                </div>
                <div class="detail-weather-item">
                    <span class="label">Pressure</span>
                    <span class="value">${weather.pressure} mb</span>
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
                <span class="forecast-date">${day.weekday} ${formatDate(day.date)}</span>
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

        console.log(`Searching: ${city}`);
        showLoading();

        try {
            await showWeatherDetail(city);
            hideLoading();
        } catch (e) {
            showError(`Search failed: ${e.message}`);
        }
    }

    // Bind events
    function bindEvents() {
        elements.searchBtn.onclick = searchCity;

        elements.cityInput.onkeypress = e => {
            if (e.key === 'Enter') searchCity();
        };

        elements.quickCities.onclick = e => {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };

        elements.refreshBtn.onclick = () => {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation: spin 1s linear infinite;"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Loading...';
            loadPopularCities().then(() => {
                elements.refreshBtn.disabled = false;
                elements.refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Refresh';
            });
        };

        elements.closeDetail.onclick = () => {
            elements.weatherDetail.classList.add('hidden');
        };
    }

    // Format time
    function formatTime(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(' ');
        return parts.length === 2 ? parts[1].substring(0, 5) : timeStr;
    }

    // Format date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
    }

    // Show loading
    function showLoading() {
        elements.loading.classList.remove('hidden');
        elements.error.classList.add('hidden');
        elements.weatherDetail.classList.add('hidden');
    }

    // Hide loading
    function hideLoading() {
        elements.loading.classList.add('hidden');
    }

    // Show error
    function showError(msg) {
        elements.loading.classList.add('hidden');
        elements.errorMsg.textContent = msg;
        elements.error.classList.remove('hidden');
        setTimeout(() => elements.error.classList.add('hidden'), 3000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
