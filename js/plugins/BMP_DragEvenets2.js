/*:
 * @plugindesc Drag and Drop Specified Events with Selection Indicator for Mouse and Mobile Devices.
 * @author BMPgames, CHatGPT
 *
 * @help This plugin allows you to drag and drop specified events by adding a comment with the text <draggable> in the event's first page.
 * When an event is selected, the mouse cursor will change to a pointer, and on mobile devices, an image pointing to the object will appear.
 */

(function() {
    'use strict';

    var eventPositions = {};

    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.call(this, mapId, eventId);
        this._draggable = false;
        this._selected = false;

        var positionKey = mapId + '-' + eventId;
        if (eventPositions[positionKey]) {
            var position = eventPositions[positionKey];
            this.locate(position.x, position.y);
        }
    };


    Game_Event.prototype.isDraggable = function() {
        var eventPages = this.event().pages;
        var firstPage = eventPages[0];
        if (!firstPage) return false;

        for (var i = 0; i < firstPage.list.length; i++) {
            var command = firstPage.list[i];
            if (command && command.code === 108 && command.parameters[0].includes('<draggable>')) {
                return true;
            }
        }
        return false;
    };

    var _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        _Game_Event_update.call(this);
        if (this._draggable) {
            this.updateDrag();
        }

        if (this._selected) {
            this.updateSelectionIndicator();
        }
    };

    Game_Event.prototype.updateDrag = function() {
        var touchX = TouchInput.x;
        var touchY = TouchInput.y;
        var eventX = this.screenX();
        var eventY = this.screenY();
        var eventSprite = this.sprite();
        var deltaX = Math.abs(touchX - eventX);
        var deltaY = Math.abs(touchY - eventY);

        if (TouchInput.isPressed()) {
            if (!this._isDragging && eventSprite && deltaX <= eventSprite.width / 2 && deltaY <= eventSprite.height / 2) {
                this._isDragging = true;
                this.applySelectedTint(eventSprite, true);
                if (TouchInput.isMobileDevice()) {
                    this.showMobileSelectionImage(true);
                }
            }

            if (this._isDragging) {
                var targetX = $gameMap.canvasToMapX(touchX);
                var targetY = $gameMap.canvasToMapY(touchY);

                // Check if the target location is passable and within map boundaries
                if ($gameMap.isValid(targetX, targetY) && $gameMap.isPassable(targetX, targetY, 2)) {
                    this.locate(targetX, targetY);

                    var positionKey = this._mapId + '-' + this._eventId;
                    eventPositions[positionKey] = { x: targetX, y: targetY };
                }
            }
        } else if (this._isDragging) {
            this._isDragging = false;
            this.applySelectedTint(eventSprite, false);
            if (TouchInput.isMobileDevice()) {
                this.showMobileSelectionImage(false);
            }
        }
    };

    Game_Event.prototype.updateSelectionIndicator = function() {
        var eventSprite = this.sprite();
        if (eventSprite) {
            if (TouchInput.isMobileDevice()) {
                this.showMobileSelectionImage(true);
            } else {
                eventSprite.setCursor('pointer');
            }
        }
    };
    
    Game_Event.prototype.applySelectedTint = function(sprite, isSelected) {
        if (sprite) {
            sprite.setBlendColor(isSelected ? [128, 128, 255, 192] : [0, 0, 0, 0]);
        }
    };
    
    Game_Event.prototype.showMobileSelectionImage = function(isVisible) {
        var scene = SceneManager._scene;
        if (!(scene instanceof Scene_Map)) return;
    
        if (!this._mobileSelectionImage) {
            this._mobileSelectionImage = new Sprite();
            this._mobileSelectionImage.bitmap = ImageManager.loadSystem('MobileSelection');
            this._mobileSelectionImage.anchor.x = 0.5;
            this._mobileSelectionImage.anchor.y = 1;
            scene.addChild(this._mobileSelectionImage);
        }
    
        if (isVisible) {
            var eventSprite = this.sprite();
            if (eventSprite) {
                var x = eventSprite.x;
                var y = eventSprite.y - eventSprite.height / 2;
                this._mobileSelectionImage.x = x;
                this._mobileSelectionImage.y = y;
                this._mobileSelectionImage.visible = true;
            }
        } else {
            this._mobileSelectionImage.visible = false;
        }
    };
    
    Game_Event.prototype.sprite = function() {
        var scene = SceneManager._scene;
        if (!(scene instanceof Scene_Map)) return null;
    
        var spriteset = scene._spriteset;
        if (!spriteset) return null;
    
        var characterSprites = spriteset._characterSprites;
        for (var i = 0; i < characterSprites.length; i++) {
            var sprite = characterSprites[i];
            if (sprite._character === this) {
                return sprite;
            }
        }
        return null;
    };
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
    
        if (command === 'EnableDragEvent') {
            var eventId = Number(args[0]);
            var gameEvent = $gameMap.event(eventId);
            if (gameEvent) {
                gameEvent.enableDrag();
            }
        } else if (command === 'DisableDragEvent') {
            var eventId = Number(args[0]);
            var gameEvent = $gameMap.event(eventId);
            if (gameEvent) {
                gameEvent.disableDrag();
            }
        }
    };
    
    Game_Event.prototype.enableDrag = function() {
        this._draggable = true;
    };
    
    Game_Event.prototype.disableDrag = function() {
        this._draggable = false;
    };
    
    Game_Event.prototype.select = function() {
        this._selected = true;
        this.updateSelectionIndicator();
    };
    
    Game_Event.prototype.deselect = function() {
        this._selected = false;
        this.updateSelectionIndicator();
    };
    
    var _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        _Scene_Map_processMapTouch.call(this);
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        var events = $gameMap.eventsXy(x, y);
        if (events.length > 0) {
            var selectedEvent = events[0];
            if (selectedEvent.isDraggable()) {
                selectedEvent.select();
            }
        }
    };
    
    var _Scene_Map.prototype.onMapTouch = function() {
        _Scene_Map_onMapTouch.call(this);
        var selectedEvent = $gameMap._interpreter._eventId ? $gameMap.event($gameMap._interpreter._eventId) : null;
        if (selectedEvent && selectedEvent.isDraggable()) {
            selectedEvent.deselect();
        }
    };
    
    var _Scene_Map_onMapMouseDown = Scene_Map.prototype.onMapMouseDown;
    Scene_Map.prototype.onMapMouseDown = function() {
        _Scene_Map_onMapMouseDown.call(this);
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        var events = $gameMap.eventsXy(x, y);
        if (events.length > 0) {
            var selectedEvent = events[0];
            if (selectedEvent.isDraggable()) {
                selectedEvent.select();
            }
        }
    };
    
    var _Scene_Map_onMapMouseUp = Scene_Map.prototype.onMapMouseUp;
    Scene_Map.prototype.onMapMouseUp = function() {
        _Scene_Map_onMapMouseUp.call(this);
        var selectedEvent = $gameMap._interpreter._eventId ? $gameMap.event($gameMap._interpreter._eventId) : null;
        if (selectedEvent && selectedEvent.isDraggable()) {
            selectedEvent.deselect();
        }
    };
    
    var _Scene_Map_onMouseMove = Scene_Map.prototype.onMouseMove;
    Scene_Map.prototype.onMouseMove = function() {
        _Scene_Map_onMouseMove.call(this);
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        var events = $gameMap.eventsXy(x, y);
        if (events.length > 0) {
            var selectedEvent = events[0];
            if (selectedEvent.isDraggable()) {
                var eventSprite = selectedEvent.sprite();
                if (eventSprite) {
                    eventSprite.setCursor('pointer');
                }
            }
        } else {
            var selectedEvent = $gameMap._interpreter._eventId ? $gameMap.event($gameMap._interpreter._eventId) : null;
            if (selectedEvent && selectedEvent.isDraggable()) {
                var eventSprite = selectedEvent.sprite();
                if (eventSprite) {
                    eventSprite.setCursor('default');
                }
            }
        }
    };
})();