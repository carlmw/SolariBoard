/*
 * Copyright (c) Greg Furga
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

define([
    "lib/camera",
    "lib/gl-util",
    "src/solari",
    "lib/gl-matrix.js",
], function(camera, glUtil, SolariBoard) {
    "use strict";

    var Renderer = function (gl, canvas) {
        // To get a camera that gives you a flying first-person perspective, use camera.FlyingCamera
        // To get a camera that rotates around a fixed point, use camera.ModelCamera
        this.camera = new camera.ModelCamera(canvas);
        this.camera.distance = 15;

        this.fov = 45;
        this.projectionMat = mat4.create();
        mat4.perspective(this.fov, canvas.width/canvas.height, 1.0, 4096.0, this.projectionMat);

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        window.board = this.board = new SolariBoard(gl, canvas);

    };

    Renderer.prototype.resize = function (gl, canvas) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        mat4.perspective(this.fov, canvas.width/canvas.height, 1.0, 4096.0, this.projectionMat);
    };

    Renderer.prototype.drawFrame = function (gl, timing) {
        var viewMat = this.camera.getViewMat()
          , frameTime = timing.frameTime
          , projectionMat = this.projectionMat
          , board = this.board;

        this.camera.update(frameTime);

        board.draw(gl, frameTime, projectionMat, viewMat);
    };

    return Renderer;
});
