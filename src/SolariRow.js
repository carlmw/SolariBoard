var SolariRow = Backbone.View.extend({
	initialize: function(y, scene){
		this.flaps = [];
		this.y = y||0;
		this.x = 0;
		this.height = 0;
	},
	add: function(textureSet){
		var flap = new SolariFlap(textureSet, this.x + (textureSet.faceWidth / 2), -this.y);
		this.height = Math.max(this.height, textureSet.faceHeight * 2);
		this.x += textureSet.faceWidth;
		this.flaps.push(flap);
		
		return this;
	},
	setChars: function(chars){
		_.each(this.flaps, function(flap, i){
			flap.setChar(chars[i] ? chars[i] : ' ');
		});
	}
});