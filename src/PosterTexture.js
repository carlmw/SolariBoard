var PosterTexture = function(board, src, w, h){
	this.max = 0;
	this.board = board;
	this.w = w;
	this.h = h;
	this.bounds = { // the coords from which to start and end painting.
		left: (board.boardWidth - w) / 2,
		top: (board.boardHeight - h) / 2,
	 	right: (board.boardWidth - w) / 2 + w,
	 	bottom: (board.boardHeight - h) / 2 + h
	};

	this.img = new Image;
	this.img.onload = _.bind(this.onload, this);
	this.img.src = src;
};
PosterTexture.prototype = _.extend({
	tileSrc: 'img/flap-bg.jpg',
	overlayTileSrc: 'img/flap-overlay.png',
	collectTargets: function(bounds){
		var target = {
			flaps: [],
			rows: [],
			width: 0,
			height: 0
		};
		
		target.rows = this.collectTargetRows(bounds);
		target.flaps = _.reduceRight(target.rows, function(row, memo){ return memo.concat(row); }, []);

		if(target.rows.length === 0) return target;
		
		target.width = _.reduce(target.rows[0], function(memo, flap){ return memo + flap.width }, 0);
		target.height = (target.flaps[0].height * 2) * target.rows.length;

		return target;
	},
	collectTargetFlaps: function(flaps, bounds){
		 return _.filter(flaps, function(flap){ return this.testFlapBounds(flap, bounds); }, this);
	},
	collectTargetRows: function(bounds){
		return _.filter(
			_.map(this.board.rows, function(row){ return this.collectTargetFlaps(row.flaps, bounds); }, this),
			function(row){
				return row.length > 0
			}
		);
	},
	testFlapBounds: function(flap, bounds){
		// Get the left and right of the flap relative to the board
		var top = flap.relativeTop = Math.abs(flap.y),
			left = flap.relativeLeft = (flap.x - (flap.width / 2));

		return (
			left > (bounds.left - flap.width) &&
			top > (bounds.top - (flap.height * 2)) &&
			left < (bounds.right) &&
			top < (bounds.bottom)
		);
	},
	generateUVs: function(target){
		// Now generate our UV's, this will be fun
		var UV = {flaps:[]},
			rowLength = target.rows[0].length,
			x = 0,
			y = 0,
			ydiv = target.rows.length * 2,
			stepX = 1.0 / rowLength,
			stepY = 1.0 / (ydiv + 2); // The +1 is the additional row we'll need for the front of the previous flap

		UV.base = { // We'll extend this and use the base when we're exiting the poster returning to the default texture set
		    prevTop: [
	            new THREE.UV(0, stepY * ydiv),
	            new THREE.UV(0, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * ydiv)
			],
			prevBottom: [
	            new THREE.UV(0, stepY * (ydiv + 1)),
	            new THREE.UV(0, stepY * (ydiv + 2)),
	            new THREE.UV(stepX, stepY * (ydiv + 2)),
	            new THREE.UV(stepX, stepY * (ydiv + 1))
			],
			flapTop: [
	            new THREE.UV(0, stepY * ydiv),
	            new THREE.UV(0, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * ydiv)
	        ],
	        flapBottom: [
	            new THREE.UV(0, stepY * (ydiv + 2)),
	            new THREE.UV(0, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * (ydiv + 1)),
	            new THREE.UV(stepX, stepY * (ydiv + 2))
	        ]

		};
		_.each(target.flaps, function(flap, i){
			if(i > 0 && i % rowLength === 0){
				x = 0;
				y += (stepY * 2);
			}
			UV.flaps[i] = _.extend({}, UV.base, {
				top: [
	                new THREE.UV(x, y),
	                new THREE.UV(x, y + stepY),
	                new THREE.UV(x + stepX, y + stepY),
	                new THREE.UV(x + stepX, y)
	            ],
	            bottom: [
	                new THREE.UV(x + stepX, y + 2 * stepY),
	                new THREE.UV(x + stepX, y + stepY),
	                new THREE.UV(x, y + stepY),
	                new THREE.UV(x, y + 2 * stepY)
	            ],
			});
			x += stepX;
		});
		
		return UV;
	},
	generatePosterTexture: function(img, target, callback){
		// Take the incoming image and center it on a canvas of our target size
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			left = (target.width - this.w) / 2,
			top = (target.height - this.h) / 2;

		target.height += (target.flaps[0].height * 2); // One more for the back of our flap

		canvas.width = target.width;
		canvas.height = target.height; // One more for the back of our flap

		var bgImg = new Image,
			overlayImg = new Image,
			overlaySrc = this.overlayTileSrc;
			
		bgImg.onload = function(){
			overlayImg.src = overlaySrc;
		};
		
		overlayImg.onload = _.bind(function(){
			var y = 0, x = 0;
			_.each(target.flaps, function(flap, i){
				if(i > 0 && i % target.rows[0].length === 0){
					y += flap.height * 2;
					x = 0;
				}
				ctx.drawImage(bgImg, x, y, bgImg.width, bgImg.height);
				x += flap.width;
			});
			// One more for the back of our flap
			ctx.drawImage(bgImg, 0, y + (target.flaps[0].height * 2), bgImg.width, bgImg.height);
			ctx.drawImage(img, left, top, this.w, this.h);
			y = 0, x = 0;
			_.each(target.flaps, function(flap, i){
				if(i > 0 && i % target.rows[0].length === 0){
					y += flap.height * 2;
					x = 0;
				}
				ctx.drawImage(overlayImg, x, y, overlayImg.width, overlayImg.height);
				x += flap.width;
			}, this);
			ctx.drawImage(overlayImg, 0, y + (target.flaps[0].height * 2), overlayImg.width, overlayImg.height);

			// Create a texture from the incoming image data
			var map = new THREE.DataTexture(new Uint8Array(ctx.getImageData(0, 0, target.width, target.height).data), target.width, target.height),
				texture = new THREE.MeshLambertMaterial({
		            map: map
		        });

			map.needsUpdate = true;

			callback(texture);
			
			this.trigger('load');
		}, this);
		bgImg.src = this.tileSrc;
	},
	onload: function(){
		var target = this.collectTargets(this.bounds);
		
		if(target.rows.length === 0) return; // Nothing more to do

		var UV = this.generateUVs(target);
		
		this.generatePosterTexture(this.img, target, _.bind(function(texture){
			_.each(target.flaps, function(flap, i){
				flap.repaint(texture, UV.flaps[i]);
			});
		}, this));
	}
}, Backbone.Events);