import Phaser from 'phaser';


export default class Start extends Phaser.Scene {
    constructor() {
        super( "Starting Game");
    }


    create(){
            
        const newGame = this.add.text(240, 320, 'Start new game', { fill: '#0f0' });
        newGame.setInteractive();
        newGame.on('pointerdown',  () => this.scene.start('PacmanScene'));
        

    }
}
