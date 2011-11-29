var SolariRow = Backbone.View.extend({
	flaps: [],
	x: 0,
	height: 0,
	initialize: function(y){
		this.y = y||0;
	},
	add: function(textureSet){
		var flap = new SolariFlap(textureSet, this.x, -this.y);
		this.x += textureSet.faceWidth + 10;
		this.height = Math.max(this.height, textureSet.faceHeight * 2);
		this.flaps.push(flap);
		
		return this;
	}
});