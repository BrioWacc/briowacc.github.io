const game = new Game(canvas);

game.setupEventListeners();
ctx.imageSmoothingEnabled = false;

function animate(timestamp) {
    const elapsed = timestamp - lastTimestamp;

    if (elapsed > frameTime) {
        game.render(ctx);
        lastTimestamp = timestamp - (elapsed % frameTime);
    }

    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
