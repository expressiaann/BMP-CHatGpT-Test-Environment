/*:
 * @plugindesc BMP Message Switches
 * Turns ON switches before a message is opened and after it's closed.
 *
 * @author BMPgames, CHatGPT
 *
 * @param Before Message Switch ID
 * @desc The ID of the switch to turn ON before the message is opened.
 * @default 1
 *
 * @param After Message Switch ID
 * @desc The ID of the switch to turn ON after the message is closed.
 * @default 2
 *
 * @help
 * This plugin allows you to turn ON specified switches before a message is opened
 * and after the message is closed.
 * Just set the switch IDs in the plugin parameters.
 */

(function() {
    var parameters = PluginManager.parameters('BMP_Message_Switches');
    var beforeMessageSwitchId = parseInt(parameters['Before Message Switch ID'] || 1);
    var afterMessageSwitchId = parseInt(parameters['After Message Switch ID'] || 2);

    var _Window_Message_isOpen = Window_Message.prototype.isOpen;
    Window_Message.prototype.isOpen = function() {
        if (_Window_Message_isOpen.call(this) && !$gameSwitches.value(beforeMessageSwitchId)) {
            $gameSwitches.setValue(beforeMessageSwitchId, true);
            $gameMap.requestRefresh();
        } else if (!_Window_Message_isOpen.call(this) && $gameSwitches.value(beforeMessageSwitchId)) {
            $gameSwitches.setValue(beforeMessageSwitchId, false);
            $gameSwitches.setValue(afterMessageSwitchId, true);
            $gameMap.requestRefresh();
        }
        return _Window_Message_isOpen.call(this);
    };
})();

