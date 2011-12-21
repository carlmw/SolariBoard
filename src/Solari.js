String.prototype.rpad = function(padString, length){
	var str = this;
    while (str.length < length){
        str = str + padString;
	}
    return str;
};
String.prototype.truncate = function(length){
	this.length = length;
    return this;
};

window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

var Solari = Backbone.View.extend({
	VIEW_ANGLE: 45,
	NEAR: 1,
	FAR: 10000,
 	initialize: function(){
        this.animate = false;
		this.flaps = [];
		this.rows = [];
		this.y = 0;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.boardWidth = 0;
		this.boardHeight = 0;
		this.aspect = this.width / this.height;
		this.renderer = new THREE.WebGLRenderer;
        this.renderer.sortObjects = false;

		this.camera = new THREE.PerspectiveCamera(
            20.0,
            window.innerWidth / innerHeight,
			this.NEAR,
			this.FAR
		);
		this.scene = new THREE.Scene;

		this.renderer.setSize(this.width, this.height);

		this.pointLight = new THREE.PointLight(0xFFFFFF);
        this.ambientLight = new THREE.AmbientLight(0x333333);

		this.pointLight.position.x = 1000;
		this.pointLight.position.y = -800;
		this.pointLight.position.z = 300;

		this.scene.add(this.pointLight);
		this.scene.add(this.ambientLight);

		// Pull the camera back
		this.camera.position.z = 3200;
        this.camera.lookAt(new THREE.Vector3((0,0,0)));

		this.el = this.renderer.domElement;
	},
	render: function(){
		this.renderer.render(this.scene, this.camera);
		if(this.showStats) this.stats.update();
	},
	add: function(row){
		this.rows.push(row);
		this.flaps = this.flaps.concat(row.flaps);

		var self = this;
		_.each(row.flaps, function(flap){
            _.each(flap.objToRender, function(obj) {
			    self.scene.add(obj);
            });
		});
		this.y += row.height;
		
		this.boardWidth = Math.max(this.boardWidth, row.x);
		this.boardHeight += row.height;
		
		this.camera.position.x = (row.x) / 2;
		this.camera.position.y = -((row.y - (row.height/2)) / 2);

		return this;
	},
	displayStats: function(){
		this.showStats = true;
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		document.body.appendChild(this.stats.domElement);
	},
    update: function(diff) {
        var i,
            flaps = this.flaps,
            done=true;

        for (i=0; i<flaps.length; i++) {
            done &= flaps[i].update(diff);
        }
        return done;
    },
	start: function(){
        var self = this,
            lastTime = new Date().getTime();

        if (!this.stats) this.displayStats();

        function animate(lastTime){
            // update
            var time = new Date().getTime();
            var timeDiff = time - lastTime;
            lastTime = time;
            // render

            self.anim = ! self.update(timeDiff);

            if (self.stats) self.stats.update();

            self.render();

            // request new frame
            if (self.anim) { 
                requestAnimFrame(function(){
                	animate(lastTime);
                }); 
            } else {
                setTimeout(function() {
                    animate((new Date().getTime()));
                }, 2000)
            }

        }
        animate(lastTime);

		this.trigger('start');
	},
	setMessage: function(msg){
		_.each(this.rows, function(row, i){
			row.setChars(msg[i] ? msg[i] : ' ');
		});

        if (!this.anim) this.start();

		return this;
	},
	setImage: function(img, w, h){
		// Now we have our texture we'll work out the top and left from which to start 
		// and end paint.
		var boardWidth = this.boardWidth,
			boardHeight = this.boardHeight,
			startLeft = (boardWidth - w) / 2,
			startTop = (boardHeight - h) / 2,
			endLeft = startLeft + w,
			endTop = startTop + h;
		
		// Now we need to work out which flaps we'll be drawing on
		var targetFlaps = [],
			targetRows = [],
			targetWidth = 0,
			targetHeight = 0;

		_.each(this.rows, function(row){
			var rowFlaps = _.filter(row.flaps, function(flap){
				// Get the left and right of the flap relative to the board
				var top = flap.relativeTop = Math.abs(flap.y),
					left = flap.relativeLeft = (flap.x - (flap.width / 2));
				
				return (
					left > (startLeft - flap.width) &&
					top > (startTop - (flap.height * 2)) &&
					left < (endLeft) &&
					top < (endTop)
				);
			});
			
			if(rowFlaps.length > 0){
				targetHeight += (rowFlaps[0].height * 2);
				targetFlaps = targetFlaps.concat(rowFlaps);
				targetRows.push(rowFlaps);
			}
		});

		targetWidth = _.reduce(targetRows[0], function(memo, flap){ return memo + flap.width }, 0);
		
		if(targetRows.length === 0){
			return;
		}
		
		// Now generate our UV's, this will be fun
		var UV = [],
			rowLength = targetRows[0].length,
			x = 0,
			y = 0,
			stepX = 1.0 / rowLength,
			stepY = 1.0 / (targetRows.length * 2);
			
		_.each(targetFlaps, function(flap, i){
			if(i > 0 && i % rowLength === 0){
				x = 0;
				y += (stepY * 2);
			}
			UV[i] = {
				top: [
                    new THREE.UV(x, y),
                    new THREE.UV(x, y + stepY),
                    new THREE.UV(x + stepX, y + stepY),
                    new THREE.UV(x + stepX, y)
                ],
                bottom: [
	                new THREE.UV(x, y + stepY),
	                new THREE.UV(x, y + (stepY * 2)),
	                new THREE.UV(x + stepX, y + (stepY * 2)),
	                new THREE.UV(x + stepX, y + stepY)
                ],
                back: [
                	new THREE.UV( x + stepX, y + (2 * stepY)),
                	new THREE.UV( x + stepX, y + stepY ),
                	new THREE.UV( x, y + stepY),
                	new THREE.UV( x, y + (2 * stepY))
				]
			};
			x += stepX;
		});
		
		// Take the incoming image and center it on a canvas of our target size
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			left = (targetWidth - w) / 2,
			top = (targetHeight - h) / 2;
			
		canvas.width = targetWidth;
		canvas.height = targetHeight;

		var bgImg = document.createElement('img'),
			overlayImg = document.createElement('img');
		
		bgImg.onload = function(){
			overlayImg.src = 'img/flap-overlay.png';
		};
		
		overlayImg.onload = function(){
			var y = 0, x = 0;
			_.each(targetFlaps, function(flap, i){
				if(i > 0 && i % rowLength === 0){
					y += flap.height * 2;
					x = 0;
				}
				ctx.drawImage(bgImg, x, y, bgImg.width, bgImg.height);
				x += flap.width;
			});
			ctx.drawImage(img, left, top, w, h);
			y = 0, x = 0;
			_.each(targetFlaps, function(flap, i){
				if(i > 0 && i % rowLength === 0){
					y += flap.height * 2;
					x = 0;
				}
				ctx.drawImage(overlayImg, x, y, overlayImg.width, overlayImg.height);
				x += flap.width;
			});

			// Create a texture from the incoming image data
			var map = new THREE.DataTexture(new Uint8Array(ctx.getImageData(0, 0, targetWidth, targetHeight).data), targetWidth, targetHeight),
				texture = new THREE.MeshLambertMaterial({
		            map: map
		        });
	
			map.needsUpdate = true;
		
			// Pugify
			_.each(targetFlaps, function(flap, i){
				flap.repaint(texture, UV[i]);
			});
		};
		bgImg.src = 'img/flap-bg.jpg';
	}
});
