//=============================================================================
// DiceRoller.js
//=============================================================================

/*:
 * @plugindesc A plugin that rolls a dice and puts the result in a variable.
 * 
 * @help
 * This plugin rolls a dice and stores the result in a variable.
 *
 * Plugin Command:
 *   rollDice VARIABLE_ID DICE_SIDES - Rolls the dice and stores the result in the specified variable.
 *   Example: rollDice 1 6
 */

(function() {

    var parameters = PluginManager.parameters('DiceRoller');
    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
  
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
      pluginCommand.call(this, command, args);
  
      if (command.toLowerCase() === 'rolldice') {
        rollDice(args);
      }
    };
  
    function rollDice(args) {
      var variableId = Number(args[0]) || 1;
      var diceSides = Number(args[1]) || 6;
      console.log("Variable ID:", variableId); // Logs the variable ID
      console.log("Dice Sides:", diceSides); // Logs the number of dice sides
  
      var result = Math.floor(Math.random() * diceSides) + 1;
      console.log("Result:", result); // Logs the result of the dice roll
  
      $gameVariables.setValue(variableId, result);
    }
  
  })();  
  