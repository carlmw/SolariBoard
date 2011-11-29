var SolariTexture = function(src, chars, faceWidth, faceHeight){};
SolariTexture.prototype = _.extend({
	loaded: false,
	chars: [],
	faces: {},
	load: function(src, chars, faceWidth, faceHeight){
		this.chars = chars;
		this.faceWidth = faceWidth;
		this.faceHeight = faceHeight;
		
		var self = this;
		this.loadSprite(src, function(img){
			self.faces = self.extractTextures(img, chars, faceWidth, faceHeight);
			self.trigger('load');
		});
	},
	loadSprite: function(src, callback){
		var img = document.createElement('img');
		img.onload = function(){
			callback(img);
		};
		img.src = src;
	},
	extractTextures: function(img, chars, faceWidth, faceHeight, callback){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext("2d"),
			faces = {};
			
		document.body.appendChild(img);
		canvas.width = img.clientWidth;
		canvas.height = img.clientHeight;
		document.body.appendChild(canvas);
		ctx.drawImage(img, 0, 0);
		
		var x = 0;
		chars.forEach(function(ch, i){
			var top = ctx.getImageData(x, 0, faceWidth, faceHeight),
				bottom = ctx.getImageData((x === 0) ? faceWidth * (chars.length - 1) : x - faceWidth, faceHeight, faceWidth, faceHeight),
				upper = new THREE.DataTexture(new Uint8Array(top.data), faceWidth, faceHeight),
				lower = new THREE.DataTexture(new Uint8Array(bottom.data), faceWidth, faceHeight);
				
				upper.needsUpdate = lower.needsUpdate = true;
				
			faces[ch] = {
				topMaterial: new THREE.MeshLambertMaterial({
					map: upper
				}),
				bottomMaterial: new THREE.MeshLambertMaterial({
					map: lower
				})
			};
			
			x += faceWidth;
		});
		
		// Now flip the canvas and retrieve the back of each character flipper
		ctx.translate(img.clientWidth, img.clientHeight);
		ctx.scale(-1, -1);
		ctx.drawImage(img, 0, 0);
		chars.forEach(function(ch, i){
			x -= faceWidth;
			var flip = ctx.getImageData(x, 0, faceWidth, faceHeight),
				back = new THREE.DataTexture(new Uint8Array(flip.data), faceWidth, faceHeight),
				prev = chars[i-1] ? chars[i-1] : chars[chars.length-1];
				
				back.needsUpdate = true;
			
			faces[ch].flipperMaterials = [
				null,
				null,
				null,
				null,
				faces[prev].topMaterial,
				new THREE.MeshLambertMaterial({
					map: back
				})
			];
		});
		
		// Tidy up
		document.body.removeChild(img);
		document.body.removeChild(canvas);
		img = canvas = ctx = null;
		
		return faces;
	}
}, Backbone.Events);