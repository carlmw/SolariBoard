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
	DEG2RAD: Math.PI / 180,
    SPEED: 801.0,
	VIEW_ANGLE: 45,
	NEAR: -2000,
	FAR: 1000,
 	initialize: function(){
        this.MAX_X = 180 * this.DEG2RAD;
        this.SPEED = this.SPEED * this.DEG2RAD / 1000.0;

		this.flaps = [];
		this.rows = [];
		this.y = 0;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.aspect = this.width / this.height;
		this.renderer = new THREE.WebGLRenderer;
		this.camera = new THREE.OrthographicCamera(
			window.innerWidth / - 2,
			window.innerWidth / 2,
			window.innerHeight / 2,
			window.innerHeight / - 2,
			this.NEAR,
			this.FAR
		);
		this.scene = new THREE.Scene;

		this.renderer.setSize(this.width, this.height);

		this.pointLight = new THREE.PointLight(0xFFFFFF);

		this.pointLight.position.x = window.innerWidth / 2;
		this.pointLight.position.y = -200;
		this.pointLight.position.z = 600;
		this.scene.add(this.pointLight);

		// Pull the camera back
		this.camera.position.z = 0;

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
			self.scene.add(flap.wrapper);
		});
		this.y += row.height + 10;

		this.camera.position.x = (row.x - 10) / 2;
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
		var i, flaps = this.flaps;

        for (i=0; i<flaps.length; i++) {
            var flap = flaps[i],
                x = flap.wrapper._flapWrapper.rotation.x;

            if (flap.wedged) continue;

            x += diff * this.SPEED;

            flap.wrapper._flapWrapper.rotation.x = x;
            if (x > this.MAX_X) {
                flap.wrapper._flapWrapper.rotation.x = 0;
                flap.next();
            }
        }
    },
	start: function(){
        var self = this,
            lastTime = new Date().getTime();

        self.displayStats();
        function animate(lastTime){
            // update
            var time = new Date().getTime();
            var timeDiff = time - lastTime;
            lastTime = time;
            // render
            self.update(timeDiff);
            self.stats.update();
            self.render();

            // request new frame
            requestAnimFrame(function(){
                animate(lastTime);
            });
        }
        animate(lastTime);

		this.trigger('start');
	},
	setMessage: function(msg){
		_.each(this.rows, function(row, i){
			row.setChars(msg[i] ? msg[i] : ' ');
		});

		return this;
	}
});
