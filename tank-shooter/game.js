const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game state
let score = 0;
let gameOver = false;
let animationId;

// Input handling
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    " ": false
};

window.addEventListener('keydown', (e) => {
    // Handle both lower and upper case for WASD
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
    if (e.key === ' ' && !gameOver) {
        player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

// Add click listener for shooting
canvas.addEventListener('mousedown', (e) => {
    if (!gameOver) {
        player.shoot();
    }
});

// Classes
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.color = '#0f0';
        this.angle = 0; // For future rotation if needed, currently 4-way movement
    }

    update() {
        if ((keys.ArrowUp || keys.w) && this.y > 0) {
            this.y -= this.speed;
            this.angle = -Math.PI / 2;
        }
        if ((keys.ArrowDown || keys.s) && this.y + this.height < canvas.height) {
            this.y += this.speed;
            this.angle = Math.PI / 2;
        }
        if ((keys.ArrowLeft || keys.a) && this.x > 0) {
            this.x -= this.speed;
            this.angle = Math.PI;
        }
        if ((keys.ArrowRight || keys.d) && this.x + this.width < canvas.width) {
            this.x += this.speed;
            this.angle = 0;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        // Draw tank body
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw turret (simple direction indicator)
        ctx.fillStyle = '#0a0';
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Default turret facing up if not moving or last moved direction?
        // For simplicity, let's make the tank always face up for shooting or track mouse.
        // Actually, simple tank games often just shoot in the direction moving or always up.
        // Let's implement shooting upwards for simplicity, or we can add mouse tracking.
        // Let's make it shoot always up for "Space Invaders" style or in direction of movement?
        // Let's go with: shoots in the direction of last movement or default Up.

        // Actually, let's keep it simple: Tank moves X/Y, shoots UP.
        // Or better: Shoots towards mouse? No, keyboard only is requested "Arrow Keys or WASD".
        // Let's shoot UP always for this simple version, creating a vertical shooter feel?
        // No, "Tank Shooter" usually implies top-down free roam.
        // Let's make it shoot in the last moved direction.
    }

    shoot() {
        // Shoot in the current "facing" direction would be ideal, but for this simple version,
        // let's just shoot "UP" as a standard shooter, OR towards the top of the screen.
        // Let's stick to shooting UP for simplicity of gameplay mechanics (like Galaga/1942 but with free movement)
        // OR free movement + shooting in direction of movement.

        // Let's implement shooting UP.
        bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y, 0, -7));
    }
}

class Bullet {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.dx = dx;
        this.dy = dy;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height; // Start above screen
        this.speed = Math.random() * 2 + 1;
        this.color = '#f00';
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.markedForDeletion = true;
            // Maybe lose a life or game over if enemy passes?
            // For now, just remove it.
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw some details to look like a tank
        ctx.fillStyle = '#a00';
        ctx.fillRect(this.x + 10, this.y + 10, 20, 20);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.color = `hsl(${Math.random() * 60 + 10}, 100%, 50%)`; // Fire colors
        this.life = 20;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Game Objects
let player = new Player(canvas.width / 2 - 20, canvas.height - 60);
let bullets = [];
let enemies = [];
let particles = [];
let enemyTimer = 0;
let enemyInterval = 60; // Spawn new enemy every 60 frames (approx 1 sec)

// Utility functions
function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
}

function createExplosion(x, y) {
    for(let i=0; i<10; i++){
        particles.push(new Particle(x, y));
    }
}

function restartGame() {
    player = new Player(canvas.width / 2 - 20, canvas.height - 60);
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerText = 'Score: ' + score;
    gameOver = false;
    animate();
}

// Main Loop
function animate() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);

        // Allow restart
        if (keys[' ']) {
             restartGame();
        } else {
             animationId = requestAnimationFrame(animate);
        }
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Player
    player.update();
    player.draw();

    // Update Bullets
    bullets.forEach(bullet => {
        bullet.update();
        bullet.draw();
    });
    bullets = bullets.filter(b => !b.markedForDeletion);

    // Update Enemies
    enemyTimer++;
    if (enemyTimer > enemyInterval) {
        enemies.push(new Enemy());
        enemyTimer = 0;
    }

    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();

        // Collision Bullet-Enemy
        bullets.forEach(bullet => {
            if (!bullet.markedForDeletion && !enemy.markedForDeletion && rectIntersect(bullet, enemy)) {
                bullet.markedForDeletion = true;
                enemy.markedForDeletion = true;
                score += 10;
                scoreElement.innerText = 'Score: ' + score;
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);

                // Increase difficulty every 100 points
                if (score > 0 && score % 100 === 0 && enemyInterval > 20) {
                    enemyInterval -= 5;
                }
            }
        });

        // Collision Enemy-Player
        if (rectIntersect(player, enemy)) {
            gameOver = true;
            createExplosion(player.x + player.width/2, player.y + player.height/2);
        }
    });
    enemies = enemies.filter(e => !e.markedForDeletion);

    // Update Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    particles = particles.filter(p => p.life > 0);

    animationId = requestAnimationFrame(animate);
}

// Start game
animate();
