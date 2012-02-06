JenkinsPlugin = function(repos){
    this.repos = repos;
    this.init = function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        if(this.ws) this.ws.close();
        if(this.ws2) this.ws2.close();
        socket = MozWebSocket || WebSocket;
        this.ws = new socket('ws://dev-hson-1:8082/jenkins');
        this.ws2 = new socket('ws://dev-jen1:8081/jenkins');
    };
    this.start = function(){
        var self = this,
            matrix = this.scr.matrix,
            repos = this.repos,
            keys = _.keys(repos);
        this.rowMap = {};
        //Set the inital values of the screen
        _.each(matrix, function(row, i){
            if (i < keys.length) {
                var repoName = repos[keys[i]];
                this.rowMap[keys[i]] = row;
                _.each(row, function(flap, i){
                    if (i < repoName.length) {
                        row[i] = repoName[i];
                    }
                });
            }
        }, this);

        var render = function(data){
            var row = self.rowMap[data.project],
                buildNo = '#' + data.number;
            //Just in case a websocket call comes in we don't have a repo for
            if(row){
                row[row.length - 1] = data.result[0];
                for(i = 0; i < buildNo.length; i++) {
                    var c = (row.length - 1) - (buildNo.length - i);
                    row[c] = buildNo[i];
                }
                self.updateScreen();
            }
        };

        //Playback stored cache data
        _.each(keys, function(key){
            if (storedMessage = JSON.parse(localStorage.getItem(key))){
                render(storedMessage);
            }
        }, this);

        this.updateScreen();

        this.ws.onmessage = this.ws2.onmessage = function(msg) {
            var data = JSON.parse(msg.data);
            localStorage.setItem(data.project, msg.data);
            render(data);
        };

        //Keep-alive for websocket
        setInterval(function(){
            self.ws.send('ping');
            self.ws2.send('pong');
        }, 5000);
    };
};

_.extend(JenkinsPlugin.prototype, SolariPlugin.prototype);
