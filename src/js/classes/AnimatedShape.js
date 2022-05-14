export default class AnimatedShape {
    constructor(p5, colour, size, lifetime = 1000) {
        this.p = p5;
        this.colour = colour;
        this.size = size;
        this.currentFrame = 0;
        this.canDraw = true;
        this.setLifeTime(lifetime);
    }

    setLifeTime(lifetime) {
        this.totalFrames = 30 * lifetime;
        this.sizeIncreaser = (this.p.width - this.size) / this.totalFrames;
    }

    update() {
        if(this.canDraw) {
            this.size = this.size + this.sizeIncreaser;
            this.canDraw = this.size <= this.p.width;   
        }
    }

    draw() {
        if(this.canDraw) {
            this.p.stroke(this.colour);
            this.p.rect(this.p.width / 2, this.p.height / 2, this.size, this.size);
        }
    }
}