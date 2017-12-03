var land;

var tank;
var turret;

var playerMaxHp = 50;
var playerHp;
var maxPackages = 2;

var healthPack;

var enemies;
var enemyBullets;
var enemiesTotal = 10;
var enemiesAlive = 10;
var explosions;

var lvl = 1;

var startMenu;

var currentSpeed = 0;
var cursors;
var missileKey;
var mineKey;

var bullets;
var bulletFireRate = 500;
var bulletNextFire = 0;

var missiles;
var missileFireRate = 0;
var missileNextFire = 0;
var missilesAmount;
var maxMissilesAmount = 10;

var mines;
var minesAmount;
var maxMinesAmount = 10;

var tree;
var wall;
var obstacle;

GameStates.Game = function (game) {

};

GameStates.Game.prototype = {

    create: function () {

        playerHp = playerMaxHp;
        missilesAmount = maxMissilesAmount;
        minesAmount = maxMinesAmount;

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

        rocketPackagesGroup = this.game.add.group();
        rocketPackagesGroup.enableBody = true;
        rocketPackagesGroup.physicsBodyType = Phaser.Physics.ARCADE;

        minesPackagesGroup = this.game.add.group();
        minesPackagesGroup.enableBody = true;
        minesPackagesGroup.physicsBodyType = Phaser.Physics.ARCADE;

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

       
        for (var i; i < 10; i++)
        {
            healthPacks.push(new healthPack());
        }
        obstacle = this.game.add.group();
        obstacle.enableBody = true;
        for (var j = 0; j < 5; j++) {
            var x = this.game.world.randomX;
            var y = this.game.world.randomY;
            var tree = obstacle.create(x, y, 'tree');
            tree.scale.setTo(0.7,0.7);
            tree.body.immovable = true;
        }
        for (var i = 0; i < 5; i++) {
            var x = this.game.world.randomX;
            var y = this.game.world.randomY;
            var stone = obstacle.create(x, y, 'stone');
            stone.scale.setTo(0.2, 0.2);
            stone.body.immovable = true;
        }
        //enemiesTotal = 1;
        //enemiesAlive = 1;

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

        mines = this.game.add.group();
        mines.enableBody = true;
        mines.physicsBodyType = Phaser.Physics.ARCADE;
        mines.createMultiple(30, 'mine', 0, false);
        mines.setAll('anchor.x', 0.5);
        mines.setAll('anchor.y', 0.5);

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

        mineKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        mineKey.onDown.add(this.placeMine, this);
    },

    update: function () {
        this.game.physics.arcade.overlap(enemyBullets, tank, this.bulletHitPlayer, null, this);

        if (packagesGroup.countLiving() < maxPackages) {
            this.placePackage(this.game.world.randomX,
                this.game.world.randomY);
        }
        this.game.physics.arcade.overlap(packagesGroup, tank, this.playerGetHealthPackage, null, this);

        if (rocketPackagesGroup.countLiving() < maxPackages) {
            this.placeRocketPackage(this.game.world.randomX,
                this.game.world.randomY);
        }
        this.game.physics.arcade.overlap(rocketPackagesGroup, tank, this.playerGetRocketPackage, null, this);

        if (minesPackagesGroup.countLiving() < maxPackages) {
            this.placeMinePackage(this.game.world.randomX,
                this.game.world.randomY);
        }
        this.game.physics.arcade.overlap(minesPackagesGroup, tank, this.playerGetMinePackage, null, this);

        enemiesAlive = 0;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].alive) {
                enemiesAlive++;
                this.game.physics.arcade.collide(tank, enemies[i].tank);
                this.game.physics.arcade.overlap(bullets, enemies[i].tank, this.bulletHitEnemy, null, this);
                this.game.physics.arcade.overlap(missiles, enemies[i].tank, this.missileHitEnemy, null, this);
                this.game.physics.arcade.overlap(mines, enemies[i].tank, this.mineHitEnemy, null, this);
                this.game.physics.arcade.collide(tank, obstacle);
                this.game.physics.arcade.collide(enemies[i].tank, obstacle);
                enemies[i].update();
            }
            this.game.physics.arcade.overlap(missiles, obstacle, this.missileHitObstacle, null, this);
            this.game.physics.arcade.overlap(bullets, obstacle, this.bulletHitObstacle, null, this);
            this.game.physics.arcade.overlap(enemyBullets, obstacle, this.bulletHitObstacle, null, this);
        }

        if (enemiesAlive == 0) {
            this.levelUp(this);
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
        this.game.debug.text('Mines: ' + minesAmount, 32, 96);
        this.game.debug.text('Lvl: ' + lvl, 32, 112);
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

    placeMine: function () {

        if (minesAmount > 0) {
            minesAmount--;
            var mine = mines.getFirstExists(false);
            mine.reset(turret.x, turret.y);
        }
    },

    playerGetHealthPackage: function (tank, package) {

        package.kill();
        playerHp = playerMaxHp;

    },

    playerGetRocketPackage: function (tank, rocketPackage) {

        rocketPackage.kill();
        missilesAmount = maxMissilesAmount;

    },

    playerGetMinePackage: function (tank, minePackage) {

        minePackage.kill();
        minesAmount = maxMinesAmount;

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

    levelUp: function () {
        enemiesTotal += 5;
        enemiesAlive = enemiesTotal;
        lvl++;
        this.game.state.restart();
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

    bulletHitObstacle: function (bullet) {
        bullet.kill();
    },

    missileHitObstacle: function (missile) {
        missile.kill();
    },

    mineHitEnemy: function (tank, mine) {

        mine.kill();

        var destroyed = enemies[tank.name].mineDamage();

        if (destroyed) {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }

    },

    gameOver: function () {
        this.game.world.setBounds(0, 0, 1000, 700);
        enemiesTotal = 10;
        enemiesAlive = enemiesTotal;
        lvl = 1;
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

EnemyTank.prototype.mineDamage = function () {

    this.health -= 5;

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

var healthPackage = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'health_pack');

    this.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    this.SPEED = 0;
}

var rocketPackage = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'missiles_pack');

    this.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    this.SPEED = 0;
}

var minePackage = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'mines_pack');

    this.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    this.SPEED = 0;
}

