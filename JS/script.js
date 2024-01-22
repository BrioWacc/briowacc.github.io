const game = new Game(canvas);

game.setupEventListeners();
ctx.imageSmoothingEnabled = false;

function animate(){
    game.render(ctx);
    window.requestAnimationFrame(animate);
};
animate();
