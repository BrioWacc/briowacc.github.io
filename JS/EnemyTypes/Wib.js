class Wib {
    constructor(globx, globy) {
        this.initGlobSprite();

        this.initCharacteristics(globx, globy);

        this.initShoot();
    }

    initGlobSprite() {
        this.sprite_sheet = new Image();
        this.sprite_sheet.src = "Sprites/WIB/WIB_sheet.png";

        this.sprite = {
            sprite_number: 0,
            sprite_number_offset: 0,
            sprite_scope: 8,
            sprite_offset: 26,
            WIDTH: 18,
            HEIGHT: 28
        }

        this.sprite_correctionX=(this.sprite.WIDTH * STRETCH_FACTOR)/2;
        this.sprite_correctionY=(this.sprite.HEIGHT * STRETCH_FACTOR)/2;

        this.sprite_update_counter = 0;
    }

    initCharacteristics(globx, globy) {
        this.name = "Wib";

        this.variance = 0.75 + Math.random() * 0.5;

        this.stats = {
            health: 30 * this.variance * game.buffFactor,
            damage: 13 * this.variance * game.buffFactor,
            defence: (0.7 + 0.2 * (this.variance-0.75)/0.5) * game.buffFactor, //Soll bei 0.75 this.variance 0.90 sein und bei 1.25 bei 1.1 sein
            speed_mult: 0.5 * this.variance * game.buffFactor, //Für Sprite
            baseSpeed: 1.5 * this.variance * game.buffFactor, //Echte geschwindigkeit;
            xpDrop: Math.round((Math.random() * 20 + 10)* this.variance * game.buffFactor)
        }

        this.state = { //RANDOM OFF-SCREEM
            x: globx,
            y: globy
        }

        //IFrames
        this.iFramesDuration = 1000 * 0.5;
        this.iFramesTimestamp = 0;

        this.projectile_container = [];
    }

    initShoot() {
        this.lastShotTimestamp = Date.now();
        this.shootInterval = 1000 * 15; //10000
    }

    moveEnemy(playerX, playerY) {
        this.updateSpriteNumber();

        const currentTime = Date.now();
        if (currentTime - this.lastShotTimestamp > this.shootInterval && this.sprite.sprite_number===0) {
            this.shoot_projectile();
            this.lastShotTimestamp = currentTime;
        }
    }

    //Für die Walking animation
    updateSpriteNumber() {
        let factor = 30/this.stats.speed_mult;
        this.sprite_update_counter = (this.sprite_update_counter + 1) % Math.round(factor);
        if(this.sprite_update_counter === 0) this.sprite.sprite_number = (this.sprite.sprite_number + 1) % this.sprite.sprite_scope;
    }

    shoot_projectile() {
        const projectile = new Projectiles(this);
        this.projectile_container.push(projectile);
    }

    remove_projectile(projectile) {
        const index = this.projectile_container.indexOf(projectile);
        if(index !== -1) this.projectile_container.splice(index, 1);
    }

    remove_all_projectiles() {
        for(const projectile of this.projectile_container) {
            this.remove_projectile(projectile);
        }
    }

    //Bessere Player Experience mit 5 Abzug (dodging feeling)
    getHitbox() {
        return {
            x: this.state.x - this.sprite_correctionX,
            y: this.state.y - this.sprite_correctionY,
            w: (this.sprite.WIDTH*STRETCH_FACTOR)*this.variance,
            h: (this.sprite.HEIGHT*STRETCH_FACTOR)*this.variance
        }
    }

    takeDamage(source) {
        const hold = Date.now() - this.iFramesTimestamp; //BUG FIX
        if(hold < 0) this.iFramesTimestamp = Date.now() - this.iFramesDuration;
        if(Date.now() - this.iFramesTimestamp > this.iFramesDuration) {
            const damage = Math.round(source.damage/this.stats.defence);
            this.stats.health -= damage;
            --source.persistence;
            this.iFramesTimestamp = Date.now();
            console.log("I took damage", damage);
        }
    }

    //Zeichene auf ctx
    draw(ctx){
        ctx.drawImage(
            this.sprite_sheet,
            this.sprite.sprite_number*this.sprite.WIDTH, 0, this.sprite.WIDTH, this.sprite.HEIGHT, //Ermittlung des richtigen Sprites
            this.state.x - this.sprite_correctionX, this.state.y - this.sprite_correctionY, //X & Y auf dem Canvas
            this.sprite.WIDTH*STRETCH_FACTOR * this.variance, this.sprite.HEIGHT*STRETCH_FACTOR * this.variance
        );
    }
}