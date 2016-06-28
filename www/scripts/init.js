(function(global) {
    "use strict";

    function onDeviceReady() {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);
        loadMapsApi();
        connectToServerSocket();
        initBackgeocoder();
    }

    function connectToServerSocket() {
        var socket = io.connect('https://bus-tracker.ultilabs.xyz');
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

        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDwXt4W2MKNbueLKCO4sZsh4VfhZZOdNOg&libraries=places&callback=onMapsApiLoaded');
    }

    global.onMapsApiLoaded = function() {
        initMap();
    };

    // may need comment out onDeviceReady when deploying - It's the Wild West, baby.
    if (!global.cordova) {
        onDeviceReady();
    } else {
        document.addEventListener("deviceready", onDeviceReady, false);

    }
    
})(window);
