$(document).ready(function () {
    var searchHistory = [];
    
    const momentDay = moment().format('dddd, MMMM Do');
    $('.todayDate').prepend(momentDay);

    for (var i = 1; i < 6; i++) {
        $(`#${i}Date`).text(moment().add(i, 'd').format('dddd, MMMM Do'));
    }
    
    $('form').on('submit', function (event) {
        event.preventDefault();
        let city = $('input').val();
        if (city === '') {
            return;
        }

        call();

        // Clears and resets the form
        $('form')[0].reset();
    });

    $('.searchHistoryEl').on('click', '.historyBtn', function (event) {
        event.preventDefault();
        let btnCityName = $(this).text();
        // Runs the function to call the API and display retrieved data
        call(btnCityName);
    });

    $('#clearBtn').on('click', function (event) {
        event.preventDefault();
        // Clears local storage
        window.localStorage.clear();
        // Clears the search history element
        $('.searchHistoryEl').empty();
        searchHistory = [];
        renderButtons();
        // Clears and resets the form
        $('form')[0].reset();
    });


    const renderButtons = () => {
        // Clears the search history div
        $('.searchHistoryEl').html('');
        for (var j = 0; j < searchHistory.length; j++) {
            // Store the search term (city) and create a button with the search term displayed
            let cityName1 = searchHistory[j];
            let historyBtn = $(
                '<button type="button" class="btn btn-primary btn-lg btn-block historyBtn">'
            ).text(cityName1);
            // Prepend the buttons to the search history div
            $('.searchHistoryEl').prepend(historyBtn);
        }
    };
    
    const init = () => {
        
        let storedCities = JSON.parse(localStorage.getItem('searchHistory'));
        if (storedCities !== null) {
            searchHistory = storedCities;
        }
        // Render buttons to the DOM
        renderButtons();
    };

    init();
    
    const storeCities = () =>
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    const uvCall = (lon, lat) => {
        let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&units=imperial&appid=77cb488591d883bec900753d1136d81c`;

        $.ajax({
            url: uvQueryURL,
            method: 'GET',
        }).then(function (uvResponse) {
            // Display UV Index data
            $('#uvData').html(`${uvResponse.value}`);
            // Color code the UV Index row
            if (uvResponse.value <= 2) {
                $('.uvRow').css('background-color', 'green');
            } else if (uvResponse.value > 2 && uvResponse.value <= 5) {
                $('.uvRow').css('background-color', 'yellow');
            } else if (uvResponse.value > 5 && uvResponse.value <= 7) {
                $('.uvRow').css('background-color', 'orange');
            } else if (uvResponse.value > 7 && uvResponse.value <= 10) {
                $('.uvRow').css('background-color', 'red');
            } else {
                $('.uvRow').css('background-color', 'violet');
            }
        });
    };

   
    const fiveDay = (lon, lat) => {
        let fiveQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=77cb488591d883bec900753d1136d81c`;

        $.ajax({
            url: fiveQueryURL,
            method: 'GET',
        }).then(function (fiveResponse) {
            for (var k = 1; k < 6; k++) {
                // Displays the image in the appropriate card
                $(`#${k}img`).attr(
                    'src',
                    `http://openweathermap.org/img/wn/${fiveResponse.daily[k].weather[0].icon}@2x.png`
                );
                // Displays the temp in the appropriate card
                $(`#${k}temp`).html(
                    `Temp: ${fiveResponse.daily[k].temp.day} &#8457;`
                );
                // Displays the humidity in the appropriate card
                $(`#${k}humid`).html(
                    `Humidity: ${fiveResponse.daily[k].humidity}%`
                );
            }
        });
    };
    const call = (btnCityName) => {
        let cityName = btnCityName || $('input').val();
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=77cb488591d883bec900753d1136d81c`;
        $.ajax({
            url: queryURL,
            method: 'GET',
        })
            .then(function (response) {
                if (!btnCityName) {
                    searchHistory.unshift(cityName);
                    storeCities();
                    renderButtons();
                }
                // Collect lon and lat for subsequent API calls
                var lon = response.coord.lon;
                var lat = response.coord.lat;
                // Lists the data in the Jumbotron
                $('#cityName').text(response.name);
                $('#currentImg').attr(
                    'src',
                    `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
                );
                $('#tempData').html(`${response.main.temp} &#8457;`);
                $('#humidData').html(`${response.main.humidity}%`);
                $('#windData').html(`${response.wind.speed} mph`);
                $('#windArrow').css({
                    transform: `rotate(${response.wind.deg}deg)`,
                });
                uvCall(lon, lat);
                fiveDay(lon, lat);
            })
            .catch(function (error) {
                alert('Enter a valid city');
            });
    };

    call(searchHistory[0]);
});