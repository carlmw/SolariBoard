define([
	"lib/gl-util",
	"src/renderer",
], function(glUtil, Renderer) {
	"use strict";

	function SolariBoard(options) {
		options = options || {};

		var renderer, canvas = options.canvas;

		if (canvas === undefined) {
			canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
		}

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		var gl = glUtil.getContext(canvas);

		if(!gl) {
			// Replace the canvas with a message that instructs them on how to get a WebGL enabled browser
			//glUtil.showGLFailed(frame);
			console.log('webgl initialization failed');
			return;
		}

		renderer = new Renderer(gl, canvas, {
			rows: options.rows || 18,
			cols: options.cols || 60,
			speed: options.speed || 0.008,
			distance: options.distance || 45
		});
		renderer.resize(gl, canvas);

		glUtil.startRenderLoop(gl, canvas, function(gl, timing) {
			renderer.drawFrame(gl, timing);
		});


			// Now that's clean design!
		this.setMessage = function(msg, centered) {
			var i, board = renderer.board
			  , arrfor = function(l1, l2) { return new Array(Math.round( (l1 - l2)/2 )) };

			if (centered) {
				var prefix = arrfor(board.rows, msg.length).join("x").split("x"); // :)
				msg.unshift.apply(msg, prefix);

				for (i=0; i<msg.length; i++) {
					if (msg[i].length) {
						msg[i] = arrfor(board.cols, msg[i].length).join(" ") + msg[i];
					}
				}
			}
			board.setMessage(msg);
		};
	}

	return SolariBoard;
});
