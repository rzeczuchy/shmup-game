"use strict";

class Drawable {
  constructor() {}
  draw() {}
  drawAt() {}
}

class Point extends Drawable {
  constructor(x, y, color) {
    super();
    this.x = x;
    this.y = y;
    this.color = color;
  }
  draw(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 1, 1);
    context.fill();
  }
  drawAt(context, position) {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(position.x, position.y, 1, 1);
    context.fill();
  }
  static distance(a, b) {
    let xDist = Math.pow(a.x - b.x, 2);
    let yDist = Math.pow(a.y - b.y, 2);
    return Math.sqrt(xDist + yDist);
  }
}

class Rectangle extends Drawable {
  constructor(position, size, color) {
    super();
    this.position = position;
    this.size = size;
    this.color = color;
  }
  draw(context) {
    drawAt(context, this.position);
  }
  drawAt(context, position) {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(position.x, position.y, this.size.x, this.size.y);
    context.fill();
  }
  contains(point) {
    return (
      point.x >= this.position.x &&
      point.x <= this.position.x + this.size.x &&
      point.y >= this.position.y &&
      point.y <= this.position.y + this.size.y
    );
  }
  static intersects(rectA, rectB) {
    if (
      rectA.position.x > rectB.position.x + rectB.size.x ||
      rectB.position.x > rectA.position.x + rectA.size.x
    ) {
      return false;
    }
    if (
      rectA.position.y > rectB.position.y + rectB.size.y ||
      rectB.position.y > rectA.position.y + rectA.size.y
    ) {
      return false;
    }
    return true;
  }
}

class Circle extends Drawable {
  constructor(position, radius, color) {
    super();
    this.position = position;
    this.radius = radius;
    this.color = color;
  }
  draw(context) {
    drawAt(context, this.position);
  }
  drawAt(context, position) {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(position.x, position.y, this.radius, 0, 2 * Math.PI);
    context.fill();
  }
  contains(circ, point) {
    return (
      calculateDistance(this.position.x, this.position.y, point.x, point.y) <=
      circ.radius
    );
  }
  static intersects(circA, circB) {
    return (
      Point.distance(circA.position, circB.position) <=
      circA.radius + circB.radius
    );
  }
}

class Sprite extends Drawable {
  constructor(image, position, size) {
    super();
    this.image = image;
    this.position = position;
    this.size = size;
  }
  draw(context) {
    drawAt(context, this.position);
  }
  drawAt(context, position) {
    context.drawImage(
      this.image,
      position.x,
      position.y,
      this.size.x,
      this.size.y
    );
  }
}

class GameComponent {
  constructor() {}
  update() {}
  draw() {}
}

class DrawableComponent extends GameComponent {
  constructor(position, size, drawable) {
    super();
    this.position = position;
    this.size = size;
    this.drawable = drawable;
  }
  draw(context) {
    this.drawable.drawAt(context, this.position);
  }
}

class Input {
  constructor() {
    this.keyMappings = [];
    this.keyDown = (e) => {
      this.keyMappings[e.keyCode] = true;
    };
    this.keyUp = (e) => {
      this.keyMappings[e.keyCode] = false;
    };

    document.addEventListener("keydown", this.keyDown, false);
    document.addEventListener("keyup", this.keyUp, false);
    window.addEventListener(
      "keydown",
      (e) => {
        if (
          [
            this.Keys.SPACE,
            this.Keys.UP,
            this.Keys.DOWN,
            this.Keys.LEFT,
            this.Keys.RIGHT,
          ].indexOf(e.keyCode) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );

    this.Keys = {
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      SPACE: 32,
    };
    Object.freeze(this.Keys);
  }
  isKeyPressed(key) {
    return this.keyMappings[key];
  }
}
