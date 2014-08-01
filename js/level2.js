!function ($) {

    $(function(){
        refreshTime();
        setInterval( function() {
            refreshTime();
        }, 1000);

        refreshContent();

        setInterval( function() {
            refreshContent();
        }, 60000);

        loadWeather();

        setInterval( function() {
            reloadPage();
        }, 10000);

        schedule();

        setInterval( function() {
            schedule();
        }, 60000);

    });

}(window.jQuery);

function reloadPage() {

    var request = $.ajax({
        type: 'get',
        url: '/reload',
        complete: function( response ) {

            data =  response.responseText;

            if ( data.substring(0,1) == "1" ) {
                location.reload();
            }
        }
    });
}

function refreshTime() {

    $('.time').text( moment().format('HH:mm:ss') );
    $('.date').text( moment().format('ddd, Do \of MMMM') );

}

function refreshContent() {

    $('#wrapper').html('');

    var station = 220301015;

    var request = $.ajax({
      type: 'get',
      url: 'http://getcontents.herokuapp.com/?url=http%3A%2F%2Ftravelplanner.mobiliteit.lu%2Fhafas%2Fcdt%2Fstboard.exe%2Ffn%3FL%3Dvs_stb%26input%3D' + station + '%26boardType%3Ddep%26time%3D' + moment().format('HH') + '%3A' + moment().format('mm') + '%26selectDate%3Dtoday%26start%3Dyes%26requestType%3D0%26maxJourneys%3D2',
      complete: function( response ) {

        resp = response.responseText.slice(14);

        data =  JSON.parse( resp );

        busses = data.journey;

        var content = '';

        $.each(busses, function(nr, bus) {

            var name        = bus.pr;
            var destination = bus.st;

            if ( bus.rt != false ) {

                var time = bus.rt.dlt;

            } else {

                var time = bus.ti;

            }

            var timeDifference;

            var busTime = moment()
                .set('hour', time.substring(0, 2) )
                .set('minute', time.substring(3, 5) );

            timeDifference = busTime.diff( moment(), 'minutes' );

            timeLeftMessage = 'departure in ' + timeDifference + ' minutes';

            if ( name.indexOf("Bus") != -1 ) {
                name = name.slice( name.indexOf("Bus ") + 4 );
            }

            content += '<h1>' + time + ' ' + destination + '</h1>' + timeLeftMessage;


        });

        $('.busses').html('');
        $('.busses').append( content );

        $('#bandwidth').attr('src','http://www.conostix.com/www/images/haxo/haxogreen.png');

        console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated busses' );

      }
    });

}

function loadWeather() {

    var city = 'Dudelange';
    var country = 'lu';
    var appid = '64a2215ad2f5f944abd334578763726e';

    var request = $.ajax({
        type: 'get',
        url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=' + city + ',' + country + '&appid=' + appid,
        complete: function( response ) {

            data =  JSON.parse( response.responseText );

            weather = data.weather[0];

            var description     = weather.description;
            var weatherId       = weather.icon;
            var temperature     = formatTemp( data.main.temp );

            $('.currentTemp').text( temperature );
            $('.weatherIcon').attr( 'class', 'climacon ' + OWMIcon( weatherId ) );

            console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated weather' );

        }
    });

}

function formatTemp( temperature ) {

  temperature = ( temperature ).toFixed(1);

  if (temperature > 10 ) {

    temperature = Math.round( temperature );

  }

  return temperature + '°';

}

function OWMIcon( imageCode ) {
// Icon Name & Colour Percentage
  var b = {
    '01d': [ "sun" ],
    '01n': [ "moon" ],

    '02d': [ "cloud sun" ],
    '02n': [ "cloud moon" ],

    '03d': [ "cloud" ],
    '03n': [ "cloud" ],

    '04d': [ "cloud" ],
    '04n': [ "cloud" ],

    '09d': [ "showers sun" ],
    '09n': [ "showers moon" ],

    '10d': [ "rain sun" ],
    '10n': [ "rain moon" ],

    '11d': [ "lightning sun" ],
    '11n': [ "lightning moon" ],

    '13d': [ "snow sun" ],
    '13n': [ "snow moon" ],

    '50d': [ "fog sun" ],
    '50n': [ "fog moon" ]
  };
  return b[ imageCode ]
}

function schedule() {

    var talks = [];

    var request = $.ajax({
        type: 'get',
        url: 'http://getcontents.herokuapp.com/?url=https%3A%2F%2Ffrab.haxogreen.lu%2Fen%2Fhaxogreen%2Fpublic%2Fschedule.json',
        complete: function( response ) {

            var schedule = JSON.parse( response.responseText );

            days = schedule.schedule.conference.days;

            $.each(days, function(nr, day) {

                var talks = [];

                $.each(day.rooms, function(nr, room) {

                    if ( room.length > 0) {

                        $.each(room, function(nr, talk) {

                            console.log( talk );

                            talks.push( talk );

                        });

                    }

                });

            });

        }
    });

    console.log( talks );

    console.log( moment().format('YYYY.MM.DD - HH:mm:ss') + ' updated schedule' );

}
