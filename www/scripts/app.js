var busRoutes = ['Route 1', 'Route 2', 'Route 4', 'Route 5', 'Route 6', 'Route 7', 'Route 9', 'Route 10', 'Route 11', 'Route 12', 'Route 14', 'Route 15', 'Route 16', 'Route 18', 'Route 19', 'Route 20', 'Route 22', 'Route 23', 'Route 28', 'Route 30', 'Route 31', 'Route 34', 'Route 36', 'Route 40', 'Route 42', 'Route 48', 'Route 50', 'Route 55', 'Route 56 Shuttle', 'Route 60', 'Route 62', 'Route 72', 'Route 81', 'Route 83', 'Route 88'];

var directionsService,
    stepDisplay,
    directionsDisplay,
    markerArray = [],
    peopleArray = [],
    destinationRoutes = [],
    map,
    geocoder,
    searchBox,
    myPosition,
    myMarker,
    watchId;
// transitRoutes = [];

function CheckInOutButton(clickHandler) {

    this.button = $('<div>');
    this.button.addClass('waves-effect').addClass('waves-light').addClass('btn-large').addClass('btn-floating').addClass('modal-trigger');
    this.buttonIcon = $('<i>').addClass('fa');
    this.button.append(this.buttonIcon);
    this.button.attr('href', 'route-pick-modal');
    this.button.css({
        margin: '10px'
    });
    this.setState(false);
    var self = this;
    this.button.click(function() {
        self.setState(!self.checkIn);
        clickHandler(self.checkIn);
    });

}

CheckInOutButton.prototype.CHECK_IN_TEXT = 'Check In';
CheckInOutButton.prototype.CHECK_OUT_TEXT = 'Check Out';
CheckInOutButton.prototype.CHECK_IN_ICON = 'fa-check';
CheckInOutButton.prototype.CHECK_OUT_ICON = 'fa-times';
CheckInOutButton.prototype.setState = function(checkIn) {
    this.checkIn = checkIn;
    if (this.checkIn) {
        // this.button.text(CheckInOutButton.prototype.CHECK_OUT_TEXT);
        this.button.addClass('red').removeClass('green');
        this.buttonIcon.addClass(CheckInOutButton.prototype.CHECK_OUT_ICON).removeClass(CheckInOutButton.prototype.CHECK_IN_ICON);
    } else {
        // this.button.text(CheckInOutButton.prototype.CHECK_IN_TEXT);
        this.button.addClass('green').removeClass('red');
        this.buttonIcon.addClass(CheckInOutButton.prototype.CHECK_IN_ICON).removeClass(CheckInOutButton.prototype.CHECK_OUT_ICON);

    }
}

function makeRoutePicker(busRoutes, button) {

    var modal = $('<div>');
    modal.addClass('modal').attr('id', 'route-pick-modal');

    var modalContent = $('<div>');
    modalContent.addClass('modal-content');
    modalContent.append($('<h4>').text('Pick Your Route'));
    var routeContainer = $('<div>');

    // routeContainer.addClass('input-field');
    routeContainer.addClass('collection');

    // var selectDropdown = $('<select>').addClass('browser-default');

    busRoutes.forEach(function(route) {
        var collectionItem = $('<a>').addClass('collection-item').text(route);

        collectionItem.click(function() {
            checkInToBus(route, button);
        });

        routeContainer.append(collectionItem);

        // var routeOption = $('<option>').attr('value', route).text(route);
        // selectDropdown.append(routeOption);

    });

    // selectDropdown.select2();
    // routeContainer.append(selectDropdown);

    modalContent.append(routeContainer);
    modal.append(modalContent);
    var modalFooter = $('<div>').addClass('modal-footer');
    var closeButton = $('<a>').addClass('waves-effect').addClass('waves-red').addClass('btn-flat').text('Cancel');
    closeButton.click(function() {
        button.setState(false);
        modal.closeModal();
        modal.remove();
    });
    modalFooter.append(closeButton);
    modal.append(modalFooter);

    $(document).on('click', '.lean-overlay', function() {
        button.setState(false);
    });

    return modal;
}

function initMap() {

    directionsService = new google.maps.DirectionsService;
    stepDisplay = new google.maps.InfoWindow;
    geocoder = new google.maps.Geocoder();
    console.log('in init function');


    // Setup map based on current positon
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log("got current position - ", position);

        // the geolocation coords do not match the object spec expected by api calls
        // this constructs the type expected
        myPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // build map and center on current position
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: myPosition,
            disableDefaultUI: true
        });

        //enable direction layer
        directionsDisplay = new google.maps.DirectionsRenderer({
            map: map
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // create check in and out button
        var checkButton = new CheckInOutButton(
            function(checkIn) {
                if (checkIn) {
                    var routePicker = makeRoutePicker(busRoutes, checkButton);
                    $('body').append(routePicker);
                    $('#route-pick-modal').openModal();
                } else {
                    console.log('woo!');
                    checkOutFromBus(watchId);
                }
            });
        var buttonElement = checkButton.button[0];
        buttonElement.index = 3;
        map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(buttonElement);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', selectPlace);

        // Set current marker
        myMarker = new google.maps.Marker({
            map: map,
            position: myPosition
        });
    }, function(err) {
        console.log("Position error - ", err);
    }, {
        timeout: 5000
    });

    // subscribe to other peoples positions
    window.socket.on('pushLocations', updatePeoplesPostions);
}

