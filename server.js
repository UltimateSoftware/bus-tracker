const path = require('path');
const cors = require('cors');

const express = require('express');
const app = express();

const http = require('http').Server(app);

const PORT = 5000;
const PATHS = {
    app: path.join(__dirname, 'www')
};

http.listen(PORT, () => {
    console.log(`==> Listening on port: ${PORT}`);
    setInterval(pushLocations, 10 * 1000);
});

var connections = [];

app.use(express.static(PATHS.app));
app.use(cors());

app.get('/', function response(req, res) {
    res.sendFile(path.join(PATHS.app, 'index.html'));
});



const io = require('socket.io')(http);

io.on('connection', (socket) => {

    connections.push({ _id: socket.id });

    socket.on('disconnect', () => {

        connections = connections.filter(
            con => con._id !== socket.id
        );
    });

    socket.on('checkin', (route) => {

        const con = findConnection(socket.id);
        con.route = route;
        con.checkedIn = true;
    });

    socket.on('checkout', () => {

        const con = findConnection(socket.id);
        // TODO handle undefined.
        con.route = undefined;
        con.checkedIn = false;
    });

    socket.on('updateLocation', ({ lat, lng }) => {

        const con = findConnection(socket.id);
        con.lat = lat;
        con.lng = lng;
    });

});

function pushLocations() {
    const locs = connections
        .filter(con => {
            return con.checkedIn && (con.lat && con.lng);
        })
        .map(con => ({
            route: con.route,
            lat: con.lat,
            lng: con.lng
        }));
    
    io.emit('pushLocations', locs);
}

function findConnection(id) {
    const conArray = connections.filter(con => con._id === id)
    if (conArray.length > 0) {
        return conArray[0];
    } else {
        return undefined;
    }
}
