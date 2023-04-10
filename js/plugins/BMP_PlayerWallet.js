/*:
 * @plugindesc v1.2 Wallet and item pickup/drop functionality for RPG Maker MV.
 *
 * @param walletXPosition
 * @text Wallet X Position
 * @type number
 * @min 0
 * @desc The X position of the wallet window on the map.
 * @default 0
 *
 * @param walletYPosition
 * @text Wallet Y Position
 * @type number
 * @min 0
 * @desc The Y position of the wallet window on the map.
 * @default 0
 *
 * @param iconSize
 * @text Icon Size
 * @type number
 * @min 1
 * @desc The size of the item icons displayed in the wallet window.
 * @default 32
 *
 * @help
 * This plugin provides a wallet system for your game. Players can pick up items from the map and store them in the wallet. They can also drop items back onto the map.
 */

var Imported = Imported || {};
Imported.WalletPlugin = true;

var WalletPlugin = WalletPlugin || {};
WalletPlugin.Parameters = PluginManager.parameters('WalletPlugin');
var walletXPosition = Number(WalletPlugin.Parameters['walletXPosition'] || 0);
var walletYPosition = Number(WalletPlugin.Parameters['walletYPosition'] || 0);
var iconSize = Number(WalletPlugin.Parameters['iconSize'] || 32);

//-----------------------------------------------------------------------------
// Game_Wallet
//
// The game object class for the wallet.
function Game_Wallet() {
    this.initialize.apply(this, arguments);
}

Game_Wallet.prototype.initialize = function() {
    this._items = [];
    this._eventData = {};
    this._maxItems = 6;
};

Game_Wallet.prototype.getItems = function() {
    return this._items;
};

Game_Wallet.prototype.add = function(item, event) {
    if (this._items.length >= this._maxItems) {
        return false;
    }
    this._items.push(item);
    this._eventData[item.id] = event;
    return true;
};

Game_Wallet.prototype.remove = function(item) {
    var index = this._items.indexOf(item);
    if (index >= 0) {
        var eventData = this._eventData[item.id];
        this._items.splice(index, 1);
        delete this._eventData[item.id];
        return eventData;
    }
    return null;
};

Game_Wallet.prototype.move = function(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this._items.length &&
        toIndex >= 0 && toIndex < this._items.length) {
        var temp = this._items[fromIndex];
        this._items[fromIndex] = this._items[toIndex];
        this._items[toIndex] = temp;
        return true;
    }
    return false;
};

Game_Wallet.prototype.getItems = function() {
    return this._items;
};

WalletPlugin.addEvent = function(eventData) {
    var eventId = $gameMap._events.length;
    $gameMap._events[eventId] = new Game_Event($gameMap._mapId, eventData);
};

//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

Game_Player.prototype.getWallet = function() {
    if (!this._wallet) {
        this._wallet = new Game_Wallet();
    }
    return this._wallet;
};

Game_Player.prototype.frontDirectionCoordinates = function() {
    var x = this.x;
    var y = this.y;
    switch (this.direction()) {
        case 2:
            y++;
            break;
        case 4:
            x--;
            break;
        case 6:
            x++;
            break;
        case 8:
            y--;
            break;
    }
    return { x: x, y: y };
};

//-----------------------------------------------------------------------------
// Window_Wallet
//
// The window for displaying the wallet on the map screen.
function Window_Wallet() {
    this.initialize.apply(this, arguments);
}

Window_Wallet.prototype = Object.create(Window_Base.prototype);
Window_Wallet.prototype.constructor = Window_Wallet;

Window_Wallet.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

Window_Wallet.prototype.windowWidth = function() {
    return 160;
};

Window_Wallet.prototype.windowHeight = function() {
    return 160;
};

Window_Wallet.prototype.refresh = function() {
    this.contents.clear();
    var items = $gamePlayer.getWallet().getItems();
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iconIndex = item.iconIndex;
        var x = (i % 3) * (iconSize + 4) + 8;
        var y = Math.floor(i / 3) * (iconSize + 4) + 8;
        this.drawIcon(iconIndex, x, y);
    }
};

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

Scene_Map.prototype.createWalletWindow = function() {
    this._walletWindow = new Window_Wallet(walletXPosition, walletYPosition);
    this.addWindow(this._walletWindow);
};

Scene_Map.prototype.refreshWalletWindow = function() {
    this._walletWindow.refresh();
};

var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this.createWalletWindow();
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'PickUpItem') {
        var itemId = parseInt(args[0]);
        var item = $dataItems[itemId];
        if (item) {
            var event = this.character(0);
            if ($gamePlayer.getWallet().add(item, event)) {
                event.erase();
                SceneManager._scene.refreshWalletWindow();
            }
        }
    } else if (command === 'DropItem') {
        var itemId = parseInt(args[0]);
        var item = $dataItems[itemId];
        if (item) {
            var event = $gamePlayer.getWallet().remove(item);
            if (event !== null) {
                var coordinates = $gamePlayer.frontDirectionCoordinates();
                var newEvent = JsonEx.makeDeepCopy(event.event());
                newEvent.x = coordinates.x;
                newEvent.y = coordinates.y;
                WalletPlugin.addEvent(newEvent);
                SceneManager._scene.refreshWalletWindow();
            }
        }
    } else if (command === 'MoveItem') {
        var fromIndex = parseInt(args[0]);
        var toIndex = parseInt(args[1]);
        if ($gamePlayer.getWallet().move(fromIndex, toIndex)) {
            SceneManager._scene.refreshWalletWindow();
        }
    }
};

//-----------------------------------------------------------------------------
// WalletPlugin
//
// The namespace for the wallet plugin.

WalletPlugin.cloneEventData = function(eventData) {
    return JSON.parse(JSON.stringify(eventData));
};

WalletPlugin.addEvent = function(eventData, x, y) {
    eventData.x = x;
    eventData.y = y;
    var newEventId = $gameMap._events.length;
    $gameMap._events[newEventId] = new Game_Event($gameMap._mapId, eventData);
    $gameMap._data[x][y] = newEventId;
    $gameMap._needsRefresh = true;
};

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
Game_Map.prototype.setupEvents = function() {
    _Game_Map_setupEvents.call(this);
    this._needsRefresh = false;
};

var _Game_Map_updateEvents = Game_Map.prototype.updateEvents;
Game_Map.prototype.updateEvents = function() {
    _Game_Map_updateEvents.call(this);
    if (this._needsRefresh) {
        this.refresh();
        this._needsRefresh = false;
    }
};
