LastFmPlugin = function(socket_url){
    this.init = function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        this.socket = new io.connect(socket_url);
    };
    this.start = function(){
        this.updateScreen();
        var self = this;
        this.socket.on('lastfm', function(track){
            self.scr.pushMessage(track.track.toUpperCase());
            self.scr.pushMessage(track.artist.toUpperCase());
            self.updateScreen();
        });
    };
};

_.extend(LastFmPlugin.prototype, SolariPlugin.prototype);
