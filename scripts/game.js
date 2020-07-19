"use strict";
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

let isRunning;
const gameComponents = [];
const input = new Input();
let player;
let score;
let scoreLabel;

// defining assets
let playerTexture = new Image();
playerTexture.src = "images/placeholder.png";

class Player extends DrawableComponent {
  constructor(position, size, texture) {
    super(position, size, new Triangle(position, size, "#30f"));
    this.damping = 0.95;
    this.speed = 0.5;
    this.delta = new Point(0, -2);
  }
  update() {
    this.handleInput();
    this.position.x += this.delta.x;
    this.position.y += this.delta.y;
    this.clampPosition();
    this.delta.x *= this.damping;
    this.delta.y *= this.damping;
  }
  clampPosition() {
    const leftBound = 0;
    const rightBound = canvas.width - this.size.x;
    const topBound = 0;
    const bottomBound = canvas.height - this.size.y;

    if (this.position.x < leftBound && this.delta.x < 0) {
      this.delta.x = 0;
    } else if (this.position.x > rightBound && this.delta.x > 0) {
      this.delta.x = 0;
    }
    if (this.position.y < topBound && this.delta.y < 0) {
      this.delta.y = 0;
    } else if (this.position.y > bottomBound && this.delta.y > 0) {
      this.delta.y = 0;
    }

    this.position.x = clamp(this.position.x, leftBound, rightBound);
    this.position.y = clamp(this.position.y, topBound, bottomBound);
  }
  handleInput() {
    if (input.isKeyPressed(input.keys.UP)) {
      this.delta.y -= this.speed;
    } else if (input.isKeyPressed(input.keys.DOWN)) {
      this.delta.y += this.speed;
    }
    if (input.isKeyPressed(input.keys.LEFT)) {
      this.delta.x -= this.speed;
    } else if (input.isKeyPressed(input.keys.RIGHT)) {
      this.delta.x += this.speed;
    }
  }
}

const initialize = () => {
  playerTexture = new Image();
  playerTexture.src = "images/img1.png";
  player = new Player(new Point(100, 300), new Point(100, 100), playerTexture);
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

initialize();
