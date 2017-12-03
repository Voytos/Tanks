var land;

var tank;
var turret;

var playerMaxHp = 20;
var playerHp;
var maxPackages = 2;

var healthPack;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var startMenu;

var currentSpeed = 0;
var cursors;
var missileKey;

var bullets;
var bulletFireRate = 500;
var bulletNextFire = 0;

var missiles;
var missileFireRate = 0;
var missileNextFire = 0;
var missilesAmount = 5;

var tree;
var wall;

GameStates.Game = function (game) {

};

GameStates.Game.prototype = {

    create: function () {

        playerHp = playerMaxHp;

        this.game.world.setBounds(-1000, -1000, 2000, 2000);

        land = this.game.add.tileSprite(0, 0, 1000, 700, 'earth');
        land.fixedToCamera = true;

        tank = this.game.add.sprite(0, 0, 'tank');
        tank.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(tank, Phaser.Physics.ARCADE);
        tank.body.drag.set(0.4);
        tank.body.maxVelocity.setTo(400, 400);
        tank.body.collideWorldBounds = true;

        packagesGroup = this.game.add.group();
        packagesGroup.enableBody = true;
        packagesGroup.physicsBodyType = Phaser.Physics.ARCADE;

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
        healthPacks = [];
        obstacle = [];

        for (var i; i < 10; i++)
        {
            healthPacks.push(new healthPack());
        }
        for (var i = 0; i < 5; i++) {
            obstacle.push(new Three(i,this.game,tank))
        }
        for (var i = 0; i < 5; i++) {
            obstacle.push(new Wall(i,this.game,tank))
        }

        debugger;
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

        missiles = this.game.add.group();
        missiles.enableBody = true;
        missiles.physicsBodyType = Phaser.Physics.ARCADE;
        missiles.createMultiple(30, 'missile', 0, false);
        //missiles.scale.setTo(0.5);
        missiles.setAll('anchor.x', 0.5);
        missiles.setAll('anchor.y', 0.5);
        missiles.setAll('outOfBoundsKill', true);
        missiles.setAll('checkWorldBounds', true);
        //missiles.scale.setTo(0.5);

        explosions = this.game.add.group();

        for (var i = 0; i < 10; i++) {
            var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(3);
            explosionAnimation.animations.add('kaboom');
        }

        tank.bringToTop();
        turret.bringToTop();

        this.game.camera.follow(tank);
        this.game.camera.deadzone = new Phaser.Rectangle(400, 280, 200, 140);
        this.game.camera.focusOnXY(0, 0);

        cursors = this.game.input.keyboard.createCursorKeys();

        missileKey = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        missileKey.onDown.add(this.fireMissile, this);
    },

    update: function () {

        this.game.physics.arcade.overlap(enemyBullets, tank, this.bulletHitPlayer, null, this);

        if (packagesGroup.countLiving() < maxPackages) {
            this.placePackage(this.game.world.randomX,
                this.game.world.randomY);
        }
        this.game.physics.arcade.overlap(packagesGroup, tank, this.playerGetHealthPackage, null, this);

        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                this.game.physics.arcade.collide(tank, enemies[i].tank);
                this.game.physics.arcade.overlap(bullets, enemies[i].tank, this.bulletHitEnemy, null, this);
                this.game.physics.arcade.overlap(missiles, enemies[i].tank, this.missileHitEnemy, null, this);
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
            this.fireBullet(this);
        }

    },

    render: function () {
        this.game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 48);
        this.game.debug.text('Player HP: ' + playerHp + ' / ' + playerMaxHp, 32, 64);
        this.game.debug.text('Missiles: ' + missilesAmount, 32, 80);
    },

    fireBullet: function () {

        if (this.game.time.now > bulletNextFire && bullets.countDead() > 0) {
            bulletNextFire = this.game.time.now + bulletFireRate;

            var bullet = bullets.getFirstExists(false);

            bullet.reset(turret.x, turret.y);

            bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer);
        }

    },

    fireMissile: function () {
        
        if (missilesAmount > 0 && this.game.time.now > missileNextFire && missiles.countDead() > 0) {

            missilesAmount--;

            missileNextFire = this.game.time.now + missileFireRate;

            var missile = missiles.getFirstExists(false);

            missile.reset(turret.x, turret.y);

            missile.rotation = this.game.physics.arcade.moveToPointer(missile, 1000, this.game.input.activePointer);
        }
    },

    playerGetHealthPackage: function (tank, package) {

        package.kill();
        playerHp = playerMaxHp;

    },

    bulletHitPlayer: function (tank, bullet) {

        bullet.kill();
        if (playerHp > 0) {
            playerHp--;
        }
        if (playerHp == 0) {
            this.gameOver(this);
        }
    },

    bulletHitEnemy: function (tank, bullet) {

        bullet.kill();

        var destroyed = enemies[tank.name].bulletDamage();

        if (destroyed) {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }

    },

    missileHitEnemy: function (tank, missile) {

        missile.kill();

        var destroyed = enemies[tank.name].missileDamage();

        if (destroyed) {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }

    },

    gameOver: function () {
        this.game.world.setBounds(0, 0, 1000, 700);

        this.state.start('GameOver');
    },

};

healthPack = function () {

    var x = game.world.randomX;
    var y = game.world.randomY;

    var hp;
    this.hp = game.add.sprite(x, y, 'turret');
    this.body.immovable = true;
    game.physics.enable(this.hp, Phaser.Physics.collide);
}

Three = function (index,game,player) {
    var x = game.world.randomX;
    var y = game.world.randomY;
    debugger;
    this.game = game;
    this.player = player;
    this.tree = game.add.sprite(x, y, 'tree');
    this.tree.anchor.set(0.5);
    this.tree.name = index.toString();
    game.physics.enable(this.tree, Phaser.Physics.ARCADE);
    //this.body.immovable = true;
    
}

Wall = function (index, game, player) {
    var x = game.world.randomX;
    var y = game.world.randomY;
    debugger;
    this.game = game;
    this.player = player;
    this.wall = game.add.sprite(x, y, 'stone');
    this.wall.anchor.set(0.5);
    this.wall.name = index.toString();
    game.physics.enable(this.wall, Phaser.Physics.ARCADE);
    //this.body.immovable = true;

}

EnemyTank = function (index, game, player, bullets) {

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.bulletFireRate = 1000;
    this.bulletNextFire = 0;
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

EnemyTank.prototype.bulletDamage = function () {

    this.health -= 1;

    if (this.health <= 0) {
        this.alive = false;

        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.missileDamage = function () {

    this.health -= 3;

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
        if (this.game.time.now > this.bulletNextFire && this.bullets.countDead() > 0) {
            this.bulletNextFire = this.game.time.now + this.bulletFireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }

};

var Package = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'health_pack');

    this.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    this.SPEED = 0;
}

Package.prototype = Object.create(Phaser.Sprite.prototype);
Package.prototype.constructor = Package;

Package.prototype.update = function () { }

GameStates.Game.prototype.placePackage = function (x, y) {

    var package = packagesGroup.getFirstDead();

    if (package === null) {
        package = new Package(this.game);
        packagesGroup.add(package);
    }

    package.revive();

    package.x = x;
    package.y = y;

    return package;
};