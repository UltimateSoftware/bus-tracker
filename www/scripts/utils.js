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
