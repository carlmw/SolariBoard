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
    "lib/text!src/shader_font.vert",
    "lib/text!src/shader_font.frag",
    "lib/gl-util",
    "lib/gl-matrix.js",
], function(fontVS, fontFS, glUtil) {
    "use strict";
    var extend = function(a1, a2) { a1.push.apply(a1, a2); }
      , addFaceIndices = function(arr, a, b, c, d) { arr.push(c, d, a, c, a, b); };
      //ab
      //dc

    var SolariBoard = function (gl) {
        this._buildRow(gl, 17);
        this.moveTime = this.xmoveAccum = this.ymoveAccum = 0;
        this.xFrom = this.xTo = this.yFrom = this.yTo = 0;

        this.fontTexture = glUtil.loadTexture(gl, "img/chars.png");

        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-.# '.split('');
        this.numChars = this.chars.length;

        this.fontShader = glUtil.createShaderProgram(gl, fontVS, fontFS,
            ["position", "texture", "charpos"],
            ["viewMat", "projectionMat", "offset", "numChars", "diffuse"]
        );
        var shader = this.fontShader;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shellVertexBuffer);

        gl.enableVertexAttribArray(shader.attribute.position);
        gl.enableVertexAttribArray(shader.attribute.texture);
        gl.vertexAttribPointer(shader.attribute.position, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(shader.attribute.texture, 2, gl.FLOAT, false, 20, 12);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.charPosBuffer);
        gl.enableVertexAttribArray(shader.attribute.charpos);
        gl.vertexAttribPointer(shader.attribute.charpos, 1, gl.FLOAT, false, 4, 0);

    };

    SolariBoard.prototype._buildRow = function(gl, size) {
        this.size = size;

        var depth = 5
          , shellIndices = []
          , shellBuffer = []
          , refcoords = [
            [0, 0], // a
            [1, 0], // b
            [1, 1], // d
            [0, 1], // c
        ]
        , offset = 10.0
        , layersize = size*size
        , l2 = layersize * 2
        , x = -offset
        , y = offset
        , z = 2.0
        , i, j, t; // loop counters

        // a  b    a  b
        //    b  a    b  a
        //
        // d  c    d  c
        //  c  d    c  d
        var u=0,v=0;

        x = -1.5;
        y = 1.5;
        //for (x=-offset; j<offset; x++) {
            extend(shellBuffer, [x, y, z]);
            extend(shellBuffer, [u, v]);

            extend(shellBuffer, [x+3.0, y, z]);
            extend(shellBuffer, [u+1, v]);

            extend(shellBuffer, [x+3.0, y+3.0, z]);
            extend(shellBuffer, [u+1, v+1]);

            extend(shellBuffer, [x, y+3.0, z]);
            extend(shellBuffer, [u, v+1]);

        //}
        i=0;
            addFaceIndices(shellIndices, i+0, i+1, i+2, i+3);

        var charPosBuffer = [23.0,23.0,23.0,23.0];

        this.charPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.charPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charPosBuffer), gl.STATIC_DRAW);

        this.shellVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.shellVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shellBuffer), gl.STATIC_DRAW);

        this.shellIndexBuffer = gl.createBuffer();
        this.numIndices = shellIndices.length;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shellIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shellIndices), gl.STATIC_DRAW);
    };


    SolariBoard.prototype.draw = function(gl, frameTime, projectionMat, viewMat) {
        var shader = this.fontShader;

        gl.useProgram(shader);

        gl.uniformMatrix4fv(shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(shader.uniform.projectionMat, false, projectionMat);

        var offset = 0;
        gl.uniform2fv(shader.uniform.offset, [offset, offset]);

        gl.uniform1f(shader.uniform.numChars, this.numChars);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fontTexture);
        gl.uniform1i(shader.uniform.diffuse, 0);


        //gl.bindBuffer(gl.ARRAY_BUFFER, this.charPosBuffer);
        //gl.enableVertexAttribArray(shader.attribute.charpos);
        //gl.vertexAttribPointer(shader.attribute.charpos, 1, gl.FLOAT, false, 0, 0);

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);

    };


    return SolariBoard;
});


