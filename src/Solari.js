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
    SCREEN_DISPLAY_SECS: 120,
	NEAR: 1,
	FAR: 10000,
 	initialize: function(){
        this.animate = false;
		this.flaps = [];
		this.rows = [];
        this.screens = [];
        this.currentScreenNum = 0;
		this.y = 0;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
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

        _.bindAll(this, 'screenUpdated');
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
        var i,
            flaps = this.flaps,
            done = true;

        for (i=0; i<flaps.length; i++) {
            done = flaps[i].update(diff) && done;
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
            self.stats.update();
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

        setInterval(function(){
            if (self.currentScreenNum == (self.screens.length - 1)){
                self.currentScreenNum = 0;
            } else {
                self.currentScreenNum++;
            }
            self.screenUpdated();
        }, 1000 * 30);

		this.trigger('start');
	},
	setMessage: function(msg){
		_.each(this.rows, function(row, i){
			row.setChars(msg[i] ? msg[i] : ' ');
		});
		return this;
	},
    registerPlugin: function(plugin){
        var scr = new SolariScreen;
        scr.init(this.rows.length, this.rows[0].flaps.length);
        scr.bind('screenUpdated', this.screenUpdated);
        this.screens.push(scr);
        plugin.init(scr);
        this.bind('start', plugin.start);
    },
    screenUpdated: function(){
        var scr = this.screens[this.currentScreenNum],
            matrix = scr.matrix;
        _.each(this.rows, function(row, i){
            matrix_row = matrix[i].join('');
            row.setChars(matrix_row);
        });
    }
});
