/*:
* @plugindesc SwipeToCommonEvent v1.0.3
* Allows running specified common events when swiping up, down, left, or right on the screen.
*
* @author BMPgames, CHatGPT
*
* @param swipeUpEventId
* @text Swipe Up Event ID
* @type number
* @min 1
* @desc Common event ID to run when swiping up on the screen.
* @default 1
*
* @param swipeDownEventId
* @text Swipe Down Event ID
* @type number
* @min 1
* @desc Common event ID to run when swiping down on the screen.
* @default 2
*
* @param swipeLeftEventId
* @text Swipe Left Event ID
* @type number
* @min 1
* @desc Common event ID to run when swiping left on the screen.
* @default 3
*
* @param swipeRightEventId
* @text Swipe Right Event ID
* @type number
* @min 1
* @desc Common event ID to run when swiping right on the screen.
* @default 4
*
* @help
* This plugin allows running specified common events when swiping up, down, left,
* or right on the screen. Set the common event ID for each swipe direction in the
* plugin parameters.
*/

(function() {
    var parameters = PluginManager.parameters('SwipeToCommonEvent');
    var swipeUpEventId = parseInt(parameters['swipeUpEventId']);
    var swipeDownEventId = parseInt(parameters['swipeDownEventId']);
    var swipeLeftEventId = parseInt(parameters['swipeLeftEventId']);
    var swipeRightEventId = parseInt(parameters['swipeRightEventId']);

    var swipeThreshold = 50; // Minimum distance (in pixels) for a swipe to be registered.

    var swipeStart = new PIXI.Point();

    var _SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        _SceneManager_initNwjs.call(this);
        Graphics._canvas.addEventListener('mousedown', onSwipeStart);
        Graphics._canvas.addEventListener('touchstart', onSwipeStart);
        Graphics._canvas.addEventListener('mouseup', onSwipeEnd);
        Graphics._canvas.addEventListener('touchend', onSwipeEnd);
    };

    function onSwipeStart(event) {
        if (event.touches && event.touches[0]) {
            event = event.touches[0];
        }
        swipeStart.set(event.clientX, event.clientY);
    }

    function onSwipeEnd(event) {
        if (event.changedTouches && event.changedTouches[0]) {
            event = event.changedTouches[0];
        }
        var deltaX = event.clientX - swipeStart.x;
        var deltaY = event.clientY - swipeStart.y;
        var absDeltaX = Math.abs(deltaX);
        var absDeltaY = Math.abs(deltaY);

        if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
            if (absDeltaX > absDeltaY) {
                if (deltaX > 0) {
                    $gameTemp.reserveCommonEvent(swipeRightEventId);
                } else {
                    $gameTemp.reserveCommonEvent(swipeLeftEventId);
                }
            } else {
                if (deltaY > 0) {
                    $gameTemp.reserveCommonEvent(swipeDownEventId);
                } else {
                    $gameTemp.reserveCommonEvent(swipeUpEventId);
                }
            }
        }
    }
})();