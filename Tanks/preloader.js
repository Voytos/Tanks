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
        //this.load.image('logo', 'assets/phaser2.png');

        //allowDisplayingInsecureContent: true;
        this.game.load.crossOrigin = 'anonymous';
        this.game.load.image('tank', 'assets/tank.png');
        //this.game.load.image('tank', 'https://image.ibb.co/kngwCm/tank.png');
        //this.game.load.image('tank', 'https://u.cubeupload.com/voytos/turret.png');
        //this.game.load.image('tank', 'https://vignette.wikia.nocookie.net/gtawiki/images/1/18/Tank-GTA1.png/revision/latest?cb=20091013181630');
        // this.game.load.atlas('tank', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');
        this.game.load.image('turret', 'assets/turret.png');


        //TODO
       // this.game.load.image('health_pack', '');
       // this.game.load.image('missile_pack', '');
       // this.game.load.image('missile', '');
       // this.game.load.image('wall', '');
       // this.game.load.image('tree', '');
       // this.game.load.image('water', '');

        this.game.load.image('bullet', 'http://examples.phaser.io/assets/games/tanks/bullet.png');
        // this.game.load.image('bullet', 'http://vignette3.wikia.nocookie.net/commando2/images/8/84/Glenos-G_160_bullet.png/revision/latest?cb=20120731090012');
        ///this.game.load.image('earth', 'http://examples.phaser.io/assets/games/tanks/scorched_earth.png');
        this.game.load.image('earth', 'assets/floor.jpg');
        this.game.load.spritesheet('kaboom', 'http://examples.phaser.io/assets/games/tanks/explosion.png', 64, 64, 23);

    },

    create: function () {
        //call next state
        this.state.start('MainMenu');
    }
};