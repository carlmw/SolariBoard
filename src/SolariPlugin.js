SolariPlugin = function(){};

SolariPlugin.prototype.init = function(scr) {
	this.scr = scr;
	_.bindAll(this, 'start');
};

SolariPlugin.prototype.getScreen = function() {
	return this.scr;
};

SolariPlugin.prototype.updateScreen = function(){
        this.scr.trigger('screenUpdated');
 };

_.extend(SolariPlugin.prototype, Backbone.Events);
