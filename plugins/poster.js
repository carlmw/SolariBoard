var PosterPlugin = function(src){
	var img = document.createElement('img');
	img.style.maxWidth = Board.boardWidth + 'px';
	img.style.maxHeight = Board.boardHeight + 'px'; // Let the browser do the heavy lifting with the scaling and resampling

	document.body.appendChild(img);
	img.onload = function(){
		var texture = new PosterTexture(Board, img.src, img.clientWidth, img.clientHeight).
			bind('load', function(){
				_.invoke(this.target.flaps, 'bind', 'cycleend', function(){
					this.paint(texture.spriteMaterial, texture.UV[this.cid]);
				});
			});

		document.body.removeChild(img);
	};
	img.src = src;
};