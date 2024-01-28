class Projectiles {
    constructor(wib) {
        this.timestamp = Date.now();
        this.lifespan = 1000 * 15;
        this.variance = wib.variance;
        this.tear_speed = 3 * this.variance;
        this.baseSpeed = 2 * this.variance;
        this.damage = 1.5 * wib.stats.damage * this.variance;
        this.x = wib.state.x - 20;
        this.y = wib.state.y - 80;
        console.log("created");

        this.name="Wib Projectile";

        //
        this.initSprite();

        //Winkel Mathematik
        this.angleMath();
    }

    initSprite() {
        this.proj_img = new Image();
        this.proj_img.src = "Sprites/WIB/projectile.png";

        this.sprite = {
            sprite_number: 0,
            sprite_offset: 0,
            WIDTH: 16,
            HEIGHT: 16
        }

        //Verschiebung aufs Zentrum, wichtig fürs zeichnen, durch trial and error optimiert
        this.sprite_correctionX=(this.sprite.WIDTH * STRETCH_FACTOR)/2;
        this.sprite_correctionY=(this.sprite.HEIGHT * STRETCH_FACTOR)/2;
    }

    angleMath() {
        //Vergleich mit dem Spieler
        this.directionX=this.x-game.player.state.x; //wenn kleiner 0 -> Maus links von Spieler
        this.directionY=this.y-game.player.state.y; //wenn kleiner 0 -> Maus ueber Spieler

        this.diffX=Math.abs(this.directionX);
        this.diffY=Math.abs(this.directionY);

        //Winkel Anteil jeweiliger X Y Koordinate
        this.fracX=this.diffX/(this.diffX+this.diffY);
        this.fracY=1 - this.fracX;
    }

    //Mauszeiger Position Vergleich mit Spieler-Position und vektorieller Vergleich
    moveProjectile() {
        if(this.directionX < 0) this.x += this.baseSpeed * this.tear_speed * this.fracX;
        else this.x -= this.baseSpeed *this.tear_speed * this.fracX;

        if(this.directionY < 0) this.y += this.baseSpeed * this.tear_speed * this.fracY;
        else this.y -= this.baseSpeed * this.tear_speed * this.fracY;

    }

    //Jetzt - wann das erstellt wurde
    isExpired() {
        const hold = Date.now() - this.timestamp; //BUG FIX
        if(hold < 0) this.timestamp = Date.now() - this.lifespan; //BUG FIX
        return (Date.now() - this.timestamp) > this.lifespan;
    }

    //Hitbox Info
    getHitbox() {
        return {
            x: (this.x - this.sprite_correctionX/2 + 4) + 19,
            y: (this.y - this.sprite_correctionY/2 + 4) + 19,
            w: (this.sprite.WIDTH*STRETCH_FACTOR - 38) * this.variance,
            h: (this.sprite.HEIGHT*STRETCH_FACTOR - 38) * this.variance
        }
    }

    //Draw Funktion
    draw(ctx){
        ctx.drawImage(
            this.proj_img,
            0, 0, this.sprite.WIDTH, this.sprite.HEIGHT, //Ermittlung des richtigen Sprites
            this.x, this.y, //X & Y auf dem Canvas
            this.sprite.WIDTH*(STRETCH_FACTOR-1.5) * this.variance, this.sprite.HEIGHT*(STRETCH_FACTOR-1.5) * this.variance
        )
    }
}