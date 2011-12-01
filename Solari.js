var Solari = Backbone.View.extend({
	DEG2RAD: Math.PI / 180,
	VIEW_ANGLE: 45,
	NEAR: -2000,
	FAR: 1000,
	flaps: [],
	rows: [],
	y: 0,
 	initialize: function(){
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.aspect = this.width / this.height;
		this.renderer = new THREE.WebGLRenderer
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
		this.renderer.setClearColorHex(0x111111, 1);

		this.pointLight = new THREE.PointLight(0xFFFFFF);
		
		this.pointLight.position.x = window.innerWidth / 2;
		this.pointLight.position.y = 0;
		this.pointLight.position.z = 1000;
		this.scene.add(this.pointLight);
	
		// Pull the camera back
		this.camera.position.x = window.innerWidth / 2 - 40;
		this.camera.position.y = -window.innerHeight / 2 + 120;
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
		return this;
	},
	displayStats: function(){
		this.showStats = true;
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		document.body.appendChild(this.stats.domElement);
	},
	start: function(){
		TWEEN.start();
	
		var flaps = this.flaps,
			self = this,
			rotation = {
				x: 0
			},
			MAX_X = 180 * this.DEG2RAD,
			flapLoop = function(flap){
				if(flap.wedged) return;
				flap.wrapper._flapWrapper.rotation.x = rotation.x;
			},
			completeLoop = function(flap){
				flap.next();
			},
			update = function(){
				flaps.forEach(flapLoop);
				self.render();
			};
		
		var flip = new TWEEN.Tween(rotation).
			to({x: MAX_X}, 160).
			onUpdate(update).
			onComplete(function(){
				rotation.x = 0;
				flaps.forEach(completeLoop);
			});
		
		flip.chain(flip);
		flip.start();
	},
	setMessage: function(msg){
		_.each(this.rows, function(row, i){
			row.setChars(msg[i]);
		});
	}
});