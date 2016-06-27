(function (global) {
    "use strict";

    function onDeviceReady() {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);
        loadMapsApi();
        connectToServerSocket();

        /**
        * This callback will be executed every time a geolocation is recorded in the background.
        */
        var callbackFn = function(location) {
            console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

            var position = {
              coords: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            };

            updateCurrentPosition(position);

            /*
            IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            */
            global.backgroundGeolocation.finish();
        };

        var failureFn = function(error) {
            console.log('BackgroundGeolocation error');
        };

        if(global.cordova) {
            // BackgroundGeolocation is highly configurable. See platform specific configuration options
            global.backgroundGeolocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,
                stationaryRadius: 20,
                distanceFilter: 20,
                interval: 60 * 1000,
                debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
                stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
            });

            // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
            global.backgroundGeolocation.start();

            // If you wish to turn OFF background-tracking, call the #stop method.
            // backgroundGeolocation.stop();
        }
    }

    function connectToServerSocket() {
      var socket = io.connect('//bus-tracker.ultilabs.xyz');
      // var socket = io.connect('http://localhost:8888');


      global.socket = socket;
    }

    function onOnline() {
        loadMapsApi();
    }

    function onResume() {
        loadMapsApi();
    }

    function loadMapsApi() {
        if ((window.cordova && navigator.connection.type === Connection.NONE) || global.google !== undefined) {
            return;
        }

        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBZqZxv3WgxC6-dED3DVOzCMLx3aCziY78&libraries=places&callback=onMapsApiLoaded');
    }

    global.onMapsApiLoaded = function () {
        console.log("Api loaded");
        initMap();
    };

    // may need comment out onDeviceReady when deploying - It's the Wild West, baby.
    if(!global.cordova) {
        onDeviceReady();
    }
    document.addEventListener("deviceready", onDeviceReady, false);
})(window);
