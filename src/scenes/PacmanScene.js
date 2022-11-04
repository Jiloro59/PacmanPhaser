import Phaser from 'phaser';
import WebFontFile from '../../public/WebFontFile'

export default class PacmanScene extends Phaser.Scene {

  constructor() {
    super("PacmanScene");
}

  layer = null;
  player = null;
  map = null;
  lifes = 3;
  currentDirection = null;
  previousDirection = null;
  pileCount =0;
  pilesNumber = 0;
  score = 0;
  scoreDisplay= null;
  lifeDisplay= null;
  levelDisplay= null;
  level = 1;
  speed= 250;
  tab=[];
  eatFantom=0;
  gameOver= false;
  newGame = true;
  
  preload() {
    this.load.image('tiles', 'assets/images/drawtiles-spaced.png');
    this.load.image('pacman', 'assets/images/Pacman.png');
    for(var i = 1; i<9;i++){
      this.load.tilemapCSV('level'+i, 'assets/grid'+i+'.csv');
    }
    this.load.image('ghost1', 'assets/images/Ghost1.png');
    this.load.image('ghost2', 'assets/images/Ghost2.png');
    this.load.image('ghost3', 'assets/images/Ghost3.png');
    this.load.image('ghost4', 'assets/images/Ghost4.png');
    this.load.image('blueGhost', 'assets/images/BlueGhost.png');
    const fonts = new WebFontFile(this.load, 'Pacifico')
		this.load.addFile(fonts)
  }

