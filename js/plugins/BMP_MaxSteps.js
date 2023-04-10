//=============================================================================
// BMP_MaxSteps.js
//=============================================================================

/*:
 * @plugindesc Allows the player to move a number of steps equal to a specified variable, up to a maximum number of steps equal to the value of variable 1. Also provides a plugin command to enable/disable player movement.
 * @version 1.4.0
 * @author BMPgames, CHatGPT
 *
 * @help
 * 
 * Plugin Commands:
 *   BMP_MaxSteps variableId: n
 *   - Moves the player a number of steps equal to the value of variable n, up to a maximum number of steps equal to the value of variable 1.
 *   - Example: BMP_MaxSteps variableId: 1
 * 
 *   BMP_EnableMovement enabled: true/false
 *   - Enables or disables player movement.
 *   - Example: BMP_EnableMovement enabled: false
 */

(function() {

    // Define the plugin command.
    var pluginCommand = function(command, args) {
      // Parse the arguments.
      switch (command) {
        case 'BMP_MaxSteps':
          var variableId = parseInt(args.variableId);
          var maxSteps = $gameVariables.value(1);
          var originalProcessMove = Game_Player.prototype.processMove;
          Game_Player.prototype.processMove = function() {};
          var steps = $gameVariables.value(variableId);
          steps = Math.min(steps, maxSteps);
          while (steps > 0) {
            var direction = $gamePlayer.getInputDirection();
            if (direction > 0) {
              $gamePlayer.moveStraight(direction);
              steps--;
            } else {
              break;
            }
          }
          Game_Player.prototype.processMove = originalProcessMove;
          break;
        case 'BMP_EnableMovement':
          var enabled = (args.enabled === 'true');
          $gamePlayer._bmp_movementEnabled = enabled;
          if (enabled) {
            $gamePlayer.setMoveSpeed(4);
            $gamePlayer.setMoveFrequency(6);
            $gamePlayer.setThrough(false);
          } else {
            $gamePlayer.setMoveSpeed(0);
            $gamePlayer.setMoveFrequency(0);
            $gamePlayer.setThrough(true);
          }
          break;
      }
    };
    
    // Override the Game_Player.prototype.moveByInput function to enable/disable movement.
    var oldGame_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
      if (this._bmp_movementEnabled || !$gameSwitches.value(1)) {
        oldGame_Player_moveByInput.call(this);
      } else {
        if (this.canMove()) {
          this.checkEventTriggerHere([0,1,2]);
          if ($gameMap.isAnyEventStarting()) {
            return;
          }
          this.checkEventTriggerThere([0,1,2]);
          if ($gameMap.isAnyEventStarting()) {
            return;
          }
          this.updateNonmoving();
          if (this.triggerAction()) {
            return;
          }
        }
      }
    };
    
    // Override the Game_Player.prototype.triggerAction function to allow the player to turn and interact with events even when movement is disabled.
  var oldGame_Player_triggerAction = Game_Player.prototype.triggerAction;
  Game_Player.prototype.triggerAction = function() {
    if ((this._bmp_movementEnabled && !$gameSwitches.value(1)) || $gameSwitches.value(1)) {
      return oldGame_Player_triggerAction.call(this);
    } else {
      if (this.canMove()) {
        if (this.triggerButtonAction()) {
          return true;
        }
        if (this.checkEventTriggerHere([0])) {
          return true;
        }
        if (this.checkEventTriggerThere([0, 1, 2])) {
          return true;
        }
      }
      return false;
    }
  };
  
  // Register the plugin command.
  var oldGame_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    oldGame_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'BMP_MaxSteps' || command === 'BMP_EnableMovement') {
      pluginCommand(command, args);
    }
  };
  
})();