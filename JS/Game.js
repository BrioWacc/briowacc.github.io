class Game {
    constructor(canvas) {
        this.canvas = canvas;

        this.initGame();
        this.initPlayer();
        this.initEnemy();
        this.initPause();
        this.initGameOver();
        this.initCamera();
        this.initBackGround();
        this.initLevelUp();
        this.initTimer();
        this.initDamageMessage();
    }

    initGame() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    initPlayer() {
        this.player = new Player(this);
    }

    initEnemy() {
        this.enemyContainer = [];
        this.enemySpawnTimestamp = 0;
        this.enemySpawnDelay = 1000 * 1;
        this.buffFactor=1;
        this.lastEnemy="";

        this.lastBuff=0;
    }

    buffEnemies() {
        this.buffFactor += 0.3;
        this.enemySpawnDelay /= 1.15;
        this.lastBuff=Math.floor((Date.now() - this.timerStartTimestamp - this.timeOffset) / 1000);
        console.log("THE MOBS GOT STRONGER");
    }

    initPause() {
        this.isGamePaused = false;
        this.gamePauseTimestamp=0;
        this.gamePauseDiff=0;
    }

    initGameOver() {
        this.isGameOver = false;
    }

    initCamera() {
        this.camera = {
            x: 0,
            y: 0,
            zoomFactor: ZOOM_FACTOR
        }
    }

    initBackGround() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = "Sprites/TILES/MAP.png";
    }

    initLevelUp() {
        this.levelUpActive=false;
        this.levelUpActiveTimestamp=0;
        this.levelUpDiff=0;

        this.levelUpContainer = [
            new upgradeDamage(),
            new upgradeMaxHealth(),
            new upgradeHealth(),
            new upgradeSpeed(),
            new upgradeBones(),
            new upgradeBonesLongivity(),
            new upgradeExperienceGain(),
            new upgradeDamageReduction(),
        ]

        this.randomUpgrades = [];
    }

    initTimer() {
        this.timerStartTimestamp = Date.now();
        this.elapsedSeconds=0;
        this.timeOffset=0;
    }

    initDamageMessage() {
        this.damageMessageContainer = [];
    }

    keyInput(keyCode, state) {
        switch (keyCode) {
            case 87:
                keys.w.pressed = state;
                break;
            case 65:
                keys.a.pressed = state;
                break;
            case 83:
                keys.s.pressed = state;
                break;
            case 68:
                keys.d.pressed = state;
                break;
            case 72:
                if(state) keys.h.pressed = !keys.h.pressed;
                break;
            case 27:
                if(state) this.togglePause();
                break;
        }
    }

    //Flip
    togglePause() {
        if(!this.isGamePaused) this.pauseGame();
        else                   this.resumeGame();

        this.isGamePaused = !this.isGamePaused;

    }

    //ebenfalls Flip, bloß getrennt
    pauseGame() {
        this.gamePauseTimestamp = Date.now();
    }

    //Aufrechnung der Pausenzeit, berücksichtigung der Cooldowns
    resumeGame() {
        this.gamePauseDiff = Date.now() - this.gamePauseTimestamp;
        this.player.lastBone += this.gamePauseDiff; //Cooldown Aufrechnung
        for (const bone of this.player.bones) { //Lifetime Aufrechnung
            bone.timestamp += this.gamePauseDiff; //Spawn Aufrechnung
        }
        this.enemySpawnTimestamp += this.gamePauseDiff;
        for(const enemy of this.enemyContainer) {
            if(enemy.name==="Wib") {
                for(const proj of enemy.projectile_container) {
                    proj.timestamp += this.gamePauseDiff;
                }
            }
        }
        this.timeOffset+=this.gamePauseDiff;
    }

    setupEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('click', this.playerClick.bind(this));
        window.addEventListener('mousemove', this.logMouse.bind(this));
        document.addEventListener('visibilitychange', this.tabChange.bind(this));
    }

    handleKeyDown(event) {
        this.keyInput(event.keyCode, true);
    }

    handleKeyUp(event) {
        this.keyInput(event.keyCode, false);
    }

    playerClick(event) {
        if(!this.isGameOver && !this.isGamePaused && !this.levelUpActive)this.player.throwBone();
        if(this.levelUpActive && (Date.now() - this.levelUpActiveTimestamp) > 1000) {
            if(this.rect1.x < mousePos.clientX                &&
               mousePos.clientX < this.rect1.x + this.rect1.w &&
               this.rect1.y < mousePos.clientY                &&
               mousePos.clientY < this.rect1.y + this.rect1.h) {

                this.randomUpgrades[0].apply(this.player);

                this.levelUpFinished();
            } else if (
                this.rect2.x < mousePos.clientX                &&
                mousePos.clientX < this.rect2.x + this.rect2.w &&
                this.rect2.y < mousePos.clientY                &&
                mousePos.clientY < this.rect2.y + this.rect2.h) {

                this.randomUpgrades[1].apply(this.player);

                this.levelUpFinished();
            }

        }
    }

    logMouse(event) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / canvasRect.width;
        const scaleY = this.canvas.height / canvasRect.height;

        const canvasX = (event.clientX - canvasRect.left) * scaleX;
        const canvasY = (event.clientY - canvasRect.top) * scaleY;

        mousePos.clientX = (canvasX + this.camera.x * this.camera.zoomFactor) / this.camera.zoomFactor;
        mousePos.clientY = (canvasY + this.camera.y * this.camera.zoomFactor) / this.camera.zoomFactor;
    }

    tabChange(event) {
        if (document.visibilityState !== 'visible') {
            if (!this.isGamePaused) {
                this.isGamePaused = true;
                this.pauseGame();
            }
        } else {
            console.log("player is back");
        }
    }

    //spawn Randomly auf der Map einen Gegner außerhalb der Kamera
    spawnRandomEnemy() {
        //Jetzt - letzter Spawn - Wie lange wurde pausiert
        const hold = Date.now() - this.enemySpawnTimestamp;
        if(hold < 0) this.enemySpawnTimestamp = Date.now() - this.enemySpawnDelay;
        if (Date.now() - this.enemySpawnTimestamp > this.enemySpawnDelay) {
            //width/zoomfactor = breite der Kamera, vice versa für height
            const spawnAreaWidth = this.width / this.camera.zoomFactor;
            const spawnAreaHeight = this.height / this.camera.zoomFactor;

            //console.log(this.camera.x, spawnAreaWidth, this.camera.x + spawnAreaWidth);

            let randomX = Math.random() * this.width;
            let randomY = Math.random() * this.height;

            //Verschiebung der X Koordiante falls im Kamera Bereich
            if (this.camera.x < randomX && randomX < this.camera.x + spawnAreaWidth) {
                if (randomX <= (this.camera.x + spawnAreaWidth) / 2) {
                    randomX -= spawnAreaWidth / 2;
                    randomX %= this.width;
                } else {
                    randomX += spawnAreaWidth / 2;
                    randomX %= this.width;
                }
            }

            //Verschiebung der Y Koordiante falls im Kamera Bereich
            if (this.camera.y < randomY && randomY < this.camera.y + spawnAreaHeight) {
                if (randomY <= (this.camera.y + spawnAreaHeight) / 2) {
                    randomY -= spawnAreaHeight / 2;
                    randomY %= this.height;
                } else {
                    randomY += spawnAreaHeight / 2;
                    randomY %= this.height;
                }
            }

            if (Math.random() < 0.25) {
                // Spawn Wib with 1/4 probability
                const enemy = new Wib(randomX, randomY);
                this.enemyContainer.push(enemy);
                this.enemySpawnTimestamp = Date.now();
                console.log(enemy.name, " spawned", enemy.state.x, enemy.state.y);
            } else {
                // Spawn Gob with 3/4 probability
                const enemy = new Glob(randomX, randomY);
                this.enemyContainer.push(enemy);
                this.enemySpawnTimestamp = Date.now();
                console.log(enemy.name, " spawned", enemy.state.x, enemy.state.y);
            }


        }
    }

    //Entfern Gegner
    removeEnemy(enemy) {
        const index = this.enemyContainer.indexOf(enemy);
        if(index !== -1) this.enemyContainer.splice(index, 1);
        console.log("You killed ", enemy.name, " (", enemy.stats.xpDrop, ")");
        if(enemy.name === "Wib") enemy.remove_all_projectiles();
        this.player.gainXP(enemy.stats.xpDrop);
    }

    //Hitbox Logik
    checkCollision(box1, box2) {
        return (
                box1.x < box2.x + box2.w &&
                box1.x + box1.w > box2.x &&
                box1.y < box2.y + box2.h &&
                box1.y + box1.h > box2.y
        )
    }

    hitBoxHandler() {
        for(const enemy of this.enemyContainer) {
            if(this.checkCollision(this.player.getHitbox(), enemy.getHitbox())) {
                this.player.takeDamage(Math.round(enemy.stats.damage), enemy.name);
            }

            if(enemy.name === "Wib") {
                for(const proj of enemy.projectile_container) {
                    if(this.checkCollision(this.player.getHitbox(), proj.getHitbox())) {
                        console.log(proj.damage);
                        this.player.takeDamage(Math.round(proj.damage), proj.name);
                        enemy.remove_projectile(proj);
                    }
                }
            }
        }

        this.player.drawOverlay(ctx, this.camera.x, this.camera.y);

        for(const bone of this.player.bones) {
            for(const enemy of this.enemyContainer) {
                if(this.checkCollision(bone.getHitbox(), enemy.getHitbox())) {
                    enemy.takeDamage(bone);
                    if(bone.persistence <= 0) this.player.removeBone(bone);
                    if(enemy.stats.health <= 0) this.removeEnemy(enemy);
                }

                if(enemy.name === "Wib") {
                    for(const proj of enemy.projectile_container) {
                        if(this.checkCollision(bone.getHitbox(), proj.getHitbox())) {
                            enemy.remove_projectile(proj);
                            bone.persistence -= 2;
                            if(bone.persistence <= 0) this.player.removeBone(bone);
                        }
                    }
                }
            }
        }
    }

    drawHitboxes(){
        ctx.fillStyle = "red";
        for(const enemy of this.enemyContainer) {
            ctx.fillRect(enemy.getHitbox().x, enemy.getHitbox().y, enemy.getHitbox().w, enemy.getHitbox().h);
            if(enemy.name==="Wib") {
                for(const proj of enemy.projectile_container) {
                    ctx.fillRect(proj.getHitbox().x, proj.getHitbox().y, proj.getHitbox().w, proj.getHitbox().h);
                }
            }
        }

        ctx.fillStyle = "blue";
        ctx.fillRect(this.player.getHitbox().x, this.player.getHitbox().y, this.player.getHitbox().w, this.player.getHitbox().h);

        ctx.fillStyle = "yellow";
        for(const bone of this.player.bones) {
            ctx.fillRect(bone.getHitbox().x, bone.getHitbox().y, bone.getHitbox().w, bone.getHitbox().h);
        }
    }

    DamageMessage(enemy, damage) {
        const newMsg = new damageMessage(enemy.state.x, enemy.state.y, damage);
        this.damageMessageContainer.push(newMsg);
    }

    removeMessage(msg){
        const index = this.damageMessageContainer.indexOf(msg);
        if(index === -1) this.damageMessageContainer.splice(index, 1);
    }

    //Der eigentliche Gameloop
    gameRunning() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);

        //Gegner
        this.spawnRandomEnemy();
        for (const enemy of this.enemyContainer) {
            enemy.moveEnemy(this.player.state.x, this.player.state.y);
            enemy.draw(ctx);
            if(enemy.name==="Wib") {
                for(const proj of enemy.projectile_container) {
                    if(proj.isExpired()) enemy.remove_projectile(proj)
                    else {
                        proj.moveProjectile();
                        proj.draw(ctx);
                    }
                }
            }
        }

        //Spieler
        this.player.movePlayer(keys);
        this.player.draw(ctx);

        //Bones
        for (const bone of this.player.bones) {
            if (bone.isExpired()) this.player.removeBone(bone);
            else {
                bone.moveBone();
                bone.draw(ctx);
            }
        }

        if(keys.h.pressed) this.drawHitboxes();

        for(const msg of this.damageMessageContainer) {
            if(msg.isExpired()) {
                this.removeMessage(msg);
            } else {
                msg.update();
                msg.draw(ctx);
            }
        }

        this.renderTimer(ctx);

        if (this.elapsedSeconds - this.lastBuff >= 40) this.buffEnemies();

        this.hitBoxHandler();
    }

    pausedScreen() {
        //Schwarzer Fade
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //"Game Paused" text
        ctx.fillStyle = "white";
        ctx.font = "54px PixelArt";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.lineWidth = 10;
        ctx.strokeStyle="black";
        ctx.strokeText('Game Paused', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/2));

        ctx.fillText('Game Paused', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/2));
    }

    levelUpScreen() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //damit ich den Hintergrund beibehalte, Game Running ohne move und hitboxes
        ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);

        for (const enemy of this.enemyContainer) {
            enemy.draw(ctx);
        }

        this.player.draw(ctx);

        for (const bone of this.player.bones) {
            if (bone.isExpired()) this.player.removeBone(bone);
            else {
                bone.draw(ctx);
            }
        }

        //Eigentlicher Level Up screen
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = "black";
        ctx.font = "54px PixelArt";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.lineWidth = 10;
        ctx.strokeStyle="white";
        ctx.strokeText('Level Up', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/4));

        ctx.fillText('Level Up', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/4));

        //UPGRADES ZEICHEN AHHHHHHH
        this.rect1 = {
            w: 500,
            h: 100,
            x: this.camera.x + this.width/this.camera.zoomFactor/2 - 250,
            y: this.camera.y + this.height/this.camera.zoomFactor/2 - 100
        };

        this.rect2 = {
            w: 500,
            h: 100,
            x: this.camera.x + this.width/this.camera.zoomFactor/2 - 250,
            y: this.camera.y + this.height/this.camera.zoomFactor/2 + 100
        };

        ctx.fillStyle = "black";
        ctx.fillRect(this.rect1.x - 5, this.rect1.y - 5, this.rect1.w + 10, this.rect1.h + 10);
        ctx.fillRect(this.rect2.x - 5, this.rect2.y - 5, this.rect2.w + 10, this.rect2.h + 10);

        ctx.fillStyle = "lightgreen";
        ctx.fillRect(this.rect1.x, this.rect1.y, this.rect1.w, this.rect1.h);
        ctx.fillRect(this.rect2.x, this.rect2.y, this.rect2.w, this.rect2.h);

        ctx.fillStyle = "white";
        ctx.font = "30px Minecraftia";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        ctx.strokeStyle="black";
        ctx.strokeText(this.randomUpgrades[0].getName(), this.rect1.x + this.rect1.w/2, this.rect1.y + 70);
        ctx.fillText(this.randomUpgrades[0].getName(), this.rect1.x + this.rect1.w/2, this.rect1.y + 70);
        ctx.strokeText(this.randomUpgrades[1].getName(), this.rect2.x + this.rect2.w/2, this.rect2.y + 70);
        ctx.fillText(this.randomUpgrades[1].getName(), this.rect2.x + this.rect2.w/2, this.rect2.y + 70);

    }

    levelUp() {
        console.log("player leveled up! (", this.player.stats.level-1, " -> ", this.player.stats.level, ")");
        this.levelUpActive = true;
        this.levelUpActiveTimestamp = Date.now();

        this.randomUpgrades = [];

        this.randomUpgrades = this.shuffleArray(this.levelUpContainer).slice(0, 2);
    }

    levelUpFinished() {
        this.levelUpDiff = Date.now() - this.levelUpActiveTimestamp;
        this.player.lastBone += this.levelUpDiff; //Cooldown Aufrechnung
        for (const bone of this.player.bones) { //Lifetime Aufrechnung
            bone.timestamp += this.levelUpDiff; //Spawn Aufrechnung
        }
        this.enemySpawnTimestamp += this.levelUpDiff;
        for(const enemy of this.enemyContainer) {
            if(enemy.name==="Wib") {
                for(const proj of enemy.projectile_container) {
                    proj.timestamp += this.gamePauseDiff;
                }
            }
        }
        this.timeOffset += this.levelUpDiff;
        this.levelUpActive=false;
    }

    //Für den Randomizer
    shuffleArray(array) {
        const shuffledArray = array.slice(); // Kopie des Arrays erstellen

        for (let i = shuffledArray.length - 1; i > 0; --i) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
        }

        return shuffledArray;
    }

    gameOver(name) {
        this.lastEnemy=name;
        this.isGameOver = true;
    }

    gameOverScreen() {
        //Schwarzer Fade
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //"Game Paused" text
        ctx.fillStyle = "black";
        ctx.font = "54px PixelArt";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.lineWidth = 10;
        ctx.strokeStyle="white";
        ctx.strokeText('Game Over', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/2));

        ctx.fillText('Game Over', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/2));

        ctx.fillStyle = "white";
        ctx.font = "40px PixelArt";
        ctx.fillText('F5 to restart', (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor/2 + 60));

        const deathMessage = "You were killed by " + this.lastEnemy;
        ctx.font = "20px PixelArt";
        ctx.fillText(deathMessage, (this.camera.x + this.width/this.camera.zoomFactor/2), (this.camera.y + this.height/this.camera.zoomFactor - 50));

        const skull = new Image();
        skull.src = "Sprites/PLAYER/DEATH.png";
        ctx.drawImage(
            skull,
            0, 0, 9, 8,
            this.camera.x + this.width/this.camera.zoomFactor/2 - (9*STRETCH_FACTOR*3)/2, this.camera.y + this.height/this.camera.zoomFactor/2 - (8*STRETCH_FACTOR*3)/2 - 120,
            9*STRETCH_FACTOR*3, 8*STRETCH_FACTOR*3);
    }

    renderTimer(ctx) {
        this.elapsedSeconds = Math.floor((Date.now() - this.timerStartTimestamp - this.timeOffset) / 1000);

        // Rendern Sie die vergangenen Sekunden an einer bestimmten Position auf dem Canvas
        const timerText = `Time: ${this.elapsedSeconds}s`;
        ctx.fillStyle = "white";
        ctx.font = "20px Minecraftia";
        ctx.fillText(timerText, this.camera.x + this.width/this.camera.zoomFactor - 125, this.camera.y + 50);
    }

    render(ctx) {
        //Kamera Koordinaten
        this.camera.x = this.player.state.x - (this.width / 2 / this.camera.zoomFactor);
        this.camera.y = this.player.state.y - (this.height / 2 / this.camera.zoomFactor) + this.player.sprite.HEIGHT;

        //Kamera soll nicht außerhalb der Map sein dürfen!
        this.camera.x = Math.max(0, Math.min(this.width - this.width / this.camera.zoomFactor, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.height - this.height / this.camera.zoomFactor, this.camera.y));

        ctx.save(); //Ab hier bis restore wirdt der Zoom, danke StackOverflow

        //Kamera Effekt
        ctx.translate(-this.camera.x * this.camera.zoomFactor, -this.camera.y * this.camera.zoomFactor);
        ctx.scale(this.camera.zoomFactor, this.camera.zoomFactor);

        //Spielzustände
        if(this.isGameOver) this.gameOverScreen();
        else if (this.levelUpActive) this.levelUpScreen();
        else if (!this.isGamePaused) this.gameRunning();
        else this.pausedScreen();

        ctx.restore();
    }
}