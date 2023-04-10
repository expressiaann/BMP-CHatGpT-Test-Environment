/*:
 * @plugindesc BMP Gauges Core v1.1
 * Creates customizable gauges that display on the map screen using images.
 *
 * @author BMPgames, CHatGPT
 *
 * @help
 * This plugin creates customizable gauges that display on the map screen using images.
 *
 * To create a gauge, use the following Plugin Command:
 *  CreateGauge variableId maxVariableId x y width height name xOffset yOffset gaugeImage backgroundImage
 *
 * Example:
 *  CreateGauge 1 2 100 100 200 20 "My Gauge" 0 0 "Gauge" "GaugeBackground"
 *
 * This will create a gauge using variable 1 as the current value, variable 2 as the maximum value,
 * positioned at (100, 100) with a size of 200x20, named "My Gauge", and the name displayed with no offset.
 * The gauge uses the images "Gauge.png" and "GaugeBackground.png" from the img/system folder.
 */

(function() {
    var parameters = PluginManager.parameters('BMPGaugesCore');
  
    function GaugeWindow() {
      this.initialize.apply(this, arguments);
    }
  
    GaugeWindow.prototype = Object.create(Window_Base.prototype);
    GaugeWindow.prototype.constructor = GaugeWindow;
  
    GaugeWindow.prototype.initialize = function(variableId, maxVariableId, x, y, width, height, name, xOffset, yOffset, gaugeImage, backgroundImage) {
      Window_Base.prototype.initialize.call(this, x, y, width, height);
      this._variableId = variableId;
      this._maxVariableId = maxVariableId;
      this._name = name;
      this._xOffset = xOffset;
      this._yOffset = yOffset;
      this._gaugeBitmap = ImageManager.loadSystem(gaugeImage);
      this._backgroundBitmap = ImageManager.loadSystem(backgroundImage);
      this.opacity = 0;
      this.refresh();
    };
  
    GaugeWindow.prototype.drawGauge = function(x, y, width, currentValue, maxValue) {
      var rate = currentValue / maxValue;
      var fillW = Math.floor(width * rate);
  
      this.contents.blt(this._backgroundBitmap, 0, 0, width, this._backgroundBitmap.height, x, y);
      this.contents.blt(this._gaugeBitmap, 0, 0, fillW, this._gaugeBitmap.height, x, y);
    };
  
    GaugeWindow.prototype.refresh = function() {
      this.contents.clear();
      this.drawGauge(0, 0, this.contents.width, $gameVariables.value(this._variableId), $gameVariables.value(this._maxVariableId));
      this.drawText(this._name, this.contents.width / 2 - this.textWidth(this._name) / 2 + this._xOffset, this._yOffset);
    };
  
    GaugeWindow.prototype.update = function() {
      Window_Base.prototype.update.call(this);
      if (this._currentValue !== $gameVariables.value(this._variableId) || this._maxValue !== $gameVariables.value(this._maxVariableId)) {
        this._currentValue = $gameVariables.value(this._variableId);
        this._maxValue = $gameVariables.value(this._maxVariableId);
        this.refresh();
      }
    };
  
    var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
      alias_Game_Interpreter_pluginCommand.call(this, command, args);
      if (command === 'CreateGauge') {
        var variableId = Number(args[0]);
        var maxVariableId = Number(args[1]);
        var x = Number(args[2]);
        var y = Number(args[3]);
        var width = Number(args[4]);
        var height = Number(args[5]);
        var name = args[6];
        var xOffset = Number(args[7]);
        var yOffset = Number(args[8]);
        var gaugeImage = args[9];
        var backgroundImage = args[10];
  
        var gaugeWindow = new GaugeWindow(variableId, maxVariableId, x, y, width, height, name, xOffset, yOffset, gaugeImage, backgroundImage);
  
        if (SceneManager._scene instanceof Scene_Map) {
          SceneManager._scene.addWindow(gaugeWindow);
        } else {
          SceneManager._nextGaugeWindow = gaugeWindow;
        }
      }
    };
  
    var alias_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
      alias_Scene_Map_start.call(this);
      if (SceneManager._nextGaugeWindow) {
        this.addWindow(SceneManager._nextGaugeWindow);
        SceneManager._nextGaugeWindow = null;
      }
    };
  
  })();