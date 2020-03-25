function attachEvents() {
    const inputLocation = document.getElementById('location');
    const forecastContainer = document.getElementById('forecast');
    const currentWeather = document.getElementById('current');
    const upcomingWeather = document.getElementById('upcoming');

    document.getElementById('submit').addEventListener('click', onGetWeatherClick);

    const conditionSymbols = {
        'Sunny': '&#x2600',
        'Partly sunny': '&#x26C5',
        'Overcast': '&#x2601',
        'Rain': '&#x2614'
    };

    async function onGetWeatherClick() {
        forecastContainer.style.display = 'block';
        currentWeather.innerHTML = '';
        upcomingWeather.innerHTML = '';

        try {
            const locations = await fetch('https://judgetests.firebaseio.com/locations.json').then((x) => x.json());

            const code = locations.find(({name}) => name === inputLocation.value).code;

            const todayForecast = await fetch(`https://judgetests.firebaseio.com/forecast/today/${code}.json`).then((x) => x.json());
            const threeDayForecast = await fetch(`https://judgetests.firebaseio.com/forecast/upcoming/${code}.json`).then((x) => x.json());

            // Today forecast

            currentWeather.innerHTML +=
                `<div class="label">Current conditions</div>
                <div class="forecasts">
                    <span class="condition symbol">${conditionSymbols[todayForecast.forecast.condition]}</span>
                    <span class="condition">
                        <span class="forecast-data">${todayForecast.name}</span>
                        <span class="forecast-data">${todayForecast.forecast.low}&#176/${todayForecast.forecast.high}&#176</span>
                        <span class="forecast-data">${todayForecast.forecast.condition}</span>
                    </span>
                </div>`;

            // 3 day forecast

            upcomingWeather.innerHTML += threeDayForecast.forecast.reduce((html, frc) => {
                return html +
                    `<div class="upcoming">
                        <span class="symbol">${conditionSymbols[frc.condition]}</span>
                        <span class="forecast-data">${frc.low}&#176/${frc.high}&#176</span>
                        <span class="forecast-data">${frc.condition}</span>
                    </div>`
            }, '<div class="label">Three-day forecast</div><div class="forecast-data">') + '</div>';
        } catch {
            currentWeather.textContent = 'Error';
        }

        inputLocation.value = '';
    }
}

attachEvents();
