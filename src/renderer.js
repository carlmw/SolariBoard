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
            0, 0, 0,    0, 0,
            1, 0, 0,    1, 0,
            1, 1, 0,    1, 1,
            0, 1, 0,    0, 1
        ]), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            2, 3, 0, 2, 0, 1
        ]), gl.STATIC_DRAW);
    };

    ScreenQuad.prototype.bindShaderAttribs = function(gl, position, texture) {
        /*
         * Point the shader attributes to the appropriate buffers.
         */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 20, 0);

        gl.enableVertexAttribArray(texture);
        gl.vertexAttribPointer(texture, 2, gl.FLOAT, false, 20, 12);
    };

    ScreenQuad.prototype.draw = function(gl) {
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    };


    function Buffer(gl, width, height) {
        // A framebuffer that can be used as a render target
        this.width = width;
        this.height = height;
        this.id = gl.createFramebuffer();
        this.texture = gl.createTexture();

        var renderbuffer = gl.createRenderbuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //_MIPMAP_NEAREST);
        //gl.generateMipmap(gl.TEXTURE_2D);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    var Renderer = function (gl, canvas) {
        // To get a camera that gives you a flying first-person perspective, use camera.FlyingCamera
        // To get a camera that rotates around a fixed point, use camera.ModelCamera
        this.camera = new camera.ModelCamera(canvas);
        this.camera.distance = 15;

        this.fov = 45;
        this.projectionMat = mat4.create();
        mat4.perspective(this.fov, canvas.width/canvas.height, 1.0, 4096.0, this.projectionMat);

        this.orthoProjectionMat = mat4.ortho(-1, 1, 1, -1, -1, 1);

        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


        gl.frontFace(gl.CCW);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        this.board = new SolariBoard(gl, {
            rows: 1,
            cols: 20,
            texture: glUtil.loadTexture(gl, "img/chars.png"),
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-.# '
        });

        this.quad = new ScreenQuad(gl);

        var self = this;

        require([
            "lib/text!src/shaders/blur.vert",
            "lib/text!src/shaders/blur.frag",
            "lib/text!src/shaders/font.vert",
            "lib/text!src/shaders/font.frag"
        ], function(blurVS, blurFS, fontVS, fontFS) {
            // Post processing shader
            self.blurShader = glUtil.createShaderProgram(gl, blurVS, blurFS,
                ["position", "texture"],
                ["projectionMat", "imageTex"]
            );

            // The basic shader rendering the textured board
            self.fontShader = glUtil.createShaderProgram(gl, fontVS, fontFS,
                ["position", "texture", "character"],
                ["viewMat", "projectionMat", "timing", "numCharacters", "fontTex"]
            );
        });

        // The color buffer where we render the textured solari board. It's
        // than used as a source texture for the motion blur pass
        this.renderBuffer = new Buffer(gl, canvas.width, canvas.height);

        window.board = this.board; // quick hack for board testing
        this.board.setMessage("solari board");
    };

    Renderer.prototype.resize = function (gl, canvas) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        mat4.perspective(this.fov, canvas.width/canvas.height, 1.0, 4096.0, this.projectionMat);
    };

    Renderer.prototype.drawFrame = function (gl, timing) {
        /*
         * The draw consists of 3 passes:
         * 1) Render a regular solari board to texture.
         * 2) Render a velocity map to a texture
         * 3) Render a screensized quad bluring the final image along the velocity vectors
         */
        var viewMat = this.camera.getViewMat()
          , frameTime = timing.frameTime
          , board = this.board
          , shader;

        this.camera.update(frameTime);
        board.update(frameTime, gl);

        // First pass - rendered the textured solari board
        var shader = this.fontShader;
        gl.useProgram(shader);
        board.bindShaderAttribs(gl, shader.attribute.character, shader.attribute.position, shader.attribute.texture);

        gl.uniformMatrix4fv(shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(shader.uniform.projectionMat, false, this.projectionMat);

        //gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer.id);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1f(shader.uniform.timing, board.timing);
        gl.uniform1f(shader.uniform.numCharacters, board.chars.length);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, board.texture);
        gl.uniform1i(shader.uniform.fontTex, 0);

        board.draw(gl);




        /*
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform2fv(shader.uniform.screenSize, this.screenSize);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.frameBuffer.texture);
        */
    };

    return Renderer;
});
