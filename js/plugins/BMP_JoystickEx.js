/*:
* @plugindesc Nipplejs Joystick Plugin for RPG Maker MV
* @author BMPgames, CHatGPT
*
* @help This plugin provides a virtual joystick using the nipplejs library.
*/

(function () {
    const nipplejsPath = 'js/libs/nipplejs.min.js';
  
    function loadScript(name) {
      const script = document.createElement('script');
      script.src = name;
      script.async = false;
      script._url = name;
      document.body.appendChild(script);
    }
  
    loadScript(nipplejsPath);
  
    const alias_Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  
    Scene_Map.prototype.createDisplayObjects = function () {
      alias_Scene_Map_createDisplayObjects.call(this);
      this.setupJoystick();
    };
  
    Scene_Map.prototype.setupJoystick = function () {
      if (Utils.isMobileDevice()) {
        const options = {
          zone: document.body,
          mode: 'static',
          position: { left: '50px', top: '50%' },
          size: 100,
          threshold: 0.1,
          color: 'transparent',
          fadeTime: 250,
          restJoystick: true
        };
  
        const manager = nipplejs.create(options);
  
        const container = new PIXI.Container();
        container.z = 9999;
        SceneManager._scene._spriteset._baseSprite.addChild(container);
  
        const base = new PIXI.Graphics();
        base.beginFill(0x000000, 0.5);
        base.drawCircle(0, 0, 50);
        base.position.set(50, Graphics.height - 100);
        container.addChild(base);
  
        const stick = new PIXI.Graphics();
        stick.beginFill(0xFFFFFF, 0.5);
        stick.drawCircle(0, 0, 25);
        stick.position.set(50, Graphics.height - 100);
        container.addChild(stick);
  
        manager.on('added', () => {
          container.visible = true;
        });
  
        manager.on('move', (event, data) => {
          const dir = getRpgDirectionFromAngle(data.angle.degree);
          $gamePlayer.setDirection(dir);
          $gamePlayer.moveByInput();
  
          stick.position.set(50 + data.position.x - data.instance.position.x, Graphics.height - 100 + data.position.y - data.instance.position.y);
        });
  
        manager.on('end', () => {
          container.visible = false;
          stick.position.set(50, Graphics.height - 100);
        });
  
        container.visible = false;
      }
    };
  
    function getRpgDirectionFromAngle(angle) {
      let octant = Math.round(angle / 45) % 8;
      return [0, 2, 4, 6, 8, 6, 4, 2, 8][octant];
    }
  })();  