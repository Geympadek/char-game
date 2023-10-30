var gameObjects = {};

gameObjects["border-up"] = new Border(new Collider([0, -10, pixelWidth * coordPerPixel, 0], {x:0, y:0}, 1), null);
gameObjects["border-down"] = new Border(new Collider([0, pixelHeight * coordPerPixel,   pixelWidth * coordPerPixel, pixelHeight * coordPerPixel + 10], {x:0, y:0}, 1), null);
gameObjects["border-left"] = new Border(new Collider([-10, 0,    0, pixelHeight * coordPerPixel], {x:0, y:0}, 1), null);
gameObjects["border-right"] = new Border(new Collider([pixelWidth * coordPerPixel, 0,    pixelWidth * coordPerPixel, pixelHeight * coordPerPixel + 10], {x:0, y:0}, 1), null);

gameObjects["rocket"] = new Rocket(
    new Collider([-1, -1, 1, 1], {x: 0, y:0}, 6),
    new Sprite([0,2, 0.5,1, 0.5,2,     0,0, 0.5,0, 0.5,1,      0.5,0, 3,0, 0.5,2,      3,0, 3,2, 0.5,2,  3,0, 4,1, 3,2], {x:0, y:0}, 2.9, 0)
);
gameObjects["rocket"].position = Object.create(center);
gameObjects["rocket"].position.y += 10;
gameObjects["rocket"].scale = 1;

gameObjects["projectile"] = new Projectile(
    new Collider([-1, -1, 1, 1], {x:0, y:0}, 2.5),
    new Sprite([0.5,0, 0,0.87, 1,0.87], {x:0, y:0}, 5, 0)
)
gameObjects["projectile"].position = {x: center.x, y: center.y};
gameObjects["projectile"].scale = 1;
gameObjects["projectile"].xSpeed = 0.75;
gameObjects["projectile"].ySpeed = 0.56;

gameObjects["projectile2"] = new Projectile(
    new Collider([-1, -1, 1, 1], {x:0, y:0}, 2.5),
    new Sprite([0.5,0, 0,0.87, 1,0.87], {x:0, y:0}, 5, 0)
);
gameObjects["projectile2"].position = {x: 10, y: 10};
gameObjects["projectile2"].xSpeed = 0.93;
gameObjects["projectile2"].ySpeed = 0.69;


var deltaTime = 0;
function handleInput()
{
    let rocketSpeed = 3.5 * deltaTime / 100;
    let rotationSpeed = 6 * deltaTime / 100;

    if (player.input.up)
    {
        gameObjects["rocket"].position.x += Math.cos((gameObjects["rocket"].rotation) * DEG_TO_RADIANS) * rocketSpeed;
        gameObjects["rocket"].position.y += Math.sin((gameObjects["rocket"].rotation) * DEG_TO_RADIANS) * rocketSpeed;
    }
    if (player.input.down)
    {
        gameObjects["rocket"].position.x -= Math.cos((gameObjects["rocket"].rotation) * DEG_TO_RADIANS) * rocketSpeed;
        gameObjects["rocket"].position.y -= Math.sin((gameObjects["rocket"].rotation) * DEG_TO_RADIANS) * rocketSpeed;
    }

    if (player.input.left)
    {
        gameObjects["rocket"].rotation -= rotationSpeed;
    }
    if (player.input.right)
    {
        gameObjects["rocket"].rotation += rotationSpeed;
    }

    if (player.input.fire)
    {
        gameObjects["rocket"].getRealCollider().visualize();
    }
}

let timer = Date.now();
function loop()
{
    deltaTime = Date.now() - timer;
    timer = Date.now();

    clearScreen();

    handleInput();

    gameObjects["projectile"].move();
    gameObjects["projectile2"].move();
    
    checkCollision(gameObjects);
    drawObjects(gameObjects);

    pixelsToScreen();
    document.getElementById("screen").innerHTML = screenOutput;
    setTimeout(loop, 0);
}
loop();