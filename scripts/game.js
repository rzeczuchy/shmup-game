"use strict";
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let isRunning;
let gameComponents = [];
let player;

// defining assets
let playerTexture = new Image();
playerTexture.src = "images/placeholder.png";

class Player extends DrawableComponent {
  constructor(position, texture, size) {
    super(new Sprite(position, texture, size));
  }
}

const initialize = () => {
  playerTexture = new Image();
  playerTexture.src = "images/placeholder.png";
  player = new Player(new Point(100, 20), playerTexture, new Point(50, 50));
  gameComponents.push(player);

  gameComponents.push(
    new DrawableComponent(
      new Rectangle(new Point(20, 20), new Point(20, 20), "blue")
    )
  );

  gameComponents.push(new DrawableComponent(new Point(50, 20, "yellow")));

  gameComponents.push(
    new DrawableComponent(new Circle(new Point(80, 30), 10, "red"))
  );

  let isRunning = true;
  requestAnimationFrame(gameLoop);
};

const gameLoop = () => {
  update();
  draw();
  if (isRunning) {
    setTimeout(() => {
      requestAnimationFrame(gameLoop);
    }, 1000 / 60);
  }
};

const update = () => {
  removeDead(gameComponents);

  for (let i = 0; i < gameComponents.length; i++) {
    gameComponents[i].update();
  }
};

const draw = () => {
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

initialize();
