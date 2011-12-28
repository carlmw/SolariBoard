var LastFmNode = require('lastfm').LastFmNode;
var http = require('http');
var io = require('socket.io').listen(8090);
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

for (i = 0; i < users.length; i++) {
    streams[i] = lastfm.stream(users[i]);
    function createListener(username) {
        return function(track) {
            for (a = 0; a < sockets.length; a++) {
                sockets[a].emit(
                    'lastfm',
                    {
                        username: username,
                        track: track.name,
                        artist: track.artist['#text']
                    }
                )
            }
        }
    }
    streams[i].on(
        'nowPlaying',
        createListener(users[i])
    );
    streams[i].on(
        'error',
        function(error) {
            //NOOP
        }
    );
    streams[i].start();
}