  create() {
    this.map = this.make.tilemap({
      key:'level'+ this.level,
      tileWidth: 32,
      tileHeight: 32,
    });

    const tileset = this.map.addTilesetImage('tiles', null, 32, 32, 1, 2);
    this.layer = this.map.createLayer(0, tileset, 0, 0);
    this.player = this.physics.add.image(32*9 + 16, 32*12 + 16, 'pacman');
    this.ghost1 = this.physics.add.image(256 + 16, 320 + 16, 'ghost1');
    this.ghost2 = this.physics.add.image(288 + 16, 320 + 16, 'ghost2');
    this.ghost3 = this.physics.add.image(320 + 16, 320 + 16, 'ghost3');
    this.ghost4 = this.physics.add.image(288 + 16, 288 + 16, 'ghost4');

    this.enemyGroup = this.add.group();
    this.enemyGroup.add(this.ghost1, true);
    this.enemyGroup.add(this.ghost2, true);
    this.enemyGroup.add(this.ghost3, true);
    this.enemyGroup.add(this.ghost4, true);


    //mise en tableau du CSV
    var count = 0;
    for(var y = 0; y < this.map.height; y++) {
      for(var x = 0; x < this.map.width; x++) {
        var tile =this.map.getTileAt(x, y);
        if (tile.index === 3)
          count  = count + 1;
          if(!this.tab[y])this.tab[y] = [];
        this.tab[y].push(tile.index);
      }
    }
    console.log(this.tab);
    this.pilesNumber = count;
    this.pileCount = 0;

     //Game Over message

     this.gameOverText = this.add.text(300, 335, 'GAME OVER', {
      fontSize: '50px',
      color: '#0f0',
      fontStyle: 'bold'
    })

    this.gameOverText.setOrigin(0.5);
    this.gameOverText.visible = false

    //New game message

    var textY = 335;
    this.newGameText =this.add.text(300, textY, 'Start new game', { fontFamily: 'pacifico',color: '#0f0',fontSize: '30px', });
    this.newGameText.setInteractive();
    this.newGameText.on('pointerdown',  () => this.newGamelaunch(this.newGame));

    this.newGameText.setOrigin(0.5);
    this.newGameText.visible = false
   
    //ecran de démarrage
if (this.newGame == true){
        this.newGameText.visible =true;

        this.layer.setAlpha(0.1);
        this.enemyGroup.setAlpha(0.1);
        this.player.setAlpha(0.1);

}
// this.gameOver= false;
  

    //rencontre entre Pacman et fantome

    this.physics.add.overlap(this.player, this.enemyGroup, (player,ghost) => {
      if(this.eatFantom == 0){
        if(this.lifes >0){
          this.player.angle = 0;
          this.player.setVelocity(0, 0);
          this.player.setPosition(32*9 + 16, 32*12 + 16);
          this.ghost1.setPosition(256 + 16, 320 + 16);
          this.ghost2.setPosition(288 + 16, 320 + 16);
          this.ghost3.setPosition(320 + 16, 320 + 16);
          this.ghost4.setPosition(288 + 16, 288 + 16);
          this.previousDirection = null;
          this.currentDirection = null;
          if(this.block)this.block.destroy();
          this.lifes -= 1;
          this.lifeDisplay.setText('Lifes : ' + this.lifes+ ' ' )
        }else{

          // redirection écran Game Over
          this.newGame = false;
          this.gameOver = true;
          this.player.setVelocity(0, 0);
          this.gameOverText.visible=true;
          this.newGameText.visible =true;
          this.newGameText.setPosition(300, 400);
          this.layer.setAlpha(0.1);
          this.enemyGroup.setAlpha(0.1);
          this.player.setAlpha(0.1);

            // this.scene.start("Game Over",{score: this.score})
        }
      }else if (this.eatFantom ==1){
        if(ghost== this.ghost1 ){
                this.ghost1.setPosition(288 + 16, 320 + 16);
              }
        if(ghost== this.ghost2 ){
                this.ghost2.setPosition(288 + 16, 320 + 16);
              }
        if(ghost== this.ghost3 ){
                this.ghost3.setPosition(288 + 16, 320 + 16);
              }
        if(ghost== this.ghost4 ){
                this.ghost4.setPosition(288 + 16, 320 + 16);
              }

        this.score +=300;
      }
    });

    this.input.keyboard.on('keydown', (e) => this.pressKeyHandler(e));
    setInterval(() => {
      this.moveDirection();
    }, 100);

    //affichage score et vies restantes
    
    this.scoreDisplay = this.add.text(450,-1, 'score: ' + this.score +' ', {
          fontFamily: 'pacifico',
          fontSize: '25px',
          color: '#0f0',
          fontStyle: 'italic'
        })

    this.lifeDisplay =this.add.text(160, -1,'lifes : ' + this.lifes + ' ' , {
      fontFamily: 'pacifico',
      fontSize: '25px',
      color: '#0f0',
      fontStyle: 'italic'
    });

    this.levelDisplay =this.add.text(32, -1,'level : ' + this.level +' ' , { 
      fontFamily: 'pacifico',
      fontSize: '25px',
      color: '#0f0',
      fontStyle: 'italic'
    });
  }
  update() {

    var x = (Math.ceil(this.player.x/32)-1);
    var y = (Math.ceil(this.player.y/32)-1);
    if (x > 18) x = 18;
    if (x < 0) x = 0;

     // si toutes les piles ont étés mangé, quand pacman quitte la map => next level

    if (x > 17 || x < 1){
      this.block.destroy
      // if (this.pileCount >30*this.level){
      if (this.pileCount === this.pilesNumber){

        this.level +=1
        this.scene.restart()
      }
    }


    //suppression des piles 'mangés' par le Pacman 

    var playerPosition = this.map.getTileAt(x, y);

    if(playerPosition.index === 3) { 
      playerPosition.index = 0;
        this.pileCount++;
        this.score += 100;
        // console.log(this.pileCount + '/' +this.pilesNumber)

    }
    if(playerPosition.index === 4) { 
      playerPosition.index = 0;
      this.Ghost(0);

      setTimeout(() => {this.Ghost(1)}, 4000);
      setTimeout(() => {this.Ghost(0)}, 4100);
      setTimeout(() => {this.Ghost(1)}, 4200);
      setTimeout(() => {this.Ghost(0)}, 4300);
      setTimeout(() => {this.Ghost(1)}, 4400);
      setTimeout(() => {this.Ghost(0)}, 4500);
      setTimeout(() => {this.Ghost(1)}, 4600);
      setTimeout(() => {this.Ghost(0)}, 4700);
      setTimeout(() => {this.Ghost(1)}, 4800);
      setTimeout(() => {this.Ghost(0)}, 4900);
      setTimeout(() => {this.Ghost(1)}, 5000);
  
    }  

    //mise à jour du score

    this.scoreDisplay.setText('Score : ' + this.score+' ')
  }

