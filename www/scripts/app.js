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

function initMap() {

    directionsService = new google.maps.DirectionsService;
    stepDisplay = new google.maps.InfoWindow;
    geocoder = new google.maps.Geocoder();

    // Setup map based on current positon
    navigator.geolocation.getCurrentPosition(function(position) {

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
    window.socket.on('pushLocations', updatePeoplesPositions);
}

function selectPlace() {

    var places = searchBox.getPlaces();

    if (places.length == 0) {
        return;
    }

    calculateAndDisplayRoute(places[0].formatted_address)
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
