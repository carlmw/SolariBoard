TimePlugin = _.extend({
    init: function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        this.worker = new Worker('plugins/time-worker.js');
        var self = this;
        this.worker.addEventListener(
            'message',
            function(e) {
                var rowNum = Math.ceil(self.scr.matrix.length / 2) - 1,
                    row = self.scr.matrix[rowNum],
                    str = e.data.hour + '.' + e.data.minutes;
                    rowStart = Math.floor((row.length - str.length) / 2);
                for (i = 0; i < str.length; i++) {
                    row[rowStart + i] = str[i];
                }
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