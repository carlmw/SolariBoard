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
    },
    start: function(){
        var scr = this.scr,
            matrix = scr.getMatrix(),
            keys = _.keys(this.repos);
        _.each(matrix, function(row, i){
            if (i < keys.length) {
                var repoName = this.repos[keys[i]];
                _.each(row, function(flap, i){
                    if (i < repoName.length) {
                        row[i] = repoName[i];                        
                    }
                });
            }
        }, this);
        scr.setMatrix(matrix);
        this.updateScreen();
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