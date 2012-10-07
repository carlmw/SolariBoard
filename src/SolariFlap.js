/*global THREE */
var DEG2RAD =  Math.PI / 180,
    SPEED = 1400.0,
    SolariFlap;

SolariFlap = function (textureSet, x, y) {
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

  this.textureSet = textureSet;
  this.top_g = top.geometry;
  this.bottom_g = bottom.geometry;
  this.flap_g = flap.geometry;
  this.top_g.dynamic = this.bottom_g.dynamic = this.flap_g.dynamic = true;

  bottom.position = new THREE.Vector3(x, y, 0);
  top.position = new THREE.Vector3(x, y + flapHeight, 0);
  flap.position = new THREE.Vector3(0, flapHeight/2, 0);

  this.flapWrapper = new THREE.Object3D();
  this.flapWrapper.position = new THREE.Vector3(x, y + flapHeight/2, 2);
  this.flapWrapper.add(flap);

  this.objToRender = [top, bottom, this.flapWrapper];

  this.i = 0;
  this.setUpTextures(0, 1);
};

SolariFlap.prototype = {
  MAX_X: 180 * DEG2RAD,
  initialize: function (textureSet, x, y) {
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

    this.textureSet = textureSet;
    this.top_g = top.geometry;
    this.bottom_g = bottom.geometry;
    this.flap_g = flap.geometry;
    this.top_g.dynamic = this.bottom_g.dynamic = this.flap_g.dynamic = true;

    bottom.position = new THREE.Vector3(x, y, 0);
    top.position = new THREE.Vector3(x, y + flapHeight, 0);
    flap.position = new THREE.Vector3(0, flapHeight/2, 0);

    this.flapWrapper = new THREE.Object3D();
    this.flapWrapper.position = new THREE.Vector3(x, y + flapHeight/2, 2);
    this.flapWrapper.add(flap);

    this.objToRender = [top, bottom, this.flapWrapper];

    this.i = 0;
    this.setUpTextures(0, 1);
  },
  setUpTextures: function (from, to) {
    /* Setting up the coming character. */
    var current = this.textureSet.UV[from],
        next = this.textureSet.UV[to];

    this.top_g.faceVertexUvs[0][0] = next.top;
    this.bottom_g.faceVertexUvs[0][0] = current.bottom;
    this.flap_g.faceVertexUvs[0][4] = current.top;
    this.flap_g.faceVertexUvs[0][5] = next.back;

    this.top_g.__dirtyUvs = this.bottom_g.__dirtyUvs = this.flap_g.__dirtyUvs = true;
  },
  setChar: function (ch) {
    var i = this.textureSet.chars.indexOf(ch);
    this.currentChar = i !== -1 ? i : this.textureSet.max;
    this.wedged = this.currentChar === this.i;
    return this;
  },
  next: function () {
    this.i = this.i >= this.textureSet.max ? 0 : this.i + 1;
    var next = (this.i + 1 > this.textureSet.max) ? 0 : this.i + 1;
    this.setUpTextures(this.i, next);

    this.wedged = (this.currentChar === this.i);
  },
  update: function (diff) {
    if (this.wedged) {
      this.flapWrapper.rotation.x = 0;
      return true;
    }
    var x = this.flapWrapper.rotation.x;
    x += diff * this.SPEED;
    
    this.flapWrapper.rotation.x = x;
    if (x > this.MAX_X) {
      this.flapWrapper.rotation.x = 0;
      this.next();
    }
    return false;
  }
};
