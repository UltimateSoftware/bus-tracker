function makeRoutePicker(busRoutes, button) {

    var modal = $('<div>');
    modal.addClass('modal').attr('id', 'route-pick-modal');

    var modalContent = $('<div>');
    modalContent.addClass('modal-content');
    modalContent.append($('<h4>').text('Pick Your Route'));
    
    var routeContainer = $('<div>');
    routeContainer.addClass('collection');

    busRoutes.forEach(function(route) {
        var collectionItem = $('<a>').addClass('collection-item').text(route);

        collectionItem.click(function() {
            checkInToBus(route, button);
        });

        routeContainer.append(collectionItem);
    });

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

function checkInToBus(route, button) {

    // change state of button to checked in
    button.setState(true);
    $('#route-pick-modal').closeModal();
    $('#route-pick-modal').remove();

    // remove current positon marker
    myMarker.setMap(null);    

    window.socket.emit('checkin', route);

    // watch for position changes
    watchId = navigator.geolocation.watchPosition(updateCurrentPosition);
    startBackgroundGeocoder();
}

function checkOutFromBus(watchId) {
    navigator.geolocation.clearWatch(watchId);
    stopBackgroundGeocoder();
    window.socket.emit('checkout');

    // create marker with appropriate color to match my preferences
    myMarker = new google.maps.Marker({
        map: map,
        position: myPosition
    });
}
