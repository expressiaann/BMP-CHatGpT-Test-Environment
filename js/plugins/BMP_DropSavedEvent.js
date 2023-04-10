//=============================================================================
// Drop Saved Event Plugin
// by [your name here]
// Last Updated: [date here]
//=============================================================================

/*:
 * @plugindesc Drops a saved event on any map where there is an open passable space.
 *
 * @help This plugin drops a saved event on any map where there is an open passable space.
 *
 * @param Picked Up Events Variable
 * @desc The ID of the game variable that stores the picked up events data.
 * @default 1
 */

(function() {

    var pluginName = "DropSavedEvent";
    var parameters = PluginManager.parameters(pluginName);
    var pickedUpEventsVarId = Number(parameters["Picked Up Events Variable"] || 1);

    // Drop a saved event on any map where there is an open passable space
    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "DropSavedEvent") {
            var pickedUpEvents = $gameVariables.value(pickedUpEventsVarId) || [];
            if (pickedUpEvents.length > 0) {
                var eventToDrop = pickedUpEvents.shift();
                var x = eventToDrop.x;
                var y = eventToDrop.y;
                var mapId = $gameMap.mapId();
                var mapWidth = $dataMap.width;
                var mapHeight = $dataMap.height;
                var passable = $gameMap.isPassable(x, y, 0);
                while (!passable) {
                    x++;
                    if (x >= mapWidth) {
                        x = 0;
                        y++;
                        if (y >= mapHeight) {
                            y = 0;
                        }
                    }
                    passable = $gameMap.isPassable(x, y, 0);
                }
                $gameMap.addEvent(eventToDrop.id, x, y, eventToDrop.page);
            }
        }
    };

})();
