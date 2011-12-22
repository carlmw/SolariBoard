var PosterPlugin = function(src){
	var img = document.createElement('img');
	img.style.maxWidth = Board.boardWidth + 'px';
	img.style.maxHeight = Board.boardHeight + 'px'; // Let the browser do the heavy lifting with the scaling and resampling

	document.body.appendChild(img);
	img.onload = function(){
		Board.setImage(Board, img.src, img.clientWidth, img.clientHeight); // this will become our texture
		document.body.removeChild(img);
	};
	img.src = src;
};