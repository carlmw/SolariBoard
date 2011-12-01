var SolariRow = Backbone.View.extend({
	x: 0,
	height: 0,
	initialize: function(y, scene){
		this.flaps = [];
		this.y = y||0;
	},
	add: function(textureSet){
		var flap = new SolariFlap(textureSet, this.x, -this.y);
		this.x += textureSet.faceWidth + 10;
		this.height = Math.max(this.height, textureSet.faceHeight * 2);
		this.flaps.push(flap);
		
		return this;
	},
	setChars: function(chars){
		_.each(this.flaps, function(flap, i){
			flap.setChar(chars[i] ? chars[i] : ' ');
		});
	}
});