function CheckInOutButton(clickHandler) {

    this.button = $('<div>');
    this.button.addClass('waves-effect').addClass('waves-light').addClass('btn-large').addClass('btn-floating').addClass('modal-trigger');
    this.button.attr('id', 'check-button').attr('href', 'route-pick-modal');
    this.buttonIcon = $('<i>').addClass('fa');
    this.button.append(this.buttonIcon);
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
