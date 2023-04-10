//=============================================================================
// BMP_Core.js
//=============================================================================

/*:
 * @plugindesc A core plugin for common functions and features used in BMP plugins.
 * @author BMPgame,Chatgpt
 *
 * @help This plugin provides a foundation for other BMP plugins.
 * It includes common functions and features used across multiple plugins.
 *
 * @param Debug Menu
 * @desc Adds a "Debug" option to the main menu.
 * @type boolean
 * @default false
 *
 * @param Font Name
 * @desc The name of the font to use in the game.
 * @type string
 * @default GameFont
 *
 * @param Font Size
 * @desc The size of the font to use in the game.
 * @type number
 * @default 28
 *
 * @param Font Color
 * @desc The color of the font to use in the game.
 * @type number
 * @default #ffffff
 */

(function() {
    // Add commonly used function here:
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
})();

// Add plugin code here