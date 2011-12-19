JenkinsPlugin = _.extend({
    repos: {
        'fidodevelopment': 'FIDODEV',
        'fidotesting': 'FIDOTEST',
        'kerby-server': 'KERBYSVR',
        'kerby-fido-integration': 'KERBYFIDOINT',
        'Zonza': 'ZONZA',
        'ZonzaRest': 'ZONZAREST',
        'ZonzaSelenium': 'ZONZASELENIUM',
        'Skellington': 'SKELLINGTON',
        'Selenium_Tests': 'FIDOSELENIUM',
        'kerby-ui': 'KERBYUI'
    },
    init: function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        if(this.ws) this.ws.close();
        if(this.ws2) this.ws2.close();
        this.ws = new WebSocket('ws://dev-hson-1:8082/jenkins');
        this.ws2 = new WebSocket('ws://dev-jen1:8081/jenkins');
    },
    start: function(){
        var self = this,
            scr = this.scr,
            matrix = scr.matrix,
            repos = this.repos,
            keys = _.keys(repos);
        this.rowMap = {};
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
        this.updateScreen();
        var render = function(data){
            var row = self.rowMap[data.project],
                buildNo = '#' + data.number;
            row[row.length - 1] = data.result[0];
            for(i = 0; i < buildNo.length; i++) {
                var c = (row.length - 1) - (buildNo.length - i);
                row[c] = buildNo[i];
            if(row){
                row[row.length - 1] = data.result[0];
                for(i = 0; i < buildNo.length; i++) {
                    var c = (row.length - 1) - (buildNo.length - i);
                    row[c] = buildNo[i];
                }
                self.updateScreen();
            }
        };
        this.ws.onmessage = this.ws2.onmessage = function(msg) {
        _.each(keys, function(key){
            if (storedMessage = JSON.parse(localStorage.getItem(key))){
                render(storedMessage);
            }
        }, this);
        this.updateScreen();
            var data = JSON.parse(msg.data);
            localStorage.setItem(data.project, msg.data);
            render(data);
        };
        setInterval(function(){
            self.ws.send('ping');
            self.ws2.send('pong');
        }, 5000);
    },
    updateScreen: function(){
        this.scr.trigger('screenUpdated');
    },
    setScreen: function(scr){
        this.scr = scr;
    },
},
SolariPlugin
);