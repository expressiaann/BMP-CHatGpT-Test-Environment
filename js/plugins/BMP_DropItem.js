//=============================================================================
// Item Drop Plugin
//=============================================================================

/*:
 * @plugindesc Allows you to drop items on the map at specified coordinates. Author: BMPgames, CHatGPT
 *
 * @help This plugin allows you to drop items on the map at specified coordinates.
 *
 * To use this plugin, create an event and set the trigger to "Action Button".
 * In the event commands, use the "Plugin Command" option and type:
 *
 *   DropItemAt [ITEM_ID] [X] [Y]
 *
 * Replace [ITEM_ID] with the ID of the item you want to drop, and [X] and [Y] with
 * the coordinates on the map where you want to drop the item.
 *
 * For example, to drop a Potion at (5, 10) on the map, you would use the following
 * Plugin Command:
 *
 *   DropItemAt 1 5 10
 *
 * This plugin does not have any plugin parameters.
 */

(function() {
    // Add a plugin command to drop an item on the map
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
      _Game_Interpreter_pluginCommand.call(this, command, args);
  
      if (command === 'DropItemAt') {
        // Get the arguments
        var itemId = Number(args[0]);
        var x = Number(args[1]);
        var y = Number(args[2]);
  
        // Create the event
        var mapId = $gameMap.mapId();
        var eventId = $gameMap._events.length > 0 ? $gameMap._events[$gameMap._events.length - 1].eventId() + 1 : 1;
        var event = new Game_Event(mapId, eventId);
        event.setPosition(x, y);
        event._trigger = 0;
        $gameMap._events.push(event);
  
        // Set the event's graphic and page settings
        event.setTileImage(params['Item Sheet'], itemId - 1);
        event.setTileId(0, 0);
        event.setTileId(0, 1);
        event.setTileId(0, 2);
        event.setTileId(0, 3);
        event.refreshBushDepth();
  
        console.log('Item event added to the map at (' + x + ', ' + y + ').');
      }
    };
  })();
  