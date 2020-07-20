"use strict";
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

let isRunning;
const gameComponents = [];
const input = new Input();
const particles = new ParticleEngine();
const bullets = new ParticleEngine();
const asteroids = new ParticleEngine();
let player;
let lifeDisplay;
let score;
let scoreLabel;
let scoring;
let starSpawner;
let asteroidSpawner;
let collisions;

// defining assets

// defining custom components
class Player extends DrawableComponent {
  constructor() {
    const position = new Point(104, 240);
    const size = new Point(32, 32);
    const color = mainColor;
    const drawable = new Triangle(position, size, color);
    super(position, size, drawable);
    this.color = color;
    this.damping = 0.95;
    this.speed = 0.4;
    this.delta = new Point(0, -2);
    this.roll = 0;
    this.maxRoll = 14;
    this.rollGain = 1.2;
    this.rollLoss = 0.6;
    this.fireRate = 0.6;
    this.fireCooldown = 0;
    this.lives = 3;
    this.hitDelay = 10;
    this.hitCooldown = 10;
    this.collisionRect = new Rectangle(
      new Point(position.x - size.x / 2, position.y - size.y / 2),
      new Point(size.x, size.y - 12),
      "red"
    );
  }
  update() {
    this.handleInput();
    this.position.x += this.delta.x;
    this.position.y += this.delta.y;
    this.clampPosition();
    this.delta.x *= this.damping;
    this.delta.y *= this.damping;
    this.floorDelta();
    this.reduceRoll();
    this.coolDownGun();
    this.coolDownHit();
    this.setCollisionRectPosition();
  }
  setCollisionRectPosition() {
    const shipCenter = new Point(
      this.position.x + this.getApparentWidth() / 2,
      this.position.y + this.size.y / 2
    );
    const rectCenter = new Point(
      this.collisionRect.size.x / 2,
      this.collisionRect.size.y / 2
    );
    const position = new Point(
      shipCenter.x - rectCenter.x,
      shipCenter.y - rectCenter.y + 6
    );
    this.collisionRect.position = position;
    this.collisionRect.size.x = this.getApparentWidth() - 12;
  }
  reduceRoll() {
    if (this.roll > 0) {
      this.roll -= this.rollLoss;
    } else if (this.roll < 0) {
      this.roll += this.rollLoss;
    }
  }
  getXAxis() {
    return this.position.x + this.getApparentWidth() * 0.5;
  }
  getApparentWidth() {
    return this.size.x - this.getRelativeRoll();
  }
  getRelativeRoll() {
    return Math.sqrt(Math.pow(this.roll, 2));
  }
  getApparentColor() {
    if (this.hitCooldown > 0) {
      return this.blink();
    }
    const flipLightDir = false;
    const rollFactor = (flipLightDir ? this.roll : -this.roll) * 2.3;
    return shadeColor(mainColor(), rollFactor);
  }
  blink() {
    const blink = 40;
    return shadeColor(mainColor(), randomNumber(-blink, blink));
  }
  floorDelta() {
    let objectiveDeltaX = Math.sqrt(Math.pow(this.delta.x * 100, 2));
    let objectiveDeltaY = Math.sqrt(Math.pow(this.delta.y * 100, 2));
    if (objectiveDeltaX < 0.01) {
      this.delta.x = 0;
    }
    if (objectiveDeltaY < 0.01) {
      this.delta.y = 0;
    }
  }
  clampPosition() {
    const leftBound = 0;
    const rightBound = canvas.width;
    const topBound = 0;
    const bottomBound = canvas.height - this.size.y;
    const pushOffForce = this.speed + 1.2;

    if (this.position.x < leftBound) {
      this.delta.x += pushOffForce;
    } else if (this.position.x + this.getApparentWidth() > rightBound) {
      this.delta.x -= pushOffForce;
    }
    if (this.position.y < topBound) {
      this.delta.y += pushOffForce;
    } else if (this.position.y > bottomBound) {
      this.delta.y -= pushOffForce;
    }
  }
  handleInput() {
    if (input.isKeyPressed(input.keys.UP)) {
      this.delta.y -= this.speed;
    } else if (input.isKeyPressed(input.keys.DOWN)) {
      this.delta.y += this.speed;
    }
    if (input.isKeyPressed(input.keys.LEFT)) {
      this.delta.x -= this.speed;
      if (this.roll > -this.maxRoll) {
        this.roll -= this.rollGain;
      }
    } else if (input.isKeyPressed(input.keys.RIGHT)) {
      this.delta.x += this.speed;
      if (this.roll < this.maxRoll) {
        this.roll += this.rollGain;
      }
    }
    if (input.isKeyPressed(input.keys.Z)) {
      this.processShooting();
    }
  }
  processShooting() {
    if (this.fireCooldown <= 0) {
      this.shoot();
      this.fireCooldown = this.fireRate;
    }
  }
  shoot() {
    const bulletSize = new Point(3, 20);

    bullets.particles.push(
      new Bullet(
        new Point(
          this.position.x + this.size.x / 2 + bulletSize.x / 2,
          this.position.y - bulletSize.y
        ),
        bulletSize,
        new Point(0, -1),
        10
      )
    );
    bullets.particles.push(
      new Bullet(
        new Point(
          this.position.x + this.size.x / 2 - bulletSize.x,
          this.position.y - bulletSize.y
        ),
        bulletSize,
        new Point(0, -1),
        10
      )
    );
  }
  coolDownGun() {
    if (this.fireCooldown > 0) {
      this.fireCooldown -= 0.1;
    }
  }
  getHit() {
    if (this.hitCooldown <= 0) {
      this.loseLife();
      this.hitCooldown = this.hitDelay;
    }
  }
  loseLife() {
    if (this.lives > 0) {
      this.lives--;
    } else {
      console.log("game lost!");
    }
  }
  coolDownHit() {
    if (this.hitCooldown > 0) {
      this.hitCooldown -= 0.1;
    }
  }
  draw(context) {
    this.drawable.drawAtSizeColor(
      context,
      this.position,
      new Point(this.getApparentWidth(), this.size.y),
      this.getApparentColor()
    );
  }
}

