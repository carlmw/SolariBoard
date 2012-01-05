var DEG2RAD =  Math.PI / 180,
    SPEED = 1400.0;

var SolariFlap = Backbone.View.extend({
    MAX_X: Math.PI,
    initialize: function(textureSet, x, y){
        var flapWidth = textureSet.faceWidth,
            flapHeight = textureSet.faceHeight,
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
                new THREE.MeshFaceMaterial()),
            varia = 1.1 - Math.random() * 0.2;

        this.SPEED = SPEED * DEG2RAD / 1000.0 * varia;

		this.width = flapWidth;
		this.height = flapHeight;
		this.x = x;
		this.y = y;
		this.textureSet = textureSet;
		this.top = top;

        this.top_g = top.geometry;
		this.bottom = bottom
        this.bottom_g = bottom.geometry;
		this.flap = flap;
        this.flap_g = flap.geometry;
        this.top_g.dynamic = this.bottom_g.dynamic = this.flap_g.dynamic = true;

        bottom.position = new THREE.Vector3(x, y, 0);
        top.position = new THREE.Vector3(x, y + flapHeight, 0);
        flap.position = new THREE.Vector3(0, flapHeight/2, 0);

        this.flapWrapper = new THREE.Object3D;
        this.flapWrapper.position = new THREE.Vector3(x, y + flapHeight/2, 2);
        this.flapWrapper.add(flap);

        this.objToRender = [top, bottom, this.flapWrapper];

        this.i = 0;
        this.setUpTextures(0, 1);
    },
    setUpTextures: function(from, to) {
        /* Setting up the coming character. */
        var current = this.textureSet.UV[from],
            next = this.textureSet.UV[to];
		
		this.paint(this.textureSet.spriteMaterial, {
			top: next.top,
			prevBottom: current.bottom,
	        prevTop: current.top,
	        back: next.back
		});
    },
    setChar: function(ch){
        var i = this.textureSet.chars.indexOf(ch);
        this.currentChar = i != -1 ? i : this.textureSet.max;
        this.wedged = this.currentChar == this.i;
		
        return this;
    },
    next: function(){		
        this.i = this.i >= this.textureSet.max ? 0 : this.i + 1;
		
    	var next = (this.i + 1 > this.textureSet.max) ? 0 : this.i + 1;
    	
		if(!this.wedged) this.setUpTextures(this.i, next);

        this.wedged = this.currentChar === this.i || this.wedged;

		if(this.i == this.textureSet.max) this.trigger('cycleend');
    },
    update: function(diff) {
        var x = this.flapWrapper.rotation.x;
        if (this.wedged) return true;

        x += diff * this.SPEED;

        this.flapWrapper.rotation.x = x;
		
        if(x > this.MAX_X){			
			this.trigger('animationend');
			if(this.wedged) return true;

            this.flapWrapper.rotation.x = 0;
            this.next();
			
            if(this.wedged && (Math.random() > 0.995)){
				this.next();
				this.wedged = false;
			}
        }
        return false;
    },
	paint: function(material, uv){
		this.top.materials[0] = this.bottom.materials[0] = this.flap.materials[0] = material;
        this.top_g.faceVertexUvs[0][0] = uv.top;
        this.bottom_g.faceVertexUvs[0][0] = uv.prevBottom;
        this.flap_g.faceVertexUvs[0][4] = uv.prevTop;
        this.flap_g.faceVertexUvs[0][5] = uv.back;
        this.top_g.__dirtyUvs = this.bottom_g.__dirtyUvs = this.flap_g.__dirtyUvs = true;
	}
});
