var PosterTexture = (function(){
	var loadImage = function(src, callback){
		var img = new Image;
		img.onload = function(){
			callback(img);
		};
		img.src = src;
	},
	loadImages = function(srcs, callback){
		var imgs = [];
		_.each(srcs, function(src){
			loadImage(src, function(img){
				imgs[srcs.indexOf(src)] = img;
				if(imgs.length === srcs.length){
					callback.apply(this, imgs);
				}
			});
		}, this);
	},
	PosterTexture = function(src, rows){
		this.max = 0;
		this.maxTargetWidth = _.reduce(rows[0].flaps, function(memo, flap){ return memo + flap.width }, 0);
		this.maxTargetHeight = (rows[0].flaps[0].height * 2) * rows.length;

		this.rows = rows;
		this.img = document.createElement('img');
		document.body.appendChild(this.img);
		this.img.onload = _.bind(this.onload, this);
		this.img.src = src;
	};
	PosterTexture.prototype = _.extend({}, Backbone.Events, {
		tileSrc: 'img/flap-bg.jpg',
		overlayTileSrc: 'img/flap-overlay.png',
		collectTargets: function(){
			var bounds = this.bounds,
				target = {
					flaps: [],
					rows: [],
					width: 0,
					height: 0
				};
		
			target.rows = this.collectTargetRows(this.rows, bounds);
			target.flaps = _.reduceRight(target.rows, function(row, memo){ return memo.concat(row); }, []);

			if(target.rows.length === 0) return target;
		
			target.width = _.reduce(target.rows[0], function(memo, flap){ return memo + flap.width }, 0);
			target.height = (target.flaps[0].height * 2) * target.rows.length;

			return target;
		},
		collectTargetFlaps: function(flaps, bounds){
			 return _.filter(flaps, function(flap){ return this.testFlapBounds(flap, bounds); }, this);
		},
		collectTargetRows: function(rows, bounds){
			return _.filter(
				_.map(rows, function(row){ return this.collectTargetFlaps(row.flaps, bounds); }, this),
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
			var UV = {},
				rowLength = target.rows[0].length,
				x = 0,
				y = 0,
				ydiv = target.rows.length * 2,
				stepX = 1.0 / rowLength,
				stepY = 1.0 / (ydiv + 2); // The +1 is the additional row we'll need for the front of the previous flap

			var baseUV = { // We'll extend this and use the base when we're exiting the poster returning to the default texture set
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
				UV[flap.cid] = _.extend({}, baseUV, {
					top: [
		                new THREE.UV(x, y),
		                new THREE.UV(x, y + stepY),
		                new THREE.UV(x + stepX, y + stepY),
		                new THREE.UV(x + stepX, y)
		            ],
		            back: [
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
		generateCompositeDataTexture: function(target, callback){
			// Take the incoming image and center it on a canvas of our target size
			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				left = (target.width - this.w) / 2,
				top = (target.height - this.h) / 2,
				img = this.img;
		
			target.height += (target.flaps[0].height * 2); // One more for the back of our flap
			canvas.width = target.width;
			canvas.height = target.height;
		
			loadImages([this.tileSrc, this.overlayTileSrc], _.bind(function(tileImg, overlayImg){
				// When tiling add one for the back of our flap
				this.tileImage(ctx, tileImg, target.rows.length + 1, target.rows[0].length, target.flaps[0].width, target.flaps[0].height * 2);
				ctx.drawImage(img, left, top, this.w, this.h);
				this.tileImage(ctx, overlayImg, target.rows.length + 1, target.rows[0].length, target.flaps[0].width, target.flaps[0].height * 2);

				// Create a data texture from the image data
				var map = this.map = new THREE.DataTexture(new Uint8Array(ctx.getImageData(0, 0, target.width, target.height).data), target.width, target.height);
				map.needsUpdate = true;
			
				return callback(map);
			}, this));
		},
		tileImage: function(ctx, img, rows, length, w, h){
			var y = 0, x = 0;
			_.times(rows * length, function(i){
				if(i > 0 && i % length === 0){
					y += h;
					x = 0;
				}
				ctx.drawImage(img, x, y, w, h);
				x += w;
			});
		},
		generatePosterMaterial: function(target){
			this.generateCompositeDataTexture(target, _.bind(function(map){
				this.spriteMaterial = new THREE.MeshLambertMaterial({
		            map: map
		        });
				this.img.parentNode.removeChild(this.img);
				this.img = null;
				
				this.loadHandler();
				this.trigger('load');
			}, this));
		},
		onload: function(){
			this.img.style.maxWidth = this.maxTargetWidth + 'px';
			this.img.style.maxHeight = this.maxTargetHeight + 'px';
			
			this.w = this.img.clientWidth;
			this.h = this.img.clientHeight;
			
			this.bounds = { // the coords from which to start and end painting.
				left: (this.maxTargetWidth - this.w) / 2,
				top: (this.maxTargetHeight - this.h) / 2,
			 	right: (this.maxTargetWidth - this.w) / 2 + this.w,
			 	bottom: (this.maxTargetHeight - this.h) / 2 + this.h
			};
			
			var target = this.target = this.collectTargets(this.rows);
			if(target.rows.length === 0) return; // Nothing more to do

			var UV = this.UV = this.generateUVs(target);
		
			this.generatePosterMaterial(target);
		},
		loadHandler: function(){
			var self = this,
				l = this.target.flaps.length,
				i = 0,
				deallocateHandler = function(){
					if(i === l) self.deallocate(Board.renderer); // @todo remove evil reference to Board
					i++;
				},
				cycleHandler = function(){
					this.paint(self.spriteMaterial, self.UV[this.cid]);
					var animationHandler = function(){
						this.flapWrapper.rotation.x = Math.PI;
						this.i = 0;
						this.wedged = true;
						this.unbind('animationend', animationHandler);
						
						this.bind('animationend', deallocateHandler); // Tidy up when all of the target flaps have been updated
					};
					this.bind('animationend', animationHandler);
					this.unbind('cycleend', cycleHandler);
				};
			_.invoke(this.target.flaps, 'bind', 'cycleend', cycleHandler);
		},
		deallocate: function(renderer){
			renderer.deallocateTexture(this.map);
			this.map = null;
			renderer.deallocateObject(this.spriteMaterial);
		}
	});
	
	return PosterTexture;
})();