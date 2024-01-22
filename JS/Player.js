class Player {
    constructor(game) {
        this.game = game;

        //Player Sprite
        this.initPlayerSprite();

        //Health
        this.initEmptyBar();

        //XP
        this.initXPBar();

        //Stats, X/Y-Koordinaten, iFrames
        this.initCharacteristics();

        //Bone related
        this.initboneStuff();
    }

    initPlayerSprite() {
        this.sprite_sheet = new Image();
        this.sprite_sheet.src = "Sprites/PLAYER/player.png";

        this.sprite = {
            sprite_number: 0,
            sprite_number_offset: 0, //+3 RIGHT, +6 UP, +9 LEFT, +>12 Damage
            sprite_scope: 3,
            sprite_offset: 11,
            WIDTH: 11,
            HEIGHT: 17
        }

        //Sprite Verschiebung zur Rentrierung
        this.sprite_correctionX=(this.sprite.WIDTH * STRETCH_FACTOR)/2;
        this.sprite_correctionY=(this.sprite.HEIGHT * STRETCH_FACTOR)/2;

        //Counte für Anim
        this.sprite_update_counter = 0
    }

    initEmptyBar() {
        this.empty_bar = new Image();
        this.empty_bar.src = "Sprites/OVERLAY/empty_bar.png";

        this.empty_bar_sprite = {
            x: 0,
            y: 0,
            WIDTH: 192,
            HEIGHT: 18
        }

        this.hp_bar = new Image();

        this.hp_bar_sprite = {
            x: 0,
            y: 0,
            WIDTH: 186,
            HEIGHT: 12
        }
    }

    initXPBar(){
        this.xp_bar = new Image();
        this.xp_bar.src = "Sprites/OVERLAY/XP_Bar.png";

        this.xp_bar_sprite = {
            x: 0,
            y: 0,
            WIDTH: 186,
            HEIGHT: 11
        }

        this.xp = new Image();
        this.xp.src = "Sprites/OVERLAY/XP.png";

        this.xp_sprite = {
            x: 0,
            y: 0,
            WIDTH: 180,
            HEIGHT: 5
        }
    }

    initCharacteristics() {
        //Stats
        this.stats = {
            level: 1,
            currentxp:0,
            requiredXP: 100,
            xpIncrement: 15,
            maxhealth:80,
            health: 80,
            damage: 2.5,
            speed_mult: 1.2,
            tear_mult: 1,
            tear_type: tearTypes.normal.string,
            tear_persistence: 2,
            tear_speed: 2,
            tear_long: 0
        }

        //Zentrierung
        this.state = {
            x: (this.game.width - this.sprite.WIDTH * STRETCH_FACTOR) / 2,
            y: (this.game.height - this.sprite.HEIGHT * STRETCH_FACTOR) / 2
        }

        //iFrames math
        this.iFramesTimestamp=0;
        this.iFramesDuration = 1000 * 0.5;
    }

    initboneStuff() {
        this.standard_delay=1000;
        this.bones = []; //Bone Holder
        this.lastBone = 0; //timestamp
    }

    movePlayer(keys) {
        const speed = 2*this.stats.speed_mult;

        //Geh Logik W S Priorität über A D
        if (keys.a.pressed) {
            this.state.x -= speed;
            this.sprite.sprite_number_offset=9;
        }

        if (keys.d.pressed) {
            this.state.x += speed;
            this.sprite.sprite_number_offset=3;
        }

        if (keys.w.pressed) {
            this.state.y -= speed;
            this.sprite.sprite_number_offset=6;
        }

        if (keys.s.pressed) {
            this.state.y += speed;
            this.sprite.sprite_number_offset=0;
        }

        this.updateSpriteNumber();

        //StandAnimation
        if(this.lastx===this.state.x && this.lasty===this.state.y) this.sprite.sprite_number=0;

        //Alte Position
        this.lastx=this.state.x;
        this.lasty=this.state.y;

        //Bounds Check
        this.state.x = Math.max(0, Math.min(this.game.width - this.sprite.WIDTH * STRETCH_FACTOR + this.sprite_correctionX, this.state.x));
        this.state.y = Math.max(0, Math.min(this.game.height - this.sprite.HEIGHT * STRETCH_FACTOR + this.sprite_correctionY, this.state.y));
    }

    //Für die Walking animation, Alle 15 * 1/60 Sekunden grundlegend
    updateSpriteNumber() {
        let factor = 15/this.stats.speed_mult;
        this.sprite_update_counter = (this.sprite_update_counter + 1) % Math.round(factor);
        if(this.sprite_update_counter===0) {
            this.sprite.sprite_number = (this.sprite.sprite_number + 1) % this.sprite.sprite_scope;
            if(this.sprite.sprite_number === 0 && (this.sprite.sprite_number_offset === 0 || this.sprite.sprite_number_offset === 6)) this.sprite.sprite_number = 1;
        }

    }

    //Knochen-Logik, jetzt - wann der letzte Knochen geworfen wurde - die Pausenzeit
    throwBone() {
        const hold = Date.now() - this.lastBone; //BUG FIX
        if(hold < 0) this.lastBone=Date.now() - (this.standard_delay / this.stats.tear_mult); //BUG FIX
        if(Date.now() - this.lastBone > this.standard_delay / this.stats.tear_mult) {
            const bone = new Bones(this);
            this.bones.push(bone);
            this.lastBone = Date.now();
        }
    }

    //Funktion zum removen aus dem Array, so das es nicht existiert
    removeBone(bone) {
        const index = this.bones.indexOf(bone);
        if(index !== -1) this.bones.splice(index, 1);
    }

    //Bessere Player Experience (dodging feeling)
    getHitbox() {
        if(this.sprite.sprite_number_offset === 6 || this.sprite.sprite_number_offset === 0) //OBEN UNTEN
            return {
            x: this.state.x - this.sprite_correctionX + 8,
            y: this.state.y - this.sprite_correctionY + 11,
            w: this.sprite.WIDTH*STRETCH_FACTOR - 16,
            h: this.sprite.HEIGHT*STRETCH_FACTOR - 16
            }
        else if (this.sprite.sprite_number_offset === 3)                                     //LINKS
            return {
                x: this.state.x - this.sprite_correctionX + 16,
                y: this.state.y - this.sprite_correctionY + 11,
                w: this.sprite.WIDTH*STRETCH_FACTOR - 24,
                h: this.sprite.HEIGHT*STRETCH_FACTOR - 16
            }
        else                                                                                 //RECHTS
            return {
                x: this.state.x - this.sprite_correctionX + 8,
                y: this.state.y - this.sprite_correctionY + 11,
                w: this.sprite.WIDTH*STRETCH_FACTOR - 22,
                h: this.sprite.HEIGHT*STRETCH_FACTOR - 16
            }
    }

    takeDamage(damage, name) {
        const hold = Date.now() - this.iFramesTimestamp; //BUG FIX
        if(hold < 0) this.iFramesTimestamp = Date.now() - this.iFramesDuration;
        if(Date.now() - this.iFramesTimestamp > this.iFramesDuration) {
            this.stats.health -= damage;
            if (this.stats.health <= 0) game.gameOver(name);
            this.iFramesTimestamp = Date.now();
        }
    }

    gainXP(XP) {
        this.stats.currentxp += XP;
        if(this.stats.currentxp >= this.stats.requiredXP) {
            ++this.stats.level;
            this.stats.currentxp %= this.stats.requiredXP;
            this.stats.requiredXP += this.stats.xpIncrement;
            game.levelUp();
        }
    }

    //Zeichene auf ctx
    draw(ctx){
        ctx.drawImage(
            this.sprite_sheet,
            this.sprite.sprite_offset * (this.sprite.sprite_number + this.sprite.sprite_number_offset), 0, this.sprite.WIDTH, this.sprite.HEIGHT, //Ermittlung des richtigen Sprites
            this.state.x - this.sprite_correctionX, this.state.y - this.sprite_correctionY, //X & Y auf dem Canvas
            this.sprite.WIDTH*STRETCH_FACTOR, this.sprite.HEIGHT*STRETCH_FACTOR
        )
    }

    drawOverlay(ctx, camerax, cameray) {
        if(this.stats.health >= this.stats.maxhealth*0.75) this.hp_bar.src="Sprites/OVERLAY/100to75.png";
        else if(this.stats.health >= this.stats.maxhealth*0.25) this.hp_bar.src="Sprites/OVERLAY/75to25.png";
        else this.hp_bar.src="Sprites/OVERLAY/25to0.png";

        ctx.drawImage(
            this.empty_bar,
            0, 0, this.empty_bar_sprite.WIDTH, this.empty_bar_sprite.HEIGHT,
            camerax + 5, cameray + 5,
            this.empty_bar_sprite.WIDTH * 2, this.empty_bar_sprite.HEIGHT * 2
        )

        let factor = (this.stats.health/this.stats.maxhealth);
        if (factor > 1) factor = 1;

        ctx.drawImage(
            this.hp_bar,
            0, 0, this.hp_bar_sprite.WIDTH, this.hp_bar_sprite.HEIGHT,
            camerax + 11, cameray + 11,
            this.hp_bar_sprite.WIDTH * 2 * factor, this.hp_bar_sprite.HEIGHT * 2
        )

        const healthText = `${this.stats.health} / ${this.stats.maxhealth}`;
        const healthTextWidth = ctx.measureText(healthText).width;

        ctx.fillStyle = "white";
        ctx.font = "15px Minecraftia";

        ctx.lineWidth = 4;
        ctx.strokeStyle="black";
        ctx.strokeText(healthText,
                      (camerax + 5 + this.empty_bar_sprite.WIDTH - healthTextWidth/2 + 10),
                      (cameray + 5 + this.empty_bar_sprite.HEIGHT + 16)
        );

        ctx.fillText( //durch randomness entschieden
            healthText,
            camerax + 5 + this.empty_bar_sprite.WIDTH - healthTextWidth/2 + 10, // Adjust the X position as needed
            cameray + 5 + this.empty_bar_sprite.HEIGHT + 16// Adjust the Y position as needed
        );

        //XP BAR STUFF
        ctx.drawImage(
            this.xp_bar,
            0, 0, this.xp_bar_sprite.WIDTH, this.xp_bar_sprite.HEIGHT,
            camerax + game.width/game.camera.zoomFactor/2 - this.xp_bar_sprite.WIDTH*2/2, //X AUF DEM CANVAS
            cameray + game.height/game.camera.zoomFactor - this.xp_bar_sprite.HEIGHT*3, //Y AUF DEM CANVAS
            this.xp_bar_sprite.WIDTH*2, this.xp_bar_sprite.HEIGHT*2
        )

        ctx.drawImage(
            this.xp,
            0, 0, this.xp_sprite.WIDTH, this.xp_sprite.HEIGHT,
            camerax + game.width/game.camera.zoomFactor/2 - this.xp_bar_sprite.WIDTH*2/2 + 6, //X AUF DEM CANVAS
            cameray + game.height/game.camera.zoomFactor - this.xp_bar_sprite.HEIGHT*3 + 6,
            this.xp_sprite.WIDTH*2*this.stats.currentxp/this.stats.requiredXP, this.xp_sprite.HEIGHT*2
        )
    }
}