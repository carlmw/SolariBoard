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
        /*
         * The Board renders with a single draw call, with both the vertices
         * and texture coords stored in buffer objects.
         *
         * The first iteration of the solariboard build new geometry everytime
         * the message was updated. This shader version only updates a list of
         * floats defining the char to render, therefore only needing a single
         * buffer update.
         */
        this.fontTexture = glUtil.loadTexture(gl, "img/chars.png");
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-.# '.split('');
        this.numChars = this.chars.length;

        this.fontShader = glUtil.createShaderProgram(gl, fontVS, fontFS,
            ["position", "texture", "charpos"],
            ["viewMat", "projectionMat", "time", "numChars", "diffuse"]
        );
        this.verticesPerChar = 4;

        var shader = this.fontShader;

        var size = 17;

        var indexBuffer = []
          , vertexBuffer = [];

        var i, index, u=0.0,v=0.0;


        var charWidth = 1.0, charHeight = 1.0;
        var x, y, z = 0;
        var offsetX = 0.1;

        y = 1.5;

        function setupCharHalf(x, y, u, v, i) {
            extend(vertexBuffer, [x, y, z]);
            extend(vertexBuffer, [u, v]);

            // Z coordinate is used as a marker for the animated vertices
            extend(vertexBuffer, [x+charWidth, y, z]);
            extend(vertexBuffer, [u+1, v]);

            extend(vertexBuffer, [x+charWidth, y+charHeight, z]);
            extend(vertexBuffer, [u+1, v+0.5]);

            extend(vertexBuffer, [x, y+charHeight, z]);
            extend(vertexBuffer, [u, v+0.5]);

            addFaceIndices(indexBuffer, i+0, i+1, i+2, i+3);
        };


        x = (-size/2) * (charWidth + offsetX);
        size = 6;
        for(index=0; index < size; index++) {

            setupCharHalf(x, y, 0, 0, 4*index);
            x += offsetX + charWidth;
        }



        var charPosBuffer = [];

        var bufsize = this.verticesPerChar;

        function addChar(x) {
            var i, buf = [];
            for (i=0; i<bufsize; i++) {
                buf.push(x);
            }

            extend(charPosBuffer, buf);
        };

        addChar(-1.0);
        addChar( 0.0);
        addChar( 1.0);
        addChar( 12.0);
        addChar( 20.0);
        addChar( 4.0);

        // This is the volatile buffer. It's still initialized as static_draw
        // since it's going to be updated very infrequently.
        this.charPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.charPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charPosBuffer), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(shader.attribute.charpos);
        gl.vertexAttribPointer(shader.attribute.charpos, 1, gl.FLOAT, false, 4, 0);


        // This is an interleaved buffer for texture coords and vertices.
        // [vert, vert, vert, texoord, texcoor, ...]
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(shader.attribute.position);
        gl.enableVertexAttribArray(shader.attribute.texture);
        gl.vertexAttribPointer(shader.attribute.position, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(shader.attribute.texture, 2, gl.FLOAT, false, 20, 12);

        // The index buffer is built alongside the vertex one and never
        // changes.
        this.indexBuffer = gl.createBuffer();
        this.numIndices = indexBuffer.length;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    };

    var timing = 0;

    SolariBoard.prototype.draw = function(gl, frameTime, projectionMat, viewMat) {
        var shader = this.fontShader;

        gl.useProgram(shader);

        gl.uniformMatrix4fv(shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(shader.uniform.projectionMat, false, projectionMat);

        timing += frameTime*0.0001;

        gl.uniform1f(shader.uniform.time, timing);
        gl.uniform1f(shader.uniform.numChars, this.numChars);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fontTexture);
        gl.uniform1i(shader.uniform.diffuse, 0);

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);

    };


    return SolariBoard;
});


