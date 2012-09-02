/*global THREE,_,Events */
var SolariTexture = function (src, chars, faceWidth, faceHeight) {};

SolariTexture.prototype = _.extend({
  loaded: false,
  chars: [],
  faces: {},
  load: function (src, chars, faceWidth, faceHeight) {
    this.chars = chars;
    this.faceWidth = faceWidth;
    this.faceHeight = faceHeight;
    this.max = chars.length - 1;

    this.spriteMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture(src)
    });

    this.UV = this.buildUVs();

    // this is only to make sure the image is loaded
    var self = this,
        img = new Image();
    img.onload = function () {
        self.trigger('load');
    };
    img.src = src;
  },
  buildUVs: function (ops) {
  /* For each character part build a set of 4 UV coords */
    var UV = {};

    var x = 0,
        y = 0,
        stepX = (1.0 / this.chars.length),
        stepY = 0.5;

    this.chars.forEach(function (ch, i) {
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
          new THREE.UV( x + stepX, y + 2 * stepY),
          new THREE.UV( x + stepX, y + stepY )
        ],
        back: [
          new THREE.UV( x + stepX, y + 2 * stepY),
          new THREE.UV( x + stepX, y + stepY ),
          new THREE.UV( x, y + stepY),
          new THREE.UV( x, y + 2 * stepY)
      ]};
      x += stepX;
    });
    return UV;
  }
}, Events);
