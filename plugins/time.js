TimePlugin = function(){
    this.init = function(scr) {
        SolariPlugin.prototype.init.call(this, scr);
        this.worker = new Worker('plugins/time-worker.js');
        var self = this;
        this.worker.addEventListener(
            'message',
            function(e) {
                function pad(number) {
                    return ((number < 10) ? '0': '') + number;
                }
                var rowNum = Math.ceil(self.scr.matrix.length / 2) - 1,
                    row = self.scr.matrix[rowNum],
                    str = pad(e.data.hour) + '.' + pad(e.data.minutes);
                    rowStart = Math.floor((row.length - str.length) / 2);
                for (i = 0; i < str.length; i++) {
                    row[rowStart + i] = str[i];
                }
                self.updateScreen();
            },
            false
        );
    };
    this.start = function() {
        this.worker.postMessage();
        this.updateScreen();
    };
};

_.extend(TimePlugin.prototype, SolariPlugin.prototype);
