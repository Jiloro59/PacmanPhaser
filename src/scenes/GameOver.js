import Phaser from 'phaser';

export default  class GameOver extends Phaser.Scene {
    constructor() {
        super( "Game Over");
    }


    create(score){

        this.add.text(240, 300, 'GAME OVER', { fill: '#0f0' });
        this.add.text(240, 350,'Score : ' + score.score , { fill: '#0f0' });


        // newGame.setInteractive();
        // newGame.on('pointerdown',  () => this.scene.start('PacmanScene'));
        

    }
}