class PlayerLifeDisplay extends GameComponent {
  constructor() {
    super();
    const position = new Point(20, 50);
    this.position = position;
    this.lifeSymbol = new Triangle(position, new Point(0, 0), mainColor());
  }
  update() {
    this.lifeSymbol.color = mainColor();
  }
  draw(context) {
    for (let i = 0; i < player.lives; i++) {
      this.lifeSymbol.drawAtSize(
        context,
        new Point(this.position.x + i * 20, this.position.y),
        new Point(16, 16)
      );
    }
  }
}

class Bullet extends Particle {
  constructor(position, size, direction, speed) {
    const color = mainColor();
    const drawable = new Rectangle(position, size, color);
    const lifespan = 100;
    super(position, size, drawable, lifespan);
    this.direction = direction;
    this.speed = speed;
    this.color = color;
  }
  update() {
    super.update();
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;
  }
  draw(context) {
    this.drawable.drawAtSizeColor(
      context,
      this.position,
      this.size,
      this.color
    );
  }
}

class Star extends Particle {
  constructor() {
    const thickness = randomNumber(1, 2);
    const speed = randomFloat(7, 20) + score * 0.0001;
    const size = new Point(thickness, speed);
    const position = new Point(randomNumber(0, canvas.width), -size.y);
    const brightness = randomNumber(0, 100);
    const color = shadeColor(mainColor(), brightness);
    const drawable = new Rectangle(position, size, color);
    const lifespan = 100;
    super(position, size, drawable, lifespan);
    this.speed = speed;
    this.color = color;
  }
  update() {
    super.update();
    this.position.y += this.speed;
  }
  draw(context) {
    this.drawable.drawAtSizeColor(
      context,
      this.position,
      this.size,
      this.color
    );
  }
}

class Asteroid extends Particle {
  constructor() {
    const speed = randomFloat(1, 2) + score * 0.0001;
    const dimension = randomNumber(20, 50);
    const size = new Point(dimension, dimension);
    const margin = dimension;
    const position = new Point(
      randomNumber(margin, canvas.width - margin),
      -size.y
    );
    const color = mainColor();
    const drawable = new Circle(position, size, color);
    const lifespan = 340 / speed;
    super(position, size, drawable, lifespan);
    this.speed = speed;
    this.color = color;
    this.face = "'w'";
    this.faceSize = this.size.x * 0.5;
    this.health = 5;
    this.collisionRect = new Rectangle(
      new Point(position.x - size.x / 2, position.y - size.y / 2),
      size,
      "red"
    );
  }
  update() {
    super.update();
    this.position.y += this.speed;
    this.collisionRect.position.y += this.speed;
  }
  getHit() {
    if (!this.isDead()) {
      if (this.health > 1) {
        scoring.increaseScore(10);
        this.health--;
      } else {
        scoring.increaseScore(100);
        super.remove();
      }
    }
  }
  draw(context) {
    this.drawable.drawAtSizeColor(
      context,
      this.position,
      this.size,
      this.color
    );
    drawString(
      this.face,
      this.position,
      "bold " + this.faceSize + "px Arial",
      bgColor(),
      "center"
    );
  }
}

