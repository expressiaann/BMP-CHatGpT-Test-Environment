/*:
 * @plugindesc Slippery Ice Plugin with Momentum for RPG Maker MV
 * @author BMPgames, CHatGPT
 *
 * @param Region ID
 * @desc The region ID for slippery ice tiles.
 * @type number
 * @default 1
 *
 * @help This plugin adds slippery ice behavior with momentum in RPG Maker MV.
 * To use it, paint the ice tiles with the specified region ID on your map
 * using the Region paint tool.
 */

(function() {
    var parameters = PluginManager.parameters('SlipperyIce');
    var slipperyRegionId = Number(parameters['Region ID'] || 1);
  
    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
      _Game_Player_initMembers.call(this);
      this._sliding = false;
    };
  
    var _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
      if (this.isOnSlipperyIce() && this.canPass(this._x, this._y, d)) {
        this._sliding = true;
        this.setDirection(d);
        this.slideOnIce(d);
      } else {
        this._sliding = false;
        _Game_Player_moveStraight.call(this, d);
      }
    };
  
    Game_Player.prototype.slideOnIce = function(d) {
      var x = this._x;
      var y = this._y;
      this._x = $gameMap.roundXWithDirection(x, d);
      this._y = $gameMap.roundYWithDirection(y, d);
      this._realX = $gameMap.xWithDirection(x, this.reverseDir(d));
      this._realY = $gameMap.yWithDirection(y, this.reverseDir(d));
      this.increaseSteps();
    };
  
    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
      _Game_Player_update.call(this, sceneActive);
      this.updateSliding();
    };
  
    Game_Player.prototype.updateSliding = function() {
      if (this._sliding && !this.isMoving()) {
        this.slideOnIce(this._direction);
      }
    };
  
    Game_Player.prototype.isOnSlipperyIce = function() {
      var regionId = $gameMap.regionId(this._x, this._y);
      return regionId === slipperyRegionId;
    };
  
  })();
  
  