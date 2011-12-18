JenkinsPlugin = _.extend({
    repos: {
        'fidodevelopment': 'FIDODEV',
        'fidotesting': 'FIDOTEST',
        'kerby-server': 'KERBYSVR',
        'kerby-fido-integration': 'KERBYFIDOINT',
        'Zonza': 'ZONZA',
        'ZonzaRest': 'ZONZAREST',
        'ZonzaSelenium': 'ZONZASELENIUM'
    },
    init: function(scr){
        SolariPlugin.prototype.init.call(this, scr);
        if(this.ws) this.ws.close();
        this.ws = new WebSocket('ws://dev-hson-1:8082/jenkins');
    },
    start: function(){
        var self = this,
            scr = this.scr,
            matrix = scr.matrix,
            repos = this.repos,
            keys = _.keys(repos);
        _.each(matrix, function(row, i){
            if (i < keys.length) {
                var repoName = repos[keys[i]];
                _.each(row, function(flap, i){
                    if (i < repoName.length) {
                        row[i] = repoName[i];                        
                    }
                });
            }
        }, this);
        this.updateScreen();
        var render = function(data){
            self.updateScreen();
        };
        this.ws.onmessage = function(msg) {
            var data = JSON.parse(msg.data);
            render(data);
        }
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