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
    "lib/gl-matrix.js",
], function() {
    "use strict";

    var ScreenQuad = function (gl, options) {
        /*
         * A quad covering the screen for post ptocessing effects
         */
        //this.width = options.width;
        //this.height = options.height;

        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.numIndices = 6;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
           -1,-1, 0,
            1,-1, 0,
            1, 1, 0,
           -1, 1, 0
        ]), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            1, 0, 2, 0, 3, 2
        ]), gl.STATIC_DRAW);
    };

    ScreenQuad.prototype.bindShaderAttribs = function(gl, position) {
        /*
         * Point the shader attributes to the appropriate buffers.
         */
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    };

    ScreenQuad.prototype.draw = function(gl) {
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    };

    return ScreenQuad;
});


