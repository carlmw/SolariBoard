LastFmPlugin = _.extend({
    init: function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        this.socket = new io.connect('http://mob061.lan:8090');
    },
    start: function(){
        this.updateScreen();
        var self = this;
        this.socket.on('lastfm', function(track){
            console.log(track);
            self.scr.pushMessage(track.track.toUpperCase());
            self.scr.pushMessage(track.artist.toUpperCase());
            self.updateScreen();
        });
    },
    updateScreen: function(){
        this.scr.trigger('screenUpdated');
    }
},
SolariPlugin
);