class Spawner extends GameComponent {
  constructor(spawnDelay, minSpawned, maxSpawned, spawn) {
    super();
    this.spawnDelay = spawnDelay;
    this.time = 0;
    this.minSpawned = minSpawned;
    this.maxSpawned = maxSpawned;
    this.spawn = spawn;
  }
  update() {
    if (this.time >= this.spawnDelay) {
      const spawned = randomNumber(this.minSpawned, this.maxSpawned);
      for (let i = 0; i < spawned; i++) {
        this.spawn();
      }
      this.time = 0;
    } else {
      this.time++;
    }
  }
}

class CollisionHandler extends GameComponent {
  constructor() {
    super();
  }
  update() {
    this.bulletsAsteroids();
    this.playerAsteroids();
  }
  bulletsAsteroids() {
    for (let b = bullets.particles.length - 1; b >= 0; b--) {
      for (let a = asteroids.particles.length - 1; a >= 0; a--) {
        const bullet = bullets.particles[b];
        const asteroid = asteroids.particles[a];
        if (asteroid.collisionRect.contains(bullet.position)) {
          bullet.remove();
          asteroid.getHit();
        }
      }
    }
  }
  playerAsteroids() {
    for (let a = asteroids.particles.length - 1; a >= 0; a--) {
      const asteroid = asteroids.particles[a];
      if (Rectangle.intersects(player.collisionRect, asteroid.collisionRect)) {
        player.getHit();
      }
    }
  }
}

class Scoring extends GameComponent {
  constructor() {
    super();
  }
  update() {
    this.updateScoreDisplay();
  }
  increaseScore(value) {
    score += value;
  }
  updateScoreDisplay() {
    scoreLabel.text = score;
    scoreLabel.color = mainColor();
  }
}

const initialize = () => {
  gameComponents.push(particles);
  gameComponents.push(bullets);
  gameComponents.push(asteroids);
  player = new Player();
  gameComponents.push(player);
  score = 0;
  scoreLabel = new Label(
    score,
    new Point(20, 20),
    "bold 26px Arial",
    mainColor(),
    "left"
  );
  gameComponents.push(scoreLabel);
  scoring = new Scoring();
  gameComponents.push(scoring);
  lifeDisplay = new PlayerLifeDisplay();
  gameComponents.push(lifeDisplay);
  starSpawner = new Spawner(2, 1, 2, () =>
    particles.particles.push(new Star())
  );
  gameComponents.push(starSpawner);
  asteroidSpawner = new Spawner(40, 1, 1, () =>
    asteroids.particles.push(new Asteroid())
  );
  gameComponents.push(asteroidSpawner);
  collisions = new CollisionHandler();
  gameComponents.push(collisions);

  isRunning = true;
  requestAnimationFrame(gameLoop);
};

const gameLoop = () => {
  update();
  draw();
  if (isRunning) {
    requestAnimationFrame(gameLoop);
  }
};

const update = () => {
  removeDead(gameComponents);
  for (let i = 0; i < gameComponents.length; i++) {
    gameComponents[i].update();
  }
};

const draw = () => {
  clearContext();
  for (let i = 0; i < gameComponents.length; i++) {
    gameComponents[i].draw(context);
  }
};

const removeDead = (array) => {
  if (Array.isArray(array)) {
    for (let i = array.length - 1; i > -1; i--) {
      if (array[i].isDead) {
        console.log("removing dead " + array[i].toString());
        array.splice(i, 1);
      }
    }
  }
};

const clearContext = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = bgColor();
  context.fill();
};

const clamp = (number, min, max) => {
  return Math.min(Math.max(number, min), max);
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (+max + 1 - +min) + +min);
};

const randomFloat = (min, max) => {
  return Math.random() * (+max + 1 - +min) + +min;
};

const drawString = (text, position, font, color, align) => {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = "top";
  context.fillText(text, position.x, position.y);
};

// shadeColor function is from this answer on StackOverflow:
// https://stackoverflow.com/a/13532993/13352934
const shadeColor = (color, percent) => {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};

const mainColor = () => {
  return shadeColor("#00acff", 0);
};

const bgColor = () => {
  return shadeColor("#05364e", 0);
};

initialize();
