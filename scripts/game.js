"use strict";
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
let isRunning;
let gameComponents = [];
let player;

// handling input
const keyMappings = [];
const Keys = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
};
Object.freeze(Keys);

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
window.addEventListener(
  "keydown",
  (e) => {
    if (
      [Keys.SPACE, Keys.UP, Keys.DOWN, Keys.LEFT, Keys.RIGHT].indexOf(
        e.keyCode
      ) > -1
    ) {
      e.preventDefault();
    }
  },
  false
);

function keyDown(e) {
  keyMappings[e.keyCode] = true;
}

function keyUp(e) {
  keyMappings[e.keyCode] = false;
}

// defining assets
let playerTexture = new Image();
playerTexture.src = "images/placeholder.png";

class Player extends DrawableComponent {
  constructor(position, size, texture) {
    super(position, size, new Sprite(texture, position, size));
    this.damping = 0.95;
    this.speed = 0.5;
    this.delta = new Point(0, -2);
  }
  update() {
    this.handleInput();
    this.position.x += this.delta.x;
    this.position.y += this.delta.y;
    this.delta.x *= this.damping;
    this.delta.y *= this.damping;
  }
  handleInput() {
    if (keyMappings[Keys.UP]) {
      this.delta.y -= this.speed;
    } else if (keyMappings[Keys.DOWN]) {
      this.delta.y += this.speed;
    }
    if (keyMappings[Keys.LEFT]) {
      this.delta.x -= this.speed;
    } else if (keyMappings[Keys.RIGHT]) {
      this.delta.x += this.speed;
    }
  }
}

const initialize = () => {
  playerTexture = new Image();
  playerTexture.src = "images/placeholder.png";
  player = new Player(new Point(100, 100), new Point(50, 50), playerTexture);
  gameComponents.push(player);

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
