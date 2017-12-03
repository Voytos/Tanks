
var land;

var tank;
var turret;

var playerHp = 50;
var missiles = 0;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var startMenu;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 500;
var nextFire = 0;

GameStates.Game = function (game) {

};

GameStates.Game.prototype = {

    create: function () {

        this.game.world.setBounds(-1000, -1000, 2000, 2000);

        land = this.game.add.tileSprite(0, 0, 1000, 700, 'earth');
        land.fixedToCamera = true;

        tank = this.game.add.sprite(0, 0, 'tank');
        tank.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(tank, Phaser.Physics.ARCADE);
        tank.body.drag.set(0.4);
        tank.body.maxVelocity.setTo(400, 400);
        tank.body.collideWorldBounds = true;

        turret = this.game.add.sprite(0, 0, 'turret');
        turret.anchor.setTo(0.18, 0.5);

        enemyBullets = this.game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(100, 'bullet');

        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 0.5);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);


        enemies = [];

        enemiesTotal = 10;
        enemiesAlive = 10;

        for (var i = 0; i < enemiesTotal; i++) {
            enemies.push(new EnemyTank(i, this.game, tank, enemyBullets));
        }

        bullets = this.game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet', 0, false);
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        explosions = this.game.add.group();

        for (var i = 0; i < 10; i++) {
            var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(3);
            explosionAnimation.animations.add('kaboom');
        }

        tank.bringToTop();
        turret.bringToTop();

        startMenu = this.add.text(this.game.width / 2, this.game.height / 2, "Click to start", { font: "80px monospace", fill: "#fff" });
        startMenu.anchor.setTo(0.5, 0.5);
        startMenu.fixedToCamera = true;
        this.game.input.onDown.add(this.removeStartMenu, this);

        this.game.camera.follow(tank);
        this.game.camera.deadzone = new Phaser.Rectangle(400, 280, 200, 140);
        this.game.camera.focusOnXY(0, 0);

        cursors = this.game.input.keyboard.createCursorKeys();
    },

    update: function () {

        this.game.physics.arcade.overlap(enemyBullets, tank, this.bulletHitPlayer, null, this);

        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                this.game.physics.arcade.collide(tank, enemies[i].tank);
                this.game.physics.arcade.overlap(bullets, enemies[i].tank, this.bulletHitEnemy, null, this);
                enemies[i].update();
            }
        }

        if (cursors.left.isDown) {
            tank.angle -= 4;
        } else if (cursors.right.isDown) {
            tank.angle += 4;
        }

        if (cursors.up.isDown) {
            currentSpeed = 300;
        } else {
            if (currentSpeed > 0) {
                currentSpeed -= 4;
            }
        }

        if (currentSpeed > 0) {
            this.game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
        }

        land.tilePosition.x = -this.game.camera.x;
        land.tilePosition.y = -this.game.camera.y;

        turret.x = tank.x;
        turret.y = tank.y;

        turret.rotation = this.game.physics.arcade.angleToPointer(turret);

        if (this.game.input.activePointer.isDown) {
            this.fire(this);
        }

    },

    render: function () {
        this.game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 48);
        this.game.debug.text('Player HP: ' + playerHp + ' / 50', 32, 64);
        this.game.debug.text('Missiles: ' + missiles, 32, 80);
    },

    fire: function () {

        if (this.game.time.now > nextFire && bullets.countDead() > 0) {
            nextFire = this.game.time.now + fireRate;

            var bullet = bullets.getFirstExists(false);

            bullet.reset(turret.x, turret.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer);
        }

    },

    removeStartMenu: function () {
        startMenu.destroy();
        this.game.paused = false;
    },

    bulletHitPlayer: function (tank, bullet) {

        bullet.kill();
        if (playerHp > 0) {
            playerHp--;
        }
        if (playerHp == 0) {
            this.restartGame(this);
        }

    },

    restartGame: function () {
        playerHp = 30;
        this.state.restart();
    },

    bulletHitEnemy: function (tank, bullet) {

        bullet.kill();

        var destroyed = enemies[tank.name].damage();

        if (destroyed) {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }

    },

};

EnemyTank = function (index, game, player, bullets) {

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.tank = game.add.sprite(x, y, 'tank');
    this.turret = game.add.sprite(x, y, 'turret');

    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function () {

    this.health -= 1;

    if (this.health <= 0) {
        this.alive = false;

        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function () {

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300) {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }

};




