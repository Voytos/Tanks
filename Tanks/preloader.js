// Preloader will load all of the assets like graphics and audio
GameStates.Preloader = function (game) {
    this.preloadBar = null;
}

GameStates.Preloader.prototype = {
    preload: function () {
        // common to add a loading bar sprite here...
        this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);
        // load all game assets
        // images, spritesheets, atlases, audio etc..

        //this.game.load.crossOrigin = 'anonymous';

        this.game.load.image('tank', 'assets/tank.png');
        this.game.load.image('turret', 'assets/turret.png');
        this.game.load.image('bullet', 'assets/bullet.png');
        this.game.load.image('earth', 'assets/floor.jpg');
        this.game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);

        //TODO
       // this.game.load.image('health_pack', '');
       // this.game.load.image('missile_pack', '');
       // this.game.load.image('missile', '');
       // this.game.load.image('wall', '');
       // this.game.load.image('tree', '');
       // this.game.load.image('water', '');
        
    },

    create: function () {
        //call next state
        this.state.start('MainMenu');
    }
};