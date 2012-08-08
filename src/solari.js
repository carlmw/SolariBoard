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

    var SolariBoard = function (gl, options) {
        /*
         * The Board renders with a single draw call, with both the vertices
         * and texture coords stored in buffer objects.
         *
         * The first iteration of the solariboard build new geometry everytime
         * the message was updated. This shader version only updates a list of
         * floats defining the char to render, therefore only needing a single
         * buffer update.
         */
        this.texture = options.texture;
        this.chars = options.chars.split('');
        this.rows = options.rows;
        this.cols = options.cols;

        // A single variable passed into the animating shaders defining the
        // animation timeframe. The char buffer allows a unique offset for
        // each character.
        this.timing = 0.0;

        // We need this to fillup the charBuffer
        this.verticesPerChar = 12;

        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.charBuffer = gl.createBuffer();

        var indexBuffer = []
          , vertexBuffer = []
          , charBuffer = new Array(this.verticesPerChar * this.cols);

        // Setup an interlaced buffer with vertices and tex coords
        this._buildBuffers(indexBuffer, vertexBuffer, charBuffer);
        this.numIndices = indexBuffer.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.charBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(charBuffer), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBuffer), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    };

    SolariBoard.prototype.bindShaderAttribs = function(gl, character, position, texture) {
        /*
         * Point the shader attributes to the appropriate buffers.
         */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.charBuffer);
        gl.enableVertexAttribArray(character);
        gl.vertexAttribPointer(character, 1, gl.FLOAT, false, 4, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 20, 0);

        if (texture) {
            // the velocity rendering shader doesn't use the texture coord
            gl.enableVertexAttribArray(texture);
            gl.vertexAttribPointer(texture, 2, gl.FLOAT, false, 20, 12);
        }
    };

    SolariBoard.prototype._buildBuffers = function(indexBuffer, vertexBuffer, charBuffer) {
        var extend = function(a1, a2) { a1.push.apply(a1, a2); }
          , addFaceIndices = function(arr, a, b, c, d) { arr.push(c, d, a, c, a, b); }
          , i
          , index
          , x, y, z
          , charWidth = 1.0, charHeight = 1.0 // !charHeight is assumed to be 1.0 in the shaders!
          , offsetX = 0.1, offsetY;

        // Fill the char buffer with the "space" character
        for (i=0; i<charBuffer.length; i++) {
            charBuffer[i] = this.chars.length - 1;
        }

        // Add 4 vertices, texture coords and indices for each "flap"
        function setupCharHalf(x, y, u, v, i, animated) {

            // Z coordinate is used as a marker for the animated vertices
            // This is by far the biggest hack in this solari implementation.
            // The shader animates the rotation of the flaps, but the same
            // code runs for each vertex and we only want to animate 2 verts
            // for some of the flaps. So we need a way to "mark" them. We use
            // z for this.
            animated = (animated) ? 1.0 : 0.0;
            z = 0;

            extend(vertexBuffer, [x, y, z]);
            extend(vertexBuffer, [u, v]);

            extend(vertexBuffer, [x+charWidth, y, z]);
            extend(vertexBuffer, [u+1, v]);

            extend(vertexBuffer, [x+charWidth, y+charHeight, z+animated]);
            extend(vertexBuffer, [u+1, v+0.5]);

            extend(vertexBuffer, [x, y+charHeight, z+animated]);
            extend(vertexBuffer, [u, v+0.5]);

            addFaceIndices(indexBuffer, i+0, i+1, i+2, i+3);
        };

        x = (-this.cols/2) * (charWidth + offsetX);
        y = 1.5;
        for(index=0; index < this.cols; index++) {
            i = this.verticesPerChar * index;
            setupCharHalf(x, y-1, 0,   0, i);           // botom half of current character
            setupCharHalf(x, y,   0, 0.5, i+4);         // top half of next character

            setupCharHalf(x, y,   0, 0.5, i+8, true);   // animated flap with current character
                                                        // animated flap with the bottom of the next (backfacing)

            x += offsetX + charWidth;
        }
    };


    SolariBoard.prototype.setMessage = function(msg) {
        /*
         * Setting the message builds a new character buffer. It's pushed to
         * the gpu inside the draw call.
         */
        msg = msg.toUpperCase();
        var i, j, char, newBuffer = new Array(this.verticesPerChar * this.cols);

        for (i=0; i < this.rowSize; i++) {
            // for each character find it's index in our texture
            char = this.chars.length - 1;

            if (i < msg.length) {
                j = this.chars.indexOf(msg[i]);
                if (j!=-1) char = j;
            }

            // store the target value for each vertex rendering the char
            for (j=0; j < this.verticesPerChar; j++) {
                newBuffer[i*this.verticesPerChar+j] = char;
            }
        }
        this.newPosBuffer = newBuffer;
    };


    SolariBoard.prototype.update = function(time, gl) {
        this.timing += time * 0.0005; // this should be scaled to increment at 1.0 for each flap rotation

        if (this.newPosBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.charBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.newPosBuffer));
            this.newPosBuffer = null;
        }
    };

    SolariBoard.prototype.draw = function(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    };

    return SolariBoard;
});


