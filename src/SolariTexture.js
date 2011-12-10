var SolariTexture = function(src, chars, faceWidth, faceHeight){};
SolariTexture.prototype = _.extend({
	loaded: false,
	chars: [],
	faces: {},
	load: function(ops){
        var src = ops.src,
            chars = ops.chars,
            faceWidth = ops.faceWidth,
            faceHeight = ops.srcHeight;

		this.chars = chars;
		this.faceWidth = faceWidth;
		this.faceHeight = faceHeight;
		this.max = chars.length - 1;

		var self = this;

        self.spriteMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(ops.src)
        });


        this.UV = this.buildUVs(ops);

        // this is only to make sure the image is loaded
        var img = new Image();
        img.onload = function() {
            self.trigger('load');
        };
        img.src = ops.src;

	},
    buildUVs: function(ops) {
    /* For each character part build a set of 4 UV coords */
        var self = this,
            UV = {};

        var x = 0,
            y = 0,
            stepX = (1.0 / this.chars.length),
            stepY = 0.5;

        this.chars.forEach(function(ch, i) {

            UV[i] = {
                top: [
                    new THREE.UV( x, y),
                    new THREE.UV( x, y + stepY),
                    new THREE.UV( x + stepX, y + stepY),
                    new THREE.UV( x + stepX, y )
                ],
                bottom: [
                    new THREE.UV( x, y + stepY),
                    new THREE.UV( x, y + 2*stepY),
                    new THREE.UV( x + stepX, y + 2*stepY),
                    new THREE.UV( x + stepX, y + stepY )
                ],
                back: [
                    new THREE.UV( x + stepX, y + 2*stepY),
                    new THREE.UV( x + stepX, y + stepY ),
                    new THREE.UV( x, y + stepY),
                    new THREE.UV( x, y + 2*stepY)
            ]};
            x += stepX;
        });
        return UV;
    }
}, Backbone.Events);
