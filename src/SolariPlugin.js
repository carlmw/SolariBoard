SolariPlugin = function(){
}

_.extend(SolariPlugin.prototype,{
    init: function(scr){
        this.scr = scr;
        _.bindAll(this, 'start');
    },
    getScreen: function(){
        return this.scr;
    }
}, Backbone.Events);