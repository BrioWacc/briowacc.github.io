class Glob {
    constructor(globx, globy) {
        this.initGlobSprite();

        this.initCharacteristics(globx, globy);

    }

    initGlobSprite() {
        this.sprite_sheet = new Image();
        this.sprite_sheet.src = "Sprites/GLOB/glob.png";

        this.sprite = {
            sprite_number: 0,
            sprite_number_offset: 0, //+0 RIGHT, +4 LEFT
            sprite_scope: 4,
            sprite_offset: 26,
            WIDTH: 26,
            HEIGHT: 18
        }

        this.sprite_correctionX=(this.sprite.WIDTH * STRETCH_FACTOR)/2;
        this.sprite_correctionY=(this.sprite.HEIGHT * STRETCH_FACTOR)/2;

        this.sprite_update_counter = 0;
    }

    initCharacteristics(globx, globy) {
        this.name = "Glob";

        this.variance = 0.75 + Math.random() * 0.5;

        this.stats = {
            health: 50 * this.variance * game.buffFactor,
            damage: 10 * this.variance * game.buffFactor,
            defence: (0.9 + 0.2 * (this.variance-0.75)/0.5) * game.buffFactor, //Soll bei 0.75 this.variance 0.90 sein und bei 1.25 bei 1.1 sein
            speed_mult: 2 * this.variance, //Für Sprite
            baseSpeed: 1.5 * this.variance * game.buffFactor, //Echte geschwindigkeit;
            xpDrop: Math.round((Math.random() * 15 + 10)* this.variance * game.buffFactor)
        }

        this.state = { //RANDOM OFF-SCREEM
            x: globx + this.sprite_correctionX*2,
            y: globy + this.sprite_correctionY*2
        }

        //IFrames
        this.iFramesDuration = 1000 * 0.5;
        this.iFramesTimestamp = 0;
    }

    moveEnemy(playerX, playerY) {
        //Player Tracking, grundsätzlich einfach bones kopiert, invertierte Operation da pos anders bestimmt wird als bei Bones
        this.directionX=playerX-this.state.x //wenn groeßer 0 -> Maus links von Spieler
        this.directionY=playerY-this.state.y //wenn groeßer 0 -> Maus ueber Spieler

        this.diffX=Math.abs(this.directionX);
        this.diffY=Math.abs(this.directionY);

        this.fracX=this.diffX/(this.diffX+this.diffY);
        this.fracY=1 - this.fracX;

        //ersteres notwening
        if (this.diffX <= this.stats.baseSpeed * this.fracX && this.diffY <= this.stats.baseSpeed * this.fracY) {
            this.sprite.sprite_number_offset = 0;
        } else {
            if (this.directionX < 0) {
                this.state.x -= this.stats.baseSpeed * this.fracX;
                this.sprite.sprite_number_offset = 4;
            } else {
                this.state.x += this.stats.baseSpeed * this.fracX;
                this.sprite.sprite_number_offset = 0;
            }
        }

        this.updateSpriteNumber();

        if(this.directionY < 0) this.state.y -= this.stats.baseSpeed * this.fracY;
        else this.state.y += this.stats.baseSpeed * this.fracY;
    }

    //Für die Walking animation, Alle 15 1/60 Sdekundden grundlegend
    updateSpriteNumber() {
        let factor = 30/this.stats.speed_mult;
        this.sprite_update_counter = (this.sprite_update_counter + 1) % Math.round(factor);
        if(this.sprite_update_counter===0) this.sprite.sprite_number = (this.sprite.sprite_number + 1) % this.sprite.sprite_scope;
    }

    //Bessere Player Experience mit 5 Abzug (dodging feeling)
    getHitbox() {
        return {
            x: this.state.x - this.sprite_correctionX + 11,
            y: this.state.y - this.sprite_correctionY + 13,
            w: (this.sprite.WIDTH*STRETCH_FACTOR - 18)*this.variance,
            h: (this.sprite.HEIGHT*STRETCH_FACTOR - 22)*this.variance
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
            game.DamageMessage(this, damage);
        }
    }

    //Zeichene auf ctx
    draw(ctx){
        ctx.drawImage(
            this.sprite_sheet,
            this.sprite.sprite_offset * (this.sprite.sprite_number + this.sprite.sprite_number_offset), 0, this.sprite.WIDTH, this.sprite.HEIGHT, //Ermittlung des richtigen Sprites
            this.state.x - this.sprite_correctionX, this.state.y - this.sprite_correctionY, //X & Y auf dem Canvas
            this.sprite.WIDTH*STRETCH_FACTOR * this.variance, this.sprite.HEIGHT*STRETCH_FACTOR * this.variance);
    }
}