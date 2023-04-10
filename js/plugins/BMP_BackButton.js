//=============================================================================
// Red Back Button Plugin
// by BMPgames, CHatGPT
// Date: 2023-04-10
// Version: 1.3
//=============================================================================

/*:
 * @plugindesc Adds a red back button to every menu page in the game.
 * @author BMPgames, CHatGPT
 * @version 1.3
 *
 * @help RedBackButtonPlugin.js
 *
 * This plugin adds a red back button to every menu page in the game.
 * The button allows players to go back to the previous menu page.
 *
 * Terms of Use:
 * This plugin is free for non-commercial and commercial use.
 * Please credit "BMPgames, CHatGPT" in your game if you use this plugin.
 * Do not redistribute this plugin or claim it as your own.
 */

(function() {

    // Add red back button to every menu page
    Window_MenuCommand.prototype.makeCommandList = function() {
      this.addMainCommands();
      this.addRedBackButton();
      this.addFormationCommand();
      this.addOriginalCommands();
      this.addOptionsCommand();
      this.addSaveCommand();
      this.addGameEndCommand();
    };
  
    // Define the red back button command
    Window_MenuCommand.prototype.addRedBackButton = function() {
      this.addCommand("Back", "back", true);
    };
  
    // Handle the red back button command
    Scene_Menu.prototype.create = function() {
      Scene_MenuBase.prototype.create.call(this);
      this.createCommandWindow();
      this.createStatusWindow();
      this.createRedBackButton();
    };
  
    // Define the red back button parameters
    Scene_Menu.prototype.createRedBackButton = function() {
      var x = Graphics.boxWidth - 90;
      var y = Graphics.boxHeight - 70;
      this._redBackButton = new Window_MenuButton(x, y);
      this._redBackButton.setClickHandler(this.popScene.bind(this));
      this.addWindow(this._redBackButton);
    };
  
    // Define the red back button window
    function Window_MenuButton() {
      this.initialize.apply(this, arguments);
    }
  
    Window_MenuButton.prototype = Object.create(Window_Base.prototype);
    Window_MenuButton.prototype.constructor = Window_MenuButton;
  
    Window_MenuButton.prototype.initialize = function(x, y) {
      var width = this.windowWidth();
      var height = this.windowHeight();
      Window_Base.prototype.initialize.call(this, x, y, width, height);
      this.refresh();
    };
  
    Window_MenuButton.prototype.windowWidth = function() {
      return 80;
    };
  
    Window_MenuButton.prototype.windowHeight = function() {
      return this.fittingHeight(1);
    };
  
    Window_MenuButton.prototype.refresh = function() {
        var x = this.textPadding();
        var width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        this.changeTextColor(this.textColor(2)); // Change text color to red
        this.drawText("Back", x, 0, width, 'center');
        this.resetTextColor();
      };

      Scene_Menu.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        this._redBackButton.updateTouchInput();
      };

      // Example: Add the red back button to the Options menu
      var _Scene_Options_create = Scene_Options.prototype.create;
  // Override the update function for Scene_Options
  Scene_Options.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    if (this._redBackButton) {
      this._redBackButton.updateTouchInput();
    }
  };
     
       Scene_Options.prototype.createRedBackButton = Scene_Menu.prototype.createRedBackButton;
     
       // Add similar overrides for other menu pages (e.g., Scene_Item, Scene_Skill, etc.)
     
  
    // Add the missing 'setClickHandler' function
    Window_MenuButton.prototype.setClickHandler = function(method) {
      this._clickHandler = method;
      this.updateTouchInput();
    };
  
    // Add the 'updateTouchInput' function to handle touch input for the button
    Window_MenuButton.prototype.updateTouchInput = function() {
      if (this._clickHandler && TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
        this._clickHandler();
      }
    };
  
  // Add the 'isTouchedInsideFrame' function to check if the touch input is within the button's frame
  Window_MenuButton.prototype.isTouchedInsideFrame = function() {
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  };




})();