ConsolePlugin = _.extend({
    init: function(scr){
        this.prototype.init.apply(scr);
    },
    updateScreen: function(){
        this.scr.trigger('screenUpdated');
    }
},
SolariPlugin
)