var NUM_ROWS = 6;
var NUM_COLS = 5;
var BLOCK_WIDTH = 101;
var BLOCK_HEIGHT = 83;

var Rectangle = function(x, y, width, height) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
};

Rectangle.prototype.collides = function(other) {
    return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.height + this.y > other.y);
};

// Enemies our player must avoid
var Enemy = function(speed, row, initialX) {
    this.sprite   = 'images/enemy-bug.png';
    this.speed    = speed;
    this.offsetY  = 20;
    this.x        = initialX;
    this.y        = BLOCK_HEIGHT * row - this.offsetY;
    this.initialX = initialX;
    this.width    = BLOCK_WIDTH;
    this.height   = 70;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += dt * this.speed;
    if (this.x > (BLOCK_WIDTH * NUM_COLS)) {
        this.x = this.initialX;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.getRect = function() {
    return new Rectangle(this.x, this.y, this.width, this.height);
};

var Player = function() {
    this.sprite  = 'images/char-boy.png';
    this.offsetX = 16;
    this.offsetY = 30;
    this.width   = 70;
    this.height  = 70;
    this.reset();
};

Player.prototype.reset = function() {
    // Set the player starting point (horizontally centered at the last row)
    this.x = Math.floor(NUM_COLS / 2) * BLOCK_WIDTH;
    this.y = (NUM_ROWS - 1) * BLOCK_HEIGHT - this.offsetY;
};

Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);  
};

Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case 'left':
            if (this.x > 0) {
                this.x -= BLOCK_WIDTH;
            }
            break;
        case 'right':
            if (this.x < (NUM_COLS - 1) * BLOCK_WIDTH) {
                this.x += BLOCK_WIDTH;
            }
            break;
        case 'up':
            if (this.y > 0) {
                this.y -= BLOCK_HEIGHT;
            }
            break;
        case 'down':
            if (this.y < ((NUM_ROWS - 1) * BLOCK_HEIGHT) - this.offsetY) {
                this.y += BLOCK_HEIGHT;
            }
            break;
    }
};

Player.prototype.getRect = function() {
    return new Rectangle(this.x + this.offsetX, this.y, this.width, this.height);
};

Player.prototype.collidesWith = function(enemy) {
    return this.getRect().collides(enemy.getRect());
};

Player.prototype.hitsWater = function() {
    return this.y <= 0;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];

for (var i = 0; i < 6; i++) {
    var speed    = 20 + Math.floor(Math.random() * 20);
    var row      = Math.floor(Math.random() * 3) + 1;
    var initialX = (Math.floor(Math.random() * 4) + 1) * -BLOCK_WIDTH;
    allEnemies.push(new Enemy(speed, row, initialX));
}

var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
