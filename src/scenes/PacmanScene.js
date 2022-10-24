import Phaser from 'phaser';

export default class PacmanScene extends Phaser.Scene {
  layer = null;
  player = null;
  map = null;
  lifes = 3;
  currentDirection = null;
  previousDirection = null;
  // physics = this.physics;

  preload() {
    this.load.image('tiles', 'assets/images/drawtiles-spaced.png');
    this.load.image('pacman', 'assets/images/Pacman.png');
    this.load.tilemapCSV('map', 'assets/grid.csv');
    this.load.image('ghost1', 'assets/images/Ghost1.png');
    this.load.image('ghost2', 'assets/images/Ghost2.png');
    this.load.image('ghost3', 'assets/images/Ghost3.png');
    this.load.image('ghost4', 'assets/images/Ghost4.png');
  }

  create() {
    this.map = this.make.tilemap({
      key: 'map',
      tileWidth: 32,
      tileHeight: 32,
    });
    const tileset = this.map.addTilesetImage('tiles', null, 32, 32, 1, 2);
    this.layer = this.map.createLayer(0, tileset, 0, 0);
    this.player = this.physics.add.image(32 + 16, 32 + 16, 'pacman');
    this.ghost1 = this.physics.add.image(256 + 16, 320 + 16, 'ghost1');
    this.ghost2 = this.physics.add.image(288 + 16, 320 + 16, 'ghost2');
    this.ghost3 = this.physics.add.image(320 + 16, 320 + 16, 'ghost3');
    this.ghost4 = this.physics.add.image(288 + 16, 288 + 16, 'ghost4');

    this.enemyGroup = this.add.group();
    this.enemyGroup.add(this.ghost1, true);
    this.enemyGroup.add(this.ghost2, true);
    this.enemyGroup.add(this.ghost3, true);
    this.enemyGroup.add(this.ghost4, true);

    this.physics.add.overlap(this.player, this.enemyGroup, () => {
      console.log('OUCH');
      this.lifes -= 1;
    });

    this.input.keyboard.on('keydown', (e) => this.pressKeyHandler(e));
    setInterval(() => {
      this.moveDirection();
    }, 100);
  }
  Center(player) {
    if (this.previousDirection === 'up') {
      this.block.destroy();
      if (this.currentDirection !== 'down' && this.currentDirection !== 'up') {
        if ((player.y - 16) % 32 < 16) {
          player.y -= (player.y - 16) % 32;
        } else player.y += 32 - ((player.y - 16) % 32);
      }
    }

    if (this.previousDirection === 'down') {
      this.block.destroy();
      if (this.currentDirection !== 'up' && this.currentDirection !== 'down') {
        if ((player.y - 16) % 32 > 16) {
          player.y += 32 - ((player.y - 16) % 32);
        } else player.y -= (player.y - 16) % 32;
      }
    }

    if (this.previousDirection === 'right') {
      this.block.destroy();
      if (
        this.currentDirection !== 'right' &&
        this.currentDirection !== 'left'
      ) {
        if ((player.x - 16) % 32 > 16) {
          player.x += 32 - ((player.x - 16) % 32);
        } else player.x -= (player.x - 16) % 32;
      }
    }

    if (this.previousDirection === 'left') {
      this.block.destroy();
      if (
        this.currentDirection !== 'right' &&
        this.currentDirection !== 'left'
      ) {
        if ((player.x - 16) % 32 < 16) {
          player.x -= (player.x - 16) % 32;
        } else player.x += 32 - ((player.x - 16) % 32);
      }
    }
  }
  Collider(player, block) {
    let collider = this.physics.add.overlap(
      player,
      block,
      function (playerOnBlock) {
        playerOnBlock.body.stop();
        this.physics.world.removeCollider(collider);
      },
      null,
      this,
    );
  }

