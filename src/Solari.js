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
	setImage: function(src, w, h){
		// Create a texture from the incoming image data
		var texture = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(src)
        });

		// Now we have our texture we'll work out the x, y to start painting from
		var boardWidth = this.boardWidth,
			boardHeight = this.boardHeight,
			centerX = this.boardWidth / 2,
			centerY = this.boardHeight /2,
			startLeft = Math.round((boardWidth - w) / 2),
			startTop = Math.round((boardHeight - h) / 2),
			endLeft = startLeft + w,
			endTop = startTop + h;
			
		// console.log(startX + ' - ' + startY);
		
		// Now we need to work out which flaps we'll be drawing on
		var targetFlaps = _.filter(this.flaps, function(flap){
			// Convert the positions of the flaps to top and left relative to the board
			// console.log(flap.height + ' - ' + Math.abs(flap.y) + ' - ' + centerY);
			// console.log(flap.width + ' - ' + flap.x + ' - ' + centerX);
			var top = Math.abs(flap.y),
				left = (flap.x - (flap.width / 2));
				
			console.log(left + ' ' + top)
			// console.log((flap.top) + ' -- ' + (flap.y));
			return top >= startLeft && left >= startLeft && (top + flap.width) < endTop && (left + flap.height) < endLeft;
		});
		
		_.each(targetFlaps, function(flap){
			flap.setChar('T');
		});
		console.log(targetFlaps.length);
	}
});
