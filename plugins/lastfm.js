LastFmPlugin = function(socket_url){
    this.socket_url = socket_url;
};

_.extend(LastFmPlugin.prototype, SolariPlugin.prototype);

LastFmPlugin.prototype.init = function(scr){
    SolariPlugin.prototype.init.call(this, scr);
    this.socket = new io.connect(this.socket_url);
};

LastFmPlugin.prototype.start = function(){
    this.updateScreen();
    var self = this;
    this.socket.on('lastfm', function(track){
        self.scr.pushMessage(track.track.toUpperCase());
        self.scr.pushMessage(track.artist.toUpperCase());
        self.updateScreen();
    });
};
