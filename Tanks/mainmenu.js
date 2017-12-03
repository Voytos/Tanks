GameStates.MainMenu = function (game) {

};

GameStates.MainMenu.prototype = {
    create: function () {

        this.stage.backgroundColor = 'rgb(25,51,0)';

        this.titleText = this.add.text(this.world.centerX, this.world.centerY - 200, "TANKS", { font: "256px monospace", fill: "#fff", align: "center" });
        this.titleText.anchor.setTo(0.5, 0.5);

        this.text1 = this.add.text(this.world.centerX, this.world.centerY, "arrows - move\nmouse - shot\nctrl - launch missile\nshift - place a mine", { font: "32px monospace", fill: "#fff", align: "center" });
        this.text1.anchor.setTo(0.5, 0.5);

        var btn = this.game.add.button(this.world.centerX, this.world.centerY + 200, 'button', this.playGame, this, 2, 1, 0);
        btn.anchor.setTo(0.5, 0.5);
        btn.scale.setTo(0.7, 0.7);

        var textBtn = this.add.text(btn.x, btn.y, "START", { font: "32px monospace", fill: "#fff", align: "center" });
        textBtn.anchor.setTo(0.5, 0.5);
  
        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(this.playGame, this);
    },
    playGame: function () {
        this.state.start('Game');
    }
};