  moveDirection() {
    let moveDir = ['left', 'right', 'up', 'down'];
    let arrGhost = [this.ghost1, this.ghost2, this.ghost3, this.ghost4];
    let tile = null;
    for (let i = 0; i < arrGhost.length; i++) {
      this.ghost = arrGhost[i];

      let move = moveDir[Math.floor(Math.random() * 4)];
      switch (move) {
        // --------------------------------------------------------------
        case 'left':
          tile = this.layer.getTileAtWorldXY(
            this.ghost.x - 32,
            this.ghost.y,
            true,
          );
          if (tile.index !== 2) {
            this.ghost.x -= 32;
          }
          break;

        // ---------------------------------------------------

        case 'right':
          tile = this.layer.getTileAtWorldXY(
            this.ghost.x + 32,
            this.ghost.y,
            true,
          );

          if (tile.index !== 2) {
            this.ghost.x += 32;
          }
          break;

        // ---------------------------------------------------

        case 'up':
          tile = this.layer.getTileAtWorldXY(
            this.ghost.x,
            this.ghost.y - 32,
            true,
          );
          if (tile.index !== 2) {
            this.ghost.y -= 32;
          }
          break;

        // ---------------------------------------------------

        case 'down':
          tile = this.layer.getTileAtWorldXY(
            this.ghost.x,
            this.ghost.y + 32,
            true,
          );
          if (tile.index !== 2) {
            this.ghost.y += 32;
          }
          break;
      }
    }
  }

  pressKeyHandler(e) {
    switch (e.key) {
      //Left

      case 'q':
      case 'ArrowLeft':
        this.moveLeft();

        break;

      //Up
      case 'z':
      case 'ArrowUp':
        this.moveUp();
        break;

      //Right
      case 'd':
      case 'ArrowRight':
        this.moveRight();
        break;

      // Down
      case 's':
      case 'ArrowDown':
        this.moveDown();

        break;
      default:
        null;
    }
  }

  moveLeft() {
    let tile = null;
    this.currentDirection = 'left';
    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);
    if (tile.y === 10 && tile.x < 6) {
      tile = this.layer.getTileAtWorldXY(16, tile.pixelY, true);
      tile.pixelX = -32;
    } else {
      while (tile.index !== 2) {
        tile = this.layer.getTileAtWorldXY(tile.pixelX - 32, tile.pixelY, true);
      }
    }
    if (this.player.x - tile.pixelX > 32 + 18) {
      this.Center(this.player);
      this.block = this.physics.add.image(
        tile.pixelX + 16 + 5,
        tile.pixelY + 16,
        'tile',
      );
      this.block.visible = true;
      this.previousDirection = 'left';
      // Move at 100 px/s:
      this.player.setVelocity(-100, 0);
      this.Collider(this.player, this.block);
    }
  }
  moveRight() {
    let tile = null;
    this.currentDirection = 'right';

    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);
    if (tile.y === 10 && tile.x >= 12) {
      tile = this.layer.getTileAtWorldXY(18 * 32 + 16, tile.pixelY, true);
    } else {
      while (tile.index !== 2) {
        tile = this.layer.getTileAtWorldXY(tile.pixelX + 32, tile.pixelY, true);
      }
    }
    if (this.player.x - tile.pixelX < -18) {
      this.Center(this.player);
      this.block = this.physics.add.image(
        tile.pixelX + 16 - 5,
        tile.pixelY + 16,
        'tile',
      );
      this.block.visible = true;
      this.previousDirection = 'right';
      this.player.setVelocity(+100, 0);
      this.Collider(this.player, this.block);
    }
  }
  moveUp() {
    let tile = null;
    this.currentDirection = 'up';

    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y - 32, true);
    while (tile.index !== 2) {
      tile = this.layer?.getTileAtWorldXY(tile.pixelX, tile.pixelY - 32, true);
    }
    if (this.player.y - tile.pixelY > +32 + 18) {
      this.Center(this.player);
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 + 5,
        'tile',
      );
      this.block.visible = true;
      this.previousDirection = 'up';

      // Move at 100 px/s:
      this.player.setVelocity(0, -100);

      this.Collider(this.player, this.block);
    }
  }
  moveDown() {
    let tile = null;
    this.currentDirection = 'down';

    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y + 32, true);
    while (tile.index !== 2) {
      tile = this.layer.getTileAtWorldXY(tile.pixelX, tile.pixelY + 32, true);
    }
    if (this.player.y - tile.pixelY < -32 + 14) {
      this.Center(this.player);
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 - 5,
        'tile',
      );
      this.block.visible = true;
      this.previousDirection = 'down';

      // Move at 100 px/s:
      this.player.setVelocity(0, +100);

      this.Collider(this.player, this.block);
    }
  }
}
