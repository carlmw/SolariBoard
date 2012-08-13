/*
 * Copyright (c) 2011 Brandon Jones
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

require(["lib/domReady!", // Waits for page load
    "src/SolariBoard",
], function(doc, SolariBoard) {
    "use strict";

    var Board = window.Board = new SolariBoard({
        rows: 18,
        cols: 60,
        speed: 0.004,
    });

    setTimeout(function () {

        Board.setMessage([
            'THUNDERCATS',
            'ARE ON THE MOVE',
            'THUNDERCATS ARE LOOSE',
            'FEEL THE MAGIC',
            'HEAR THE ROAR',
            'THUNDERCATS ARE LOOSE',
            'THUNDER THUNDER THUNDER',
            'THUNDERCATS HO'
            ], true) // centered
        }, 2000);
    setTimeout(function() {
        Board.setMessage([(new Date().toGMTString())], true);
    }, 10000);
});
