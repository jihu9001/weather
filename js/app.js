/**
 * Weather Query Application
 * Features: Skeleton loader, City autocomplete, Retry functionality
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
        skeletonLoader: $('skeleton-loader'),
        citySuggestions: $('city-suggestions'),
        error: $('error'),
        errorMsg: $('error-message')
    };

    // All available cities for autocomplete
    const allCities = CONFIG.popularCities;

    // Initialize
    function init() {
        showSkeleton();
        clearCache();
        loadPopularCities();
        bindEvents();
    }

    // Show skeleton loader
    function showSkeleton() {
        elements.skeletonLoader.classList.remove('hidden');
        elements.citiesGrid.innerHTML = '';
    }

    // Hide skeleton loader
    function hideSkeleton() {
        elements.skeletonLoader.classList.add('hidden');
    }

    // Clear cache
    function clearCache() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CONFIG.cache.prefix))
            .forEach(key => localStorage.removeItem(key));
    }

    // Load popular cities
    async function loadPopularCities() {
        showSkeleton();

        const cities = CONFIG.popularCities;
        let loaded = 0;
        let failed = 0;

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            const card = await loadCityWeather(city);
            if (card) {
                elements.citiesGrid.appendChild(card);
                loaded++;
            } else {
                failed++;
            }
        }

        hideSkeleton();

        if (loaded === 0 && failed > 0) {
            showError('Failed to load weather data. Please try again.');
        }
    }

    // Load single city weather
    async function loadCityWeather(cityName) {
        const result = await WeatherAPI.current(cityName);

        if (result.success) {
            const weather = WeatherFormatter.formatCurrent(result.data);
            return createCityCard(weather, cityName);
        } else {
            return createRetryCard(cityName, result.error);
        }
    }

    // Create city card
    function createCityCard(weather, cityName) {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;
        card.dataset.status = 'loaded';
        
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

    // Create retry card for failed cities
    function createRetryCard(cityName, errorMsg) {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.dataset.city = cityName;
        card.dataset.status = 'failed';
        
        card.innerHTML = `
            <div class="city-card-retry">
                <span class="city-card-retry-icon">⚠️</span>
                <span class="city-card-retry-text">${cityName}</span>
                <span class="city-card-retry-text">${errorMsg || 'Load failed'}</span>
                <button class="city-card-retry-btn" data-city="${cityName}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Retry
                </button>
            </div>
        `;

        // Retry button click
        const retryBtn = card.querySelector('.city-card-retry-btn');
        retryBtn.onclick = async function(e) {
            e.stopPropagation();
            const newCard = await loadCityWeather(cityName);
            if (newCard) {
                card.replaceWith(newCard);
            }
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

    // City autocomplete - Show suggestions
    function showCitySuggestions(matches) {
        elements.citySuggestions.innerHTML = '';

        if (matches.length === 0) {
            elements.citySuggestions.classList.add('hidden');
            return;
        }

        matches.forEach((city, index) => {
            const item = document.createElement('div');
            item.className = 'city-suggestion-item' + (index === 0 ? ' highlighted' : '');
            item.dataset.city = city;
            item.innerHTML = `
                <span class="city-suggestion-icon">🌤️</span>
                <span class="city-suggestion-name">${city}</span>
            `;
            item.onclick = function() {
                selectCity(city);
            };
            elements.citySuggestions.appendChild(item);
        });

        elements.citySuggestions.classList.remove('hidden');
    }

    // City autocomplete - Hide suggestions
    function hideCitySuggestions() {
        elements.citySuggestions.classList.add('hidden');
    }

    // City autocomplete - Select city
    function selectCity(city) {
        elements.cityInput.value = city;
        hideCitySuggestions();
        showWeatherDetail(city);
    }

    // City autocomplete - Filter cities
    function filterCities(query) {
        if (!query || query.length < 1) {
            hideCitySuggestions();
            return [];
        }

        query = query.toLowerCase();
        const matches = allCities.filter(function(city) {
            return city.toLowerCase().includes(query);
        });

        showCitySuggestions(matches);
        return matches;
    }

    // City autocomplete - Navigate with keyboard
    function navigateSuggestions(direction) {
        const items = elements.citySuggestions.querySelectorAll('.city-suggestion-item');
        if (items.length === 0) return;

        const current = elements.citySuggestions.querySelector('.highlighted');
        let newIndex = -1;

        if (current) {
            const currentIndex = Array.from(items).indexOf(current);
            newIndex = currentIndex + direction;

            if (newIndex < 0) newIndex = items.length - 1;
            if (newIndex >= items.length) newIndex = 0;

            current.classList.remove('highlighted');
        } else {
            newIndex = 0;
        }

        items[newIndex].classList.add('highlighted');
    }

    // Search city
    async function searchCity() {
        const city = elements.cityInput.value.trim();
        if (!city) return showError('Please enter a city name');

        hideCitySuggestions();
        showWeatherDetail(city);
    }

    // Bind events
    function bindEvents() {
        // Search button
        elements.searchBtn.onclick = searchCity;

        // City input - key events for autocomplete
        elements.cityInput.onkeyup = function(e) {
            const query = this.value.trim();

            if (e.key === 'ArrowDown') {
                navigateSuggestions(1);
            } else if (e.key === 'ArrowUp') {
                navigateSuggestions(-1);
            } else if (e.key === 'Enter') {
                const highlighted = elements.citySuggestions.querySelector('.highlighted');
                if (highlighted) {
                    selectCity(highlighted.dataset.city);
                } else {
                    searchCity();
                }
            } else if (e.key === 'Escape') {
                hideCitySuggestions();
            } else {
                filterCities(query);
            }
        };

        // City input - hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!elements.cityInput.contains(e.target) && !elements.citySuggestions.contains(e.target)) {
                hideCitySuggestions();
            }
        });

        // City input - focus show suggestions
        elements.cityInput.onfocus = function() {
            const query = this.value.trim();
            if (query) {
                filterCities(query);
            }
        };

        // Quick cities
        elements.quickCities.onclick = function(e) {
            if (e.target.classList.contains('city-tag')) {
                const city = e.target.dataset.city;
                elements.cityInput.value = city;
                showWeatherDetail(city);
            }
        };

        // Refresh button
        elements.refreshBtn.onclick = function() {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation: spin 1s linear infinite;"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Loading...';
            loadPopularCities().then(function() {
                elements.refreshBtn.disabled = false;
                elements.refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Refresh';
            });
        };

        // Close detail
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
