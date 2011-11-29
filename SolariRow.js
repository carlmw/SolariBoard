var SolariRow = Backbone.View.extend({
	flaps: [],
	add: function(flap){
		this.flaps.push(flap);
		
		return this;
	}
});