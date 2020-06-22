"use strict";

class Drawable {
  constructor() {}
  draw() {}
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
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );
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
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
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
  constructor(position, image, size) {
    super();
    this.position = position;
    this.image = image;
    this.size = size;
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );
  }
}

class GameComponent {
  constructor() {}
  update() {}
}

class DrawableComponent extends GameComponent {
  constructor(drawable) {
    super();
    this.drawable = drawable;
  }
  draw(context) {
    this.drawable.draw(context);
  }
}
