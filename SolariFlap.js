var SolariFlap = Backbone.View.extend({
	i: 0,
	initialize: function(textureSet, x, y){
		var sets = [],
			faces = textureSet.faces,
			flapWidth = textureSet.faceWidth,
			flapHeight = textureSet.faceHeight;
		
		textureSet.chars.forEach(function(c){
			var wrapper = new THREE.Object3D,
				flapWrapper = new THREE.Object3D,
				top = new THREE.Mesh(
					new THREE.PlaneGeometry(flapWidth, flapHeight),
					faces[c].topMaterial),
				bottom = new THREE.Mesh(
					new THREE.PlaneGeometry(flapWidth, flapHeight),
					faces[c].bottomMaterial),
				flap = new THREE.Mesh(
					new THREE.CubeGeometry(flapWidth, flapHeight, 0, 1, 1, 1, faces[c].flipperMaterials),
					new THREE.MeshFaceMaterial());
				
			flap.position.y = flapHeight / 2;
			flapWrapper.position.y = flapHeight / 2;
			flapWrapper.position.z = 2;
			top.position.y = flapHeight;
			top.position.z = 1;
			bottom.position.z = 1;
			wrapper.position.x = x;
			wrapper.position.y = y;
			
			wrapper._flapWrapper = flapWrapper;
			wrapper._flap = flap;
			wrapper.add(top);
			wrapper.add(bottom);
			
			flapWrapper.add(flap);
			wrapper.add(flapWrapper);
			
			sets[c] = wrapper;
		});
		
		this.textureSet = textureSet;
		this.active = sets[textureSet.chars[0]];
		this.sets = sets;
		this.i = 0;
	},
	setChar: function(ch){
		var i = this.textureSet.chars.indexOf(ch);
		this.currentChar = i != -1 ? i : this.textureSet.max;
		return this;
	}
});