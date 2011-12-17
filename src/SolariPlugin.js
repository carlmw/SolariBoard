SolariPlugin = function(){
}

_.extend(SolariPlugin.prototype,{
    init: function(scr){
        this.scr = scr;
    },
    getScreen: function(){
        return this.scr;
    }
}, Backbone.Events);