var PosterPlugin = function(src){

	var texture = new PosterTexture(src, Board.boardWidth, Board.boardHeight, Board.rows).
		bind('load', function(){
			_.invoke(this.target.flaps, 'bind', 'cycleend', function(){
				this.paint(texture.spriteMaterial, texture.UV[this.cid]);
				this.bind('animationend', function(){
					this.flapWrapper.rotation.x = Math.PI;
					this.wedged = true;
				});
			});
		});

};