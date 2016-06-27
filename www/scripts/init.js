(function (global) {
    "use strict";

    function onDeviceReady() {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);
        loadMapsApi();
        connectToServerSocket();
    }

    function connectToServerSocket() {
      // var socket = io.connect('https://bus-tracker.ultilabs.xyz:8888');
      var socket = io.connect('http://localhost:8888');


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

    //comment out onDeviceReady when deploying - It's the Wild West, baby.
    onDeviceReady();
    document.addEventListener("deviceready", onDeviceReady, false);
})(window);
