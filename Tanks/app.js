window.onload = function () {

    var game = new Phaser.Game(1000, 700, Phaser.AUTO, '');

    //  Add the States your game has.
    game.state.add('Boot', GameStates.Boot);
    game.state.add('Preloader', GameStates.Preloader);
    game.state.add('MainMenu', GameStates.MainMenu);
    game.state.add('Game', GameStates.Game);

    //  Now start the Boot state.
    game.state.start('Boot');

};