function selectPlace() {

    var places = searchBox.getPlaces();

    if (places.length == 0) {
        return;
    }

    calculateAndDisplayRoute(places[0].formatted_address)
}

function alertModal(title, content, type) {

    var iconColor = '';
    var iconClass = '';

    if (type === 'warning') {
        iconColor = '#ffb300';
        iconClass = 'fa-exclamation-triangle';
    } else if (type === 'error') {
        iconColor = '#e53935';
        iconClass = 'fa-times-circle';
    } else if (type === 'success') {
        iconColor = '#00e676';
        iconClass = 'fa-check-circle';
    } else {
        iconColor = '#f50057';
        iconClass = 'fa-smile-o';
    }
    var modal = $('<div>');
    modal.addClass('modal');

    var modalContent = $('<div>');
    modalContent.addClass('modal-content');
    var iconArea = $('<div>').addClass('icon-area');
    iconArea.append($('<span>').addClass('fa').addClass(iconClass));
    iconArea.css({
        textAlign: 'center',
        padding: '10px',
        fontSize: '75px',
        color: iconColor
    });
    modalContent.append(iconArea);
    modalContent.append($('<h4>').text(title));
    modalContent.append($('<p>').text(content));

    modal.append(modalContent);
    var modalFooter = $('<div>').addClass('modal-footer');
    var closeButton = $('<a>').addClass('waves-effect').addClass('waves-red').addClass('btn-flat').text('OK');
    closeButton.click(function() {
        modal.closeModal();
        modal.remove();
    });
    modalFooter.append(closeButton);
    modal.append(modalFooter);
    $('body').append(modal);
    modal.openModal();
}

function calculateAndDisplayRoute(destination) {
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }

    // Retrieve the start and end locations and create a DirectionsRequest using
    // TRANSIT directions.
    directionsService.route({
        origin: myPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT
    }, function(response, status) {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        if (status === google.maps.DirectionsStatus.OK) {
            alertModal('', response.routes[0].warnings, 'warning');

            directionsDisplay.setDirections(response);
            console.log(response);
            destinationRoutes = response.routes;
            showSteps(response, markerArray);
            //
            // var steps;
            // response.routes.forEach((route) => {
            //    route.legs.forEach((leg) => {
            //      steps = leg.steps;
            //    });
            // });
            // steps.forEach((step) => {
            //   if(step.travel_mode === "TRANSIT") {
            //     transitRoutes.push(step);
            //   }
            // });

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function showSteps(directionResult) {

    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        attachInstructionText(stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
}

function attachInstructionText(marker, text) {

    google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

function checkInToBus(route, button) {
    console.log('CHECKING IN BUS WOOOO');
    // change state of button to checked in
    button.setState(true);
    $('#route-pick-modal').closeModal();
    $('#route-pick-modal').remove();

    // remove current positon marker
    myMarker.setMap(null);

    // create marker with appropriate color to match my preferences
    myMarker = new google.maps.Marker({
        map: map,
        position: myPosition
    });

    window.socket.emit('checkin', route)

    // watch for position changes
    watchId = navigator.geolocation.watchPosition(updateCurrentPosition);
}

function updateCurrentPosition(position) {
    myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };

    // remove current positon marker
    myMarker.setMap(null);

    // create marker with appropriate color to match my preferences
    myMarker = new google.maps.Marker({
        map: map,
        position: myPosition
    });

    window.socket.emit('updateLocation', myPosition);
}

function checkOutFromBus(watchId) {
    navigator.geolocation.clearWatch(watchId);
    window.socket.emit('checkout');
}

  function updatePeoplesPostions(locs) {
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
              position: { lat: locs[i].lat, lng: locs[i].lng },
              title: locs[i].route,
              icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
          });

          attachInstructionText(personMarker, "BUS: " + locs[i].route)
          peopleArray[i] = personMarker;
      }
}


/*
Returns distance in meters
*/
function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
    var R = 6371000; // Radius of the earth in meters
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in meters
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function updateCurrentPosition(position) {
    myPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    if (destinationRoutes.length > 1) {
        console.log('DAMMIT');
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
            if(window.cordova) window.backgroundGeolocation.stop();
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

function checkOutFromBus(watchId) {
    navigator.geolocation.clearWatch(watchId);
    window.socket.emit('checkout');
}

function updatePeoplesPostions(locs) {
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
