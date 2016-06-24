(function (global) {
    "use strict";

    function onDeviceReady() {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);
        loadMapsApi();
        connectToServerSocket();
    }

    function connectToServerSocket() {
      var socket = io.connect('http://localhost:8888');
      socket.on('pushLocations', function (locs) {
          // console.log('NEW LOCS PUSHED!!!!!!!!!!!!');
          // console.log(locs);
          global.locs = locs; // TODO: call function to wipe all current markers, and create new markers for each.
          // global.socket.emit('checkin', 1010101); // TODO: put in function that calls checkin.
          // global.socket.emit('checkout', 1010101); // TODO: put in function that calls checkout.
          // global.socket.emit('updateLocation' { lat: 1, long: 1 }); // TODO: call this whenever we update our location.
      });

      global.socket = socket;
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
        console.log("Api loaded");
        initMap();
    };

    onDeviceReady();
    // document.addEventListener("deviceready", onDeviceReady, false);
})(window);
