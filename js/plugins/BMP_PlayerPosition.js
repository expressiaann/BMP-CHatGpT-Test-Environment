(function() {
    
    // Create a new plugin command that shows the player's X and Y position
    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommand.call(this, command, args);
        if (command === 'showPlayerPosition') {
            var x = $gamePlayer.x + 1; // Add 1 to adjust for the coordinate system
            var y = $gamePlayer.y + 1; // Add 1 to adjust for the coordinate system
            var message = 'Player Position: (' + x + ', ' + y + ')';
            $gameMessage.add(message);
        }
    };
    
    // Create a new key listener that triggers the plugin command when the P button is pressed
    document.addEventListener('keydown', function(event) {
        if (event.key === 'p' || event.key === 'P') {
            $gameTemp.reserveCommonEvent(1); // Replace 1 with the ID of the common event that triggers the plugin command
        }
    });
    
})();

