TimePlugin = _.extend({
    init: function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        this.worker = new Worker('plugins/time-worker.js');
        var self = this;
        this.worker.addEventListener(
            'message',
            function(e) {
                self.scr.pushMessage(e.data.hour + '.' + e.data.minutes);
                self.updateScreen();
            },
            false
        );
    },
    start: function(){
        this.worker.postMessage();
        this.updateScreen();
    },
    updateScreen: function(){
        this.scr.trigger('screenUpdated');
    }
},
SolariPlugin
);