  Center(player) {
    if (this.previousDirection)this.block.destroy();
    if (this.previousDirection === 'up') {
      if (this.currentDirection !== 'down' && this.currentDirection !== 'up') {
        if ((player.y - 16) % 32 < 16) {
          player.y -= (player.y - 16) % 32;
        } else player.y += 32 - ((player.y - 16) % 32);
      }
    }

    if (this.previousDirection === 'down') {
      if (this.currentDirection !== 'up' && this.currentDirection !== 'down') {
        if ((player.y - 16) % 32 > 16) {
          player.y += 32 - ((player.y - 16) % 32);
        } else player.y -= (player.y - 16) % 32;
      }
    }

    if (this.previousDirection === 'right') {
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
  Collider(player, block,destroy = 0){
      var collider = this.physics.add.overlap(player, block, function (playerOnBlock){

      if (player.x < 32){
        player.x=19*32-16
        var tile = this.layer.getTileAtWorldXY(17*32 , player.y, true);

        while(tile.index !== 2){
         tile = this.layer.getTileAtWorldXY(tile.pixelX -32 , tile.pixelY, true);
        }
        block = this.physics.add.image(tile.pixelX +16,tile.pixelY +16 , 'tile');
        block.visible = false;

          
        this.Collider(player,block,1)

        }else if (player.x > 18*32){
           player.x=30
          tile = this.layer.getTileAtWorldXY(2*32 , player.y, true);
          
          while(tile.index !== 2){
            tile = this.layer.getTileAtWorldXY(tile.pixelX +32, tile.pixelY, true);
          }
          block = this.physics.add.image(tile.pixelX +16 ,tile.pixelY +16 , 'tile');
          block.visible = false;
          
          this.Collider(player,block,1)
      
        }else{
          playerOnBlock.body.stop();
          if (destroy ==1)block.destroy()
          this.physics.world.removeCollider(collider);
        }
      }, null, this);
  }

  // mouvement des fantomes

  moveDirection() {
    if (this.gameOver === false && this.newGame == false ){
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
  }
 
  pressKeyHandler(e) {
    if (this.gameOver === false && this.newGame == false ){
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
  }

  moveLeft() {
    let tile = null;
    this.currentDirection = 'left';
    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);
    var pixelY = tile.pixelY;


      while (tile.index !== 2) {
        if (tile !==null){
          tile = this.layer.getTileAtWorldXY(tile.pixelX - 32, tile.pixelY, true);
        if (tile ===null){
          tile = this.layer.getTileAtWorldXY(16, pixelY, true);
          tile.pixelX = -50;
          break;
        }
      }
     }

    if (this.player.x - tile.pixelX > 32 + 18) {
      this.Center(this.player);
      this.player.angle = 180;
      this.block = this.physics.add.image(
        tile.pixelX + 16 + 5,
        tile.pixelY + 16,
        'tile',
      );


      this.block.visible = false;
      this.previousDirection = 'left';
      // Move at 100 px/s:
      this.player.setVelocity(-this.speed + 0.05*this.level, 0);


      this.Collider(this.player, this.block);


    }
  }
  moveRight() {
    let tile = null;
    this.currentDirection = 'right';
    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);


    while (tile.index !== 2) {
      var pixelY = tile.pixelY;
      if (tile !==null){
        tile = this.layer.getTileAtWorldXY(tile.pixelX + 32, tile.pixelY, true);
      if (tile ===null){
        tile = this.layer.getTileAtWorldXY(18 * 32 + 16, pixelY, true);
        tile.pixelX = 19 * 32;
        break;
      }
    }
   }

    if (this.player.x - tile.pixelX < -18) {
      this.Center(this.player);
      this.player.angle = 0;
      this.block = this.physics.add.image(
        tile.pixelX + 16 - 5,
        tile.pixelY + 16,
        'tile',
      );
      this.block.visible = false;
      this.previousDirection = 'right';
      this.player.setVelocity(+this.speed + 0.05*this.level, 0);
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
      this.player.angle = 270;
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 + 5,
        'tile',
      );
      this.block.visible = false;
      this.previousDirection = 'up';

      // Move at 100 px/s:
      this.player.setVelocity(0, -this.speed + 0.05*this.level);

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
      this.player.angle = 90;
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 - 5,
        'tile',
      );
      this.block.visible = false;
      this.previousDirection = 'down';

      // Move at 100 px/s:
      this.player.setVelocity(0, +this.speed + 0.05*this.level);

      this.Collider(this.player, this.block);
    }
  }
  
  Ghost(number){
    if( number%2==0){
      this.eatFantom = 1;
      this.ghost1.setTexture('blueGhost');
      this.ghost2.setTexture('blueGhost');
      this.ghost3.setTexture('blueGhost');
      this.ghost4.setTexture('blueGhost');
    }
    else{
      setTimeout(() => {this.eatFantom = 0}, 1000);
      this.ghost1.setTexture('ghost2');
      this.ghost2.setTexture('ghost2');
      this.ghost3.setTexture('ghost3');
      this.ghost4.setTexture('ghost4');     
      }
  }

  newGamelaunch(newGame){
    if (newGame==true) {
      this.newGameText.visible =false;

      this.layer.setAlpha(1);
      this.enemyGroup.setAlpha(1);
      this.player.setAlpha(1);
      this.newGame =false;
// this.gameOver= true;


  }else{
this.gameOver= false;
this.newGame =false;

this.level=1
this.score=0;
this.lifes=3;


    this.scene.restart();
  }
  }
}
