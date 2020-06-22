"use strict";

let isRunning = true;

const update = () => {};

const draw = () => {};

const gameLoop = () => {
  update();
  draw();
  if (isRunning) {
    setTimeout(() => {
      requestAnimationFrame(gameLoop);
    }, 1000 / 60);
  }
};
requestAnimationFrame(gameLoop);
