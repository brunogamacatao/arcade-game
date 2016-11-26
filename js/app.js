/* app.js
 * This file implements the entities responsible for the game logic.
 * The game is a frogger-like, where a player have to cross the scenario 
 * avoiding hitting a vehicle, in this case a bug.
 */

// Those are some constants 
var NUM_ROWS     = 6;
var NUM_COLS     = 5;
var BLOCK_WIDTH  = 101;
var BLOCK_HEIGHT = 83;
var MAX_ENEMIES  = 6;

var score = 0; // The game score
var gameover = false; // This flag indicates if the game is on gameover state

// This is a class which displays a score text
var ScoreUI = function() {
    this.x = 10;
    this.y = 90;
    this.font = "30px Verdana";
};

// A score is rendered with a fancy gradient in the screen's top left corner.
ScoreUI.prototype.render = function() {
    var gradient = ctx.createLinearGradient(0, 0, 100, 0);

    gradient.addColorStop("0", "orange");
    gradient.addColorStop("0.5", "red");
    gradient.addColorStop("1.0", "yellow");

    // Fill with gradient
    ctx.font = this.font;
    ctx.fillStyle = gradient;
    ctx.fillText("Score: " + score, this.x, this.y);
};

/* This is the implementation of a Congratulations animation, which is displayed
 * whenever the user crosses successfully the scenario.
 */
var Congratulations = function() {
    this.sprite = 'images/congratulations.png';
    this.x = 56;
    this.y = 189;
    this.alpha = 0;
    this.speed = 1;
    this.running = false;
};

// This method shows the congratulations animation
Congratulations.prototype.show = function() {
    this.running = true;
};

// An animated entity, should be updated by the loop engine
Congratulations.prototype.update = function(dt) {
    if (this.running) {
        this.alpha += dt * this.speed;

        if (this.alpha > 1) {
            this.speed = -this.speed;
        } else if (this.alpha <= 0) {
            this.alpha = 0;
            this.speed = -this.speed;
            this.running = false;
        }
    }
};

// This method renders the congratulations animation
Congratulations.prototype.render = function() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.restore();
};

// This class implements a Game Over display
var GameOver = function(createEnemies) {
    this.sprite = 'images/game-over.png';
    this.x = 58;
    this.y = 146;
    this.font = "30px Verdana";
    this.createEnemies = createEnemies;
};

GameOver.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    var gradient = ctx.createLinearGradient(65, 0, 500, 0);

    gradient.addColorStop("0", "black");
    gradient.addColorStop("0.5", "red");
    gradient.addColorStop("1.0", "blue");

    // Fill with gradient
    ctx.font = this.font;
    ctx.fillStyle = gradient;

    ctx.fillText("Press Enter to play again", 65, 480);
};

/* The game over display accepts user input. When the user press 'ENTER' the
 * game is restarted.
 */
GameOver.prototype.handleInput = function(keycode) {
    if (keycode == 'enter') {
        score = 0;
        gameover = false;
        this.createEnemies();
    }
};

/* This is the implementation of a utility Rectangle class, it is used to
 * calculate collisions among player and enemies.
 */
var Rectangle = function(x, y, width, height) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
};

// This method implements the collision test between two rectangles.
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

// Whenever the player succeeds, the dificulty is increased
Enemy.prototype.increaseDificulty = function() {
    this.speed += 5;
};

// Our player
var Player = function() {
    this.sprite  = 'images/char-boy.png';
    this.offsetX = 16;
    this.offsetY = 30;
    this.width   = 70;
    this.height  = 70;
    this.reset();
};

// This method places the player on its starting position
Player.prototype.reset = function() {
    // Set the player starting point (horizontally centered at the last row)
    this.x = Math.floor(NUM_COLS / 2) * BLOCK_WIDTH;
    this.y = (NUM_ROWS - 1) * BLOCK_HEIGHT - this.offsetY;
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);  
};

// This method implements the player motion according to user input
Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case 'left':
            // Won't go beyond left border
            if (this.x > 0) {
                this.x -= BLOCK_WIDTH;
            }
            break;
        case 'right':
            // Won't go beyond right border
            if (this.x < (NUM_COLS - 1) * BLOCK_WIDTH) {
                this.x += BLOCK_WIDTH;
            }
            break;
        case 'up':
            // Won't go beyond top border
            if (this.y > 0) {
                this.y -= BLOCK_HEIGHT;
            }
            break;
        case 'down':
            // Won't go beyond bottom border
            if (this.y < ((NUM_ROWS - 1) * BLOCK_HEIGHT) - this.offsetY) {
                this.y += BLOCK_HEIGHT;
            }
            break;
    }
};

Player.prototype.getRect = function() {
    return new Rectangle(this.x + this.offsetX, this.y, this.width, this.height);
};

// This method checks the collision between player and an enemy
Player.prototype.collidesWith = function(enemy) {
    return this.getRect().collides(enemy.getRect());
};

// This method checks if the player hits the water (it's goal)
Player.prototype.hitsWater = function() {
    return this.y <= 0;
};

// Object instantiation
var allEnemies = [];

/* The enemy creation has a random logic. This method is called whenever the 
 * game is restarted.
 */
var createEnemies = function() {
    allEnemies = [];

    for (var i = 0; i < MAX_ENEMIES; i++) {
        var speed    = 20 + Math.floor(Math.random() * 50);
        var row      = Math.floor(Math.random() * 3) + 1;
        var initialX = (Math.floor(Math.random() * 2) + 1) * -BLOCK_WIDTH;
        allEnemies.push(new Enemy(speed, row, initialX));
    }
};

createEnemies();

var player = new Player();
var scoreUI = new ScoreUI();
var congratulations = new Congratulations();
var gameoverUI = new GameOver(createEnemies);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };

    if (gameover) {
        gameoverUI.handleInput(allowedKeys[e.keyCode]);
    } else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
