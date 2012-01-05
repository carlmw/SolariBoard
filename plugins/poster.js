var PosterPlugin = function(src){

	var texture = new PosterTexture(src, Board.boardWidth, Board.boardHeight, Board.rows).
		bind('load', function(){
			var cycleHandler = function(){
				this.paint(texture.spriteMaterial, texture.UV[this.cid]);
				var animationHandler = function(){
					this.flapWrapper.rotation.x = Math.PI;
					this.i = 0;
					this.wedged = true;
					this.unbind('animationend', animationHandler);
				};
				this.bind('animationend', animationHandler);
				this.unbind('cycleend', cycleHandler);
			};
			_.invoke(this.target.flaps, 'bind', 'cycleend', cycleHandler);
		});

};