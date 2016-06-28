function initBackgeocoder() {
    /**
     * This callback will be executed every time a geolocation is recorded in the background.
     */

    var failureFn = function(error) {
        console.log('BackgroundGeolocation error');
    };

    if (window.cordova) {
        // BackgroundGeolocation is highly configurable. See platform specific configuration options
        window.backgroundGeolocation.configure(updateBackground, failureFn, {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 20,
            interval: 10 * 1000,
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
        });
    }
}

function startBackgroundGeocoder() {
    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
    window.backgroundGeolocation.start();
}

function updateBackground(location) {
    console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

    var position = {
        coords: {
            latitude: location.latitude,
            longitude: location.longitude
        }
    }

    updateCurrentPosition(position);
}

function stopBackgroundGeocoder() {

    // If you wish to turn OFF background-tracking, call the #stop method.
    window.backgroundGeolocation.stop();

    /*
       IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
       and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
       IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
       */
    window.backgroundGeolocation.finish();
}
