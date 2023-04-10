//=============================================================================
// PlayerMomentum.js
// Version: 1.0.0
// License: MIT
//=============================================================================

/*:
 * @plugindesc Makes the player move faster as they move, accounting for momentum, making movement feel more natural. 
 * @author 
 *
 * @param Default Speed
 * @desc The player's default movement speed.
 * @default 4
 *
 * @param Maximum Speed
 * @desc The maximum speed the player can move.
 * @default 8
 *
 * @param Friction
 * @desc The amount of friction to apply when the player stops moving.
 * @default 0.2
 *
 * @help
 *
 * This plugin makes the player move faster as they move around the game world,
 * accounting for momentum to make the player's movement feel more natural. 
 * The plugin works by gradually increasing the player's speed up to a maximum value 
 * as they move, and gradually decreasing it when they stop.
 *
 * Plugin Commands:
 *
 * None
 *
 * Compatibility:
 *
 * This plugin should be compatible with most plugins.
 */

(function() {

    var parameters = PluginManager.parameters('PlayerMomentum');
    var defaultSpeed = Number(parameters['Default Speed']);
    var maxSpeed = Number(parameters['Maximum Speed']);
    var friction = Number(parameters['Friction']);

    // Override the updateMove function for the Game_Player class
    var _Game_Player_updateMove = Game_Player.prototype.updateMove;
    Game_Player.prototype.updateMove = function() {
        // Check if the player is currently moving
        if (this.isMoving()) {
            // Increase the player's speed gradually up to the maximum value
            this._playerSpeed = Math.min(this._playerSpeed + 0.5, maxSpeed);
        } else {
            // Decrease the player's speed gradually when they stop moving
            this._playerSpeed = Math.max(this._playerSpeed - friction, defaultSpeed);
        }

        // Update the player's position based on their current speed and direction
        var lastRealX = this._realX;
        var lastRealY = this._realY;
        _Game_Player_updateMove.call(this);
        var distance = this.distancePerFrame() * this._playerSpeed;
        if (distance > 0) {
            this.moveStraight(this.direction());
            this._realX = lastRealX + this.distancePerFrame() * this._playerSpeed;
            this._realY = lastRealY + this.distancePerFrame() * this._playerSpeed;
            if (!this.isMovementSucceeded()) {
                this._realX = lastRealX;
                this._realY = lastRealY;
            }
        }

        // Update the player's animation and direction
        this.updateAnimation();
        this.setDirection(this.direction());

        // Check if the player has stopped moving
        if (!this.isMoving()) {
            // Snap the player to the nearest tile if they have stopped moving
            this.locate(Math.round(this._realX), Math.round(this._realY));
        }
    };

    // Override the initialize function for the Game_Player class
    var _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.call(this);
        this._playerSpeed = defaultSpeed;
    };

})();
