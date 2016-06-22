(function (global) {
    "use strict";

    function onDeviceReady() {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);        
        loadMapsApi();
    }

    function onOnline() {
        loadMapsApi();
    }

    function onResume() {
        loadMapsApi();
    }

    function loadMapsApi() {
        if ((navigator.connection && navigator.connection.type === Connection.NONE) || global.google !== undefined) {
            return;
        }

        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBZqZxv3WgxC6-dED3DVOzCMLx3aCziY78&libraries=places&callback=onMapsApiLoaded');
    }

    global.onMapsApiLoaded = function () {
        initMap();
    };

    //onDeviceReady();
    document.addEventListener("deviceready", onDeviceReady, false);
})(window);