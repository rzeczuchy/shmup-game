"use strict";
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

let isRunning;
const gameComponents = [];
const input = new Input();
const particleEngine = new ParticleEngine();
let player;
let score;
let scoreLabel;
let starSpawner;

// defining assets
let playerTexture = new Image();
playerTexture.src = "images/placeholder.png";

// defining custom components
class Player extends DrawableComponent {
  constructor() {
    const startingPos = new Point(104, 240);
    const size = new Point(32, 32);
    const color = "#8f6fb2";
    const drawable = new Triangle(startingPos, size, color);
    super(startingPos, size, drawable);
    this.color = color;
    this.damping = 0.95;
    this.speed = 0.4;
    this.delta = new Point(0, -2);
    this.roll = 0;
    this.maxRoll = 14;
    this.rollGain = 1.2;
    this.rollLoss = 0.6;
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
    const flipLightDir = false;
    const rollFactor = (flipLightDir ? this.roll : -this.roll) * 2.3;
    return shadeColor(this.color, rollFactor);
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
    const pushOffForce = this.speed + 1.5;

    if (this.position.x < leftBound) {
      this.delta.x += this.speed * pushOffForce;
    } else if (this.position.x + this.getApparentWidth() > rightBound) {
      this.delta.x -= this.speed * pushOffForce;
    }
    if (this.position.y < topBound) {
      this.delta.y += this.speed * pushOffForce;
    } else if (this.position.y > bottomBound) {
      this.delta.y -= this.speed * pushOffForce;
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

class Star extends Particle {
  constructor() {
    const position = new Point(10, 10);
    const size = new Point(10, 10);
    const color = "#ffffff";
    const drawable = new Rectangle(position, size, color);
    const lifespan = 100;
    super(position, size, drawable, lifespan);
  }
  update() {
    super.update();
    this.position.y++;
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

class StarSpawner extends GameComponent {
  constructor() {
    super();
    this.spawnDelay = 10;
    this.time = 0;
  }
  update() {
    if (this.time >= this.spawnDelay) {
      particleEngine.particles.push(new Star());
      this.time = 0;
    } else {
      this.time++;
    }
  }
}

const initialize = () => {
  gameComponents.push(particleEngine);
  playerTexture = new Image();
  playerTexture.src = "images/img1.png";
  player = new Player();
  gameComponents.push(player);
  score = 0;
  scoreLabel = new Label(
    score,
    new Point(20, 20),
    "bold 26px Arial",
    "white",
    "left"
  );
  gameComponents.push(scoreLabel);
  starSpawner = new StarSpawner();
  gameComponents.push(starSpawner);

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
};

const clamp = (number, min, max) => {
  return Math.min(Math.max(number, min), max);
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (+max + 1 - +min) + +min);
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

initialize();
