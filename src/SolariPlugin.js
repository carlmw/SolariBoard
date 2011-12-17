var SolariPlugin = _.extend({
    init: function(scr){
        this.scr = scr;
    },
    getScreen: function(){
        return this.scr;
    }
}, Backbone.Events);