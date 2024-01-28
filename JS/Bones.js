class Bones {
    constructor(player) {
        this.type = player.stats.tear_type;
        this.timestamp = Date.now();
        this.lifespan = 1000 + player.stats.tear_long;
        this.tear_speed = player.stats.tear_speed;
        this.baseSpeed = 2;
        this.damage = 10 * player.stats.damage * (0.9 + Math.random() * 0.2);
        this.persistence = player.stats.tear_persistence;
        this.size=player.stats.tear_size;
        this.x = player.state.x;
        this.y = player.state.y;

        this.sprite = {
            sprite_number: 0, //+1 RED,+2 BLU,+3 YEL,+4 GRE
            sprite_offset: 0,
            WIDTH: 0,
            HEIGHT: 5
        }

        //Welches Sheet/Charakteristiken basierend auf DMG
        this.selectSheet();
        //Welche Bone Art
        this.selectSprite();
        //Winkel Mathematik
        this.angleMath();

        //Verschiebung aufs Zentrum, wichtig fürs zeichnen, durch trial and error optimiert
        this.sprite_correctionX=(this.sprite.WIDTH * STRETCH_FACTOR)/2.25;
        this.sprite_correctionY=(this.sprite.HEIGHT * STRETCH_FACTOR)/2.25;
    }

    selectSheet() {
        this.sprite_sheet = new Image();
        if(this.damage <= 70) {
            this.sprite_sheet.src="Sprites/BONES/bonesSmall.png";
            this.sprite.sprite_offset=8;
            this.sprite.WIDTH=8;
        }
        else {
            this.sprite_sheet.src="Sprites/BONES/bonesBig.png";
            this.sprite.sprite_offset=9;
            this.sprite.WIDTH=9;
        }
    }

    selectSprite() {
        if(this.type === tearTypes.normal.string) this.sprite.sprite_number=0;
        else if (this.type === tearTypes.red.string) this.sprite.sprite_number=1;
        else if (this.type === tearTypes.blue.string) this.sprite.sprite_number=2;
        else if (this.type === tearTypes.yellow.string) this.sprite.sprite_number=3;
        else if (this.type === tearTypes.green.string) this.sprite.sprite_number=4;
    }

    angleMath() {
        //Vergleich mit dem Spieler
        this.directionX=this.x-mousePos.clientX //wenn kleiner 0 -> Maus links von Spieler
        this.directionY=this.y-mousePos.clientY //wenn kleiner 0 -> Maus ueber Spieler

        this.diffX=Math.abs(this.directionX);
        this.diffY=Math.abs(this.directionY);

        //Winkel Anteil jeweiliger X Y Koordinate
        this.fracX=this.diffX/(this.diffX+this.diffY);
        this.fracY=1 - this.fracX;

        //Berechnung des Winkels für rotation
        this.angle = Math.atan2(this.directionY, this.directionX);
    }

    //Mauszeiger Position Vergleich mit Spieler-Position und vektorieller Vergleich
    moveBone() {
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
        if(this.fracX >= this.fracY)
            return {
                x: this.x - this.sprite_correctionX*this.size,
                y: this.y - this.sprite_correctionY*this.size,
                w: this.sprite.WIDTH*STRETCH_FACTOR*this.size,
                h: this.sprite.HEIGHT*STRETCH_FACTOR*this.size
            }
        else
            return {
                x: this.x - this.sprite_correctionY*this.size,
                y: this.y - this.sprite_correctionX*this.size,
                w: this.sprite.HEIGHT*STRETCH_FACTOR*this.size,
                h: this.sprite.WIDTH*STRETCH_FACTOR*this.size
            }
    }

    //Draw Funktion
    draw(ctx){
        //setzung
        ctx.save();

        ctx.translate(this.x, this.y);

        ctx.rotate(this.angle);

        ctx.drawImage(
            this.sprite_sheet,
            this.sprite.sprite_offset * this.sprite.sprite_number, 0, this.sprite.WIDTH, this.sprite.HEIGHT, //Ermittlung des richtigen Sprites
            -this.sprite_correctionX*this.size, -this.sprite_correctionY*this.size, //X & Y auf dem Canvas
            this.sprite.WIDTH*STRETCH_FACTOR*this.size, this.sprite.HEIGHT*STRETCH_FACTOR*this.size)

        ctx.restore();
    }
}