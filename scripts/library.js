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
  drawAtSize(context, position, size) {
    this.drawAt(context, position);
  }
  drawAtSizeColor(context, position, size, color) {
    this.drawAtColor(context, position, color);
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
    this.drawAt(context, this.position);
  }
  drawAt(context, position) {
    this.drawAtSize(context, position, this.size);
  }
  drawAtSize(context, position, size) {
    this.drawAtSizeColor(context, position, size, this.color);
  }
  drawAtSizeColor(context, position, size, color) {
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(position.x, position.y, size.x, size.y);
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

class Triangle extends Drawable {
  constructor(position, size, color) {
    super();
    this.position = position;
    this.size = size;
    this.color = color;
  }
  draw(context) {
    this.drawAt(context, this.position);
  }
  drawAt(context, position) {
    this.drawAtSize(context, position, this.size);
  }
  drawAtSize(context, position, size) {
    this.drawAtSizeColor(context, position, size, this.color);
  }
  drawAtSizeColor(context, position, size, color) {
    context.beginPath();
    context.moveTo(position.x + size.x / 2, position.y);
    context.lineTo(position.x + size.x, position.y + size.y);
    context.lineTo(position.x, position.y + size.y);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  }
}

class Circle extends Drawable {
  constructor(position, radius, color) {
    super();
    this.position = position;
    this.size = new Point(radius, radius);
    this.color = color;
  }
  draw(context) {
    drawAt(context, this.position);
  }
  drawAt(context, position) {
    this.drawAtSize(context, position, this.size.x / 2);
  }
  drawAtSize(context, position, size) {
    this.drawAtSizeColor(context, position, radius, this.color);
  }
  drawAtSizeColor(context, position, size, color) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(position.x, position.y, size.x / 2, 0, 2 * Math.PI);
    context.fill();
  }
  contains(point) {
    return (
      calculateDistance(this.position.x, this.position.y, point.x, point.y) <=
      this.size.x / 2
    );
  }
  static intersects(circA, circB) {
    return (
      Point.distance(circA.position, circB.position) <=
      circA.size.x / 2 + circB.size.x / 2
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
    this.drawAt(context, this.position);
  }
  drawAt(context, position) {
    this.drawAtSize(context, position, this.size);
  }
  drawAtSize(context, position, size) {
    context.drawImage(this.image, position.x, position.y, size.x, size.y);
  }
  drawAtSizeColor(context, position, size, color) {
    this.drawAtSize(context, position, size);
  }
}

class GameComponent {
  constructor() {}
  update() {}
  draw(context) {}
}

class DrawableComponent extends GameComponent {
  constructor(position, size, drawable) {
    super();
    this.position = position;
    this.size = size;
    this.drawable = drawable;
  }
  draw(context) {
    this.drawable.drawAtSize(context, this.position, this.size);
  }
}

class Label extends DrawableComponent {
  constructor(text, position, font, color, align) {
    super(position, new Point(0, 0), null);
    this.text = text;
    this.font = font;
    this.color = color;
    this.align = align;
  }
  draw(context) {
    context.font = this.font;
    context.fillStyle = this.color;
    context.textAlign = this.align;
    context.textBaseline = "top";
    context.fillText(this.text, this.position.x, this.position.y);
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
            this.keys.SPACE,
            this.keys.UP,
            this.keys.DOWN,
            this.keys.LEFT,
            this.keys.RIGHT,
          ].indexOf(e.keyCode) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );

    this.keys = {
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      SPACE: 32,
      Z: 90,
      X: 88,
      C: 67,
    };
    Object.freeze(this.keys);
  }
  isKeyPressed(key) {
    return this.keyMappings[key];
  }
}

class Particle extends DrawableComponent {
  constructor(position, size, drawable, lifespan) {
    super(position, size, drawable);
    this.life = 0;
    this.lifespan = lifespan;
  }
  update() {
    this.life++;
  }
  remove() {
    this.life = this.lifespan;
  }
  isDead() {
    return this.life >= this.lifespan;
  }
}

class ParticleEngine extends GameComponent {
  constructor() {
    super();
    this.particles = [];
  }
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (particle.life >= particle.lifespan) {
        this.particles.splice(i, 1);
      } else {
        particle.update();
      }
    }
  }
  draw(context) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(context);
    }
  }
}
