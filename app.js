var busRoutes = ['Route 1','Route 2','Route 4','Route 5','Route 6','Route 7','Route 9','Route 10','Route 11','Route 12','Route 14','Route 15','Route 16','Route 18','Route 19','Route 20','Route 22','Route 23','Route 28','Route 30','Route 31','Route 34','Route 36','Route 40','Route 42','Route 48','Route 50','Route 55','Route 56 Shuttle','Route 60','Route 62','Route 72','Route 81','Route 83','Route 88'];

var directionsService,
    stepDisplay,
    directionsDisplay,
    markerArray = [],
    map,
    geocoder,
    searchBox,
    myPosition;

function initMap() {

    directionsService = new google.maps.DirectionsService;
    stepDisplay = new google.maps.InfoWindow;
    geocoder = new google.maps.Geocoder();

    navigator.geolocation.getCurrentPosition(function(position) {

        myPosition = { lat: position.coords.latitude, lng: position.coords.longitude };

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: myPosition
        });

        directionsDisplay = new google.maps.DirectionsRenderer({ map: map });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', selectPlace);

        var marker = new google.maps.Marker({
            map: map,
            position: myPosition
        });
    });
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
            document.getElementById('warnings-panel').innerHTML = '<b>' + response.routes[0].warnings + '</b>';
            directionsDisplay.setDirections(response);
            showSteps(response, markerArray, stepDisplay, map);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function showSteps(directionResult, markerArray, stepDisplay, map) {

    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        attachInstructionText(
            stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
}

function attachInstructionText(stepDisplay, marker, text, map) {

    google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}
