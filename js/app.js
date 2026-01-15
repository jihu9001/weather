/**
 * Weather Query Application - Debug Version
 */
(function() {
    console.log('=== Weather App Starting ===');

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

    // Check elements exist
    console.log('Elements check:');
    Object.entries(elements).forEach(([key, el]) => {
        console.log(`  ${key}: ${el ? 'OK' : 'MISSING'}`);
    });

    // Initialize
    function init() {
        console.log('=== Init ===');
        loadPopularCities();
        bindEvents();
    }

    // Load popular cities
    async function loadPopularCities() {
        console.log('=== Loading Cities ===');
        elements.citiesGrid.innerHTML = '';
        elements.loading.classList.remove('hidden');

        const cities = CONFIG.popularCities;
        console.log('Cities to load:', cities);

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            console.log(`\n[${i+1}/${cities.length}] Loading ${city}...`);

            try {
                const result = await WeatherAPI.current(city);
                console.log('Result:', result.success ? 'SUCCESS' : 'FAILED', result.error || '');

                if (result.success) {
                    const weather = WeatherFormatter.formatCurrent(result.data);
                    console.log('Weather data:', weather.city, weather.temp + 'C', weather.condition);
                    
                    const card = createCityCard(weather, city);
                    elements.citiesGrid.appendChild(card);
                } else {
                    // Show error card
                    const errorCard = document.createElement('div');
                    errorCard.className = 'city-card';
                    errorCard.style.background = '#fee';
                    errorCard.innerHTML = `
                        <div class="city-card-header">
                            <span class="city-name">${city}</span>
                        </div>
                        <div style="padding: 20px; text-align: center; color: #c00;">
                            ❌ ${result.error || 'Load failed'}
                        </div>
                    `;
                    elements.citiesGrid.appendChild(errorCard);
                }
            } catch (e) {
                console.error('Exception:', e.message);
            }
        }

        elements.loading.classList.add('hidden');
        console.log('\n=== Loading Complete ===');
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
                    <span class="temp-unit">°C</span>
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
        console.log('\n=== Show Detail:', cityName, '===');
        elements.weatherDetail.classList.remove('hidden');

        const [currentResult, forecastResult] = await Promise.all([
            WeatherAPI.current(cityName),
            WeatherAPI.forecast(cityName, 7)
        ]);

        console.log('Current:', currentResult.success ? 'OK' : 'FAILED');
        console.log('Forecast:', forecastResult.success ? 'OK' : 'FAILED');

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

    // Render detail
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

    // Bind events
    function bindEvents() {
        elements.searchBtn.onclick = function() {
            const city = elements.cityInput.value.trim();
            if (city) {
                console.log('\n=== Search:', city, '===');
                showWeatherDetail(city);
            }
        };

        elements.cityInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                const city = elements.cityInput.value.trim();
                if (city) showWeatherDetail(city);
            }
        };

        elements.quickCities.onclick = function(e) {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                console.log('\n=== Quick Click:', city, '===');
                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };

        elements.refreshBtn.onclick = function() {
            loadPopularCities();
        };

        elements.closeDetail.onclick = function() {
            elements.weatherDetail.classList.add('hidden');
        };
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('=== Weather App Started ===');
})();
