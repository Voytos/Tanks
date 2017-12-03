window.onload = function () {

    var game = new Phaser.Game(1000, 700, Phaser.AUTO, '');

    game.state.add('Boot', GameStates.Boot);
    game.state.add('Preloader', GameStates.Preloader);
    game.state.add('MainMenu', GameStates.MainMenu);
    game.state.add('Game', GameStates.Game);
    game.state.add('GameOver', GameStates.GameOver);

    game.state.start('Boot');

};