healthPackage.prototype = Object.create(Phaser.Sprite.prototype);
healthPackage.prototype.constructor = healthPackage;

healthPackage.prototype.update = function () { }

minePackage.prototype = Object.create(Phaser.Sprite.prototype);
minePackage.prototype.constructor = minePackage;

minePackage.prototype.update = function () { }

rocketPackage.prototype = Object.create(Phaser.Sprite.prototype);
rocketPackage.prototype.constructor = rocketPackage;

rocketPackage.prototype.update = function () { }

GameStates.Game.prototype.placePackage = function (x, y) {

    var package = packagesGroup.getFirstDead();
    if (package === null) {

            package = new healthPackage(this.game);
            packagesGroup.add(package);

    }

    package.revive();

    package.x = x;
    package.y = y;

    return package;
};

GameStates.Game.prototype.placeRocketPackage = function (x, y) {

    var rocketPack = rocketPackagesGroup.getFirstDead();

    if (rocketPack === null) {

        rocketPack = new rocketPackage(this.game);
        rocketPackagesGroup.add(rocketPack);

    }

    rocketPack.revive();

    rocketPack.x = x;
    rocketPack.y = y;

    return rocketPack;
};

GameStates.Game.prototype.placeMinePackage = function (x, y) {

    var minePack = minesPackagesGroup.getFirstDead();

    if (minePack === null) {

        minePack = new minePackage(this.game);
        minesPackagesGroup.add(minePack);

    }

    minePack.revive();

    minePack.x = x;
    minePack.y = y;

    return minePack;
};