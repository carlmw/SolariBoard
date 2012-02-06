var LastFmNode = require('lastfm').LastFmNode;
var http = require('http');
var io = require('socket.io').listen(8091);
var config = require('./lastfm.config.js');

var sockets = [];

io.sockets.on('connection', function(socket){
    sockets.push(socket);
});

var lastfm = new LastFmNode({
    api_key: config.api_key,
    secret: config.secret
});

var users = config.users,
    streams = [];

function createListener(username) {
    return function(track) {
        for (a = 0; a < sockets.length; a++) {
            sockets[a].emit(
                'lastfm',
                {
                    username: username,
                    track: track.name,
                    artist: track.artist['#text'],
                    image: track.image[3]['#text']
                }
            );
        }
    };
}

function err(error) {
    //NOOP
}

for (i = 0; i < users.length; i++) {
    streams[i] = lastfm.stream(users[i]);
    streams[i].on(
        'nowPlaying',
        createListener(users[i])
    );
    streams[i].on(
        'error',
        err
    );
    streams[i].start();
}
