class damageMessage {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.timestamp = Date.now();
        this.uptime = 1500;
        this.flyX = 1 - Math.random() * 2;
        this.flyY = 1 - Math.random() * 2;
    }

    isExpired() {
        const elapsed = Date.now() - this.timestamp;
        return elapsed > this.uptime;
    }

    update() {
        this.x += this.flyX;
        this.y += this.flyY;
    }

    draw(ctx) {
        ctx.fillStyle=`rgba(200, 200, 200, 0.4)`;
        ctx.font = "20px Minecraftia";
        ctx.fillText(`${this.damage}`, this.x, this.y);
    }
}