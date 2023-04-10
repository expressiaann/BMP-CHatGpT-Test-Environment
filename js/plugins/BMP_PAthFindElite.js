/*:
 * @plugindesc Pathfinding Plugin: 5 Shows path with a specified image and moves the player upon mouse release
 * @author BMPgames, CHatGPT
 *
 * @param Path Image
 * @desc The image to show the path.
 * @default PathImage
 * @require 1
 * @dir img/system/
 * @type file
 *
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('PathfindingPlugin');
    var pathImage = String(parameters['Path Image']);

    // Check if Astar.js library is loaded
    if (typeof Graph === 'undefined' || typeof astar === 'undefined') {
        console.error('Astar.js library not found. Please download it and add it as a plugin.');
        return;
    }

    // Check if the path image exists
    var pathImagePath = 'img/system/' + pathImage + '.png';
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', pathImagePath, false);
    xhr.send();

    if (xhr.status === 404) {
        console.error('Path image not found. Please add the image to the img/system/ folder.');
        return;
    }

    // Extend Game_Map to include pathfinding logic
    Game_Map.prototype.setupPathfindingGrid = function() {
        var grid = [];
        for (var y = 0; y < this.height(); y++) {
            grid[y] = [];
            for (var x = 0; x < this.width(); x++) {
                grid[y][x] = this.isPassable(x, y, 2) &&
                             this.isPassable(x, y, 4) &&
                             this.isPassable(x, y, 6) &&
                             this.isPassable(x, y, 8) ? 0 : 1;
            }
        }
        this._pathfindingGraph = new Graph(grid);
    };

    var originalGame_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        originalGame_Map_setup.call(this, mapId);
        this.setupPathfindingGrid();
    };

    Game_Player.prototype.findPath = function(x, y) {
        var startX = this.x;
        var startY = this.y;
        var endX = $gameMap.canvasToMapX(x);
        var endY = $gameMap.canvasToMapY(y);

        var startNode = $gameMap._pathfindingGraph.grid[startY][startX];
        var endNode = $gameMap._pathfindingGraph.grid[endY][endX];
        var path = astar.search($gameMap._pathfindingGraph, startNode, endNode);

        return path.map(function(node) {
            return { x: node.x, y: node.y };
        });
    };

    // Store original functions to be used later
    var originalGame_Player_initMembers = Game_Player.prototype.initMembers;
    var originalGame_Player_update = Game_Player.prototype.update;
    var originalScene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;

    // Override initMembers function
    Game_Player.prototype.initMembers = function() {
        originalGame_Player_initMembers.call(this);
        this._pathSprites = [];
    };

    // Override update function
    Game_Player.prototype.update = function(sceneActive) {
        originalGame_Player_update.call(this, sceneActive);
        this.updatePathSprites();
    };

    Game_Player.prototype.updatePathSprites = function() {
        if (TouchInput.isPressed()) {
            this.createPathSprites();
        } else {
            this.clearPathSprites();
        }
    };

    Game_Player.prototype.createPathSprites = function() {
        var path = this.findPath(TouchInput.x, TouchInput.y);
        if (path) {
            this._pathSprites.forEach(function(sprite) {
                sprite.visible = false;
            });

            for (var i = 0; i < path.length; i++) {
                if (i >= this._pathSprites.length) {
                    var sprite = new Sprite(ImageManager.loadSystem(pathImage));
                    this._pathSprites.push(sprite);
                    SceneManager._scene._spriteset._tilemap.addChild(sprite);
                }

                var sprite = this._pathSprites[i];
                sprite.visible = true;
                sprite.x = path[i].x * 48;
                sprite.y = path[i].y * 48;
            }
        }
    };

    Game_Player.prototype.clearPathSprites = function() {
        this._pathSprites.forEach(function(sprite) {
            sprite.visible = false;
        });
    };

    // Override createDisplayObjects function
    Scene_Map.prototype.createDisplayObjects = function() {
        originalScene_Map_createDisplayObjects.call(this);
        this._pathfindingSprite = new Sprite();
        this._spriteset.addChild(this._pathfindingSprite);
    };

    // Move player to the location on mouse release
    var originalGame_Player_processMapTouch = Game_Player.prototype.processMapTouch;
    Game_Player.prototype.processMapTouch = function() {
        if (TouchInput.isReleased()) {
            var x = $gameMap.canvasToMapX(TouchInput.x);
            var y = $gameMap.canvasToMapY(TouchInput.y);

            if (this.canPass(x, y, 2) || this.canPass(x, y, 4) || this.canPass(x, y, 6) || this.canPass(x, y, 8)) {
                var path = this.findPath(TouchInput.x, TouchInput.y);
                if (path) {
                    this.clearPathSprites();
                    this.executeMovePath(path);
                }
            }
        } else {
            originalGame_Player_processMapTouch.call(this);
        }
    };

    Game_Player.prototype.executeMovePath = function(path) {
        for (var i = 0; i < path.length - 1; i++) {
            var deltaX = path[i + 1].x - path[i].x;
            var deltaY = path[i + 1].y - path[i].y;

            var direction;
            if (deltaX > 0) {
                direction = 6;
            } else if (deltaX < 0) {
                direction = 4;
            } else if (deltaY > 0) {
                direction = 2;
            } else {
                direction = 8;
            }

            this.moveStraight(direction);
        }
    };
})();

