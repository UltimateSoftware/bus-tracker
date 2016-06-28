/*
  Update Peoples Positions
*/
function updatePeoplesPositions(locs) {
    console.log(locs);

    // First, remove any existing markers from the map.
    for (var i = 0; i < peopleArray.length; i++) {
        peopleArray[i].setMap(null);
    }

    peopleArray = [];

    // Add everyones current positon
    for (var i = 0; i < locs.length; i++) {

        var personMarker = new google.maps.Marker({
            map: map,
            position: {
                lat: locs[i].lat,
                lng: locs[i].lng
            },
            title: locs[i].route,
            icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
        });

        attachInstructionText(personMarker, "BUS: " + locs[i].route)
        peopleArray[i] = personMarker;
    }
}


/*
Update Current Position
*/
function updateCurrentPosition(position) {
    myPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    if (destinationRoutes.length > 1) {
        console.log('ERROR');
    } else { //distance logic here
        console.log('DESTINATION ROUTES', destinationRoutes);
        var route = destinationRoutes[0];
        var minDistance = undefined;
        route.legs.forEach(function(leg) {
            leg.steps.forEach(function(step) {
                if (step.travel_mode === 'TRANSIT') {
                    step.path.forEach(function(point) {
                        var lat = point.lat();
                        var lng = point.lng();
                        var distance = getDistanceFromLatLon(lat, lng, myPosition.lat, myPosition.lng);
                        if (minDistance === undefined || distance < minDistance) {
                            minDistance = distance;
                        }
                    });
                } else {
                    console.log('WALKING');
                }
            });
        });
        if (minDistance > 100) {
            alertModal('Path Error!', 'You\'re off your path, do you need to check out?', 'error');
            if (window.cordova) window.backgroundGeolocation.stop();
        }
    }
    // remove current positon marker
    myMarker.setMap(null);

    // create marker with appropriate color to match my preferences
    myMarker = new google.maps.Marker({
        map: map,
        position: myPosition
    });

    window.socket.emit('updateLocation', myPosition);
}
