var SolariFlap = Backbone.View.extend({
	i: 0,
	initialize: function(textureSet, x, y){
		var sets = [],
			faces = textureSet.faces,
			flapWidth = textureSet.faceWidth,
			flapHeight = textureSet.faceHeight,
			wrapper = new THREE.Object3D,
			flapWrapper = new THREE.Object3D,
			top = new THREE.Mesh(
				new THREE.PlaneGeometry(flapWidth, flapHeight),
				textureSet.spriteMaterial),
			bottom = new THREE.Mesh(
				new THREE.PlaneGeometry(flapWidth, flapHeight),
				textureSet.spriteMaterial),
			flap = new THREE.Mesh(
				new THREE.CubeGeometry(flapWidth, flapHeight, 0, 1, 1, 1, [
                    null, null, null, null,
                    textureSet.spriteMaterial,
                    textureSet.spriteMaterial
                ]),
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
		wrapper._top = top;
		wrapper._bottom = bottom;
		wrapper.add(top);
		wrapper.add(bottom);

		flapWrapper.add(flap);
		wrapper.add(flapWrapper);

		this.wrapper = wrapper;
		this.textureSet = textureSet;
		this.activeMaterials = textureSet.faces[textureSet.chars[0]];
		this.i = 0;
	},
	setChar: function(ch){
		var i = this.textureSet.chars.indexOf(ch);
		this.currentChar = i != -1 ? i : this.textureSet.max;
		return this;
	},
	next: function(){
		if(this.currentChar === this.i){
			this.wedged = true;
		}else{
			this.wedged = false;
			this.i = this.i >= this.textureSet.max ? 0 : this.i + 1;
			//this.activeMaterials = this.textureSet.faces[this.textureSet.chars[this.i]];

			this.wrapper._top.materials[0] = this.textureSet.spriteMaterial;
            //this.activeMaterials.topMaterial;
			this.wrapper._bottom.materials[0] = this.textureSet.spriteMaterial;
            //this.activeMaterials.bottomMaterial;

			//var flipperMaterials = this.activeMaterials.flipperMaterials;

			//_.each(this.wrapper._flap.geometry.faces, function(face, i){
			//	face.materials[0] = flipperMaterials[i];
			//});
		}
	}
});
