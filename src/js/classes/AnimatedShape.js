export default class AnimatedShape {
    constructor(p5, colour, size, lifetime = 1000, maxSize = 0) {
        this.p = p5;
        this.colour = colour;
        this.size = size;
        this.innerSize = size;
        this.currentFrame = 0;
        this.maxSize = maxSize;
        this.maxSizeReached = false;
        this.canDraw = true;
        this.setLifeTime(lifetime);
    }

    setLifeTime(lifetime) {
        this.totalFrames = 30 * lifetime;
        this.sizeIncreaser = (this.p.width - this.size) / this.totalFrames;
    }

    update() {
        if(this.canDraw) {
            this.size = this.maxSizeReached ? this.size - this.sizeIncreaser : this.size + this.sizeIncreaser;
            this.innerSize = this.innerSize - this.sizeIncreaser;
            this.canDraw = this.maxSize ? this.size >= 0 : this.size <= this.p.width;   
            if(!this.maxSizeReached) {
                this.maxSizeReached = this.maxSize && this.size >= this.maxSize;
            }
        }
    }

    draw() {
        if(this.canDraw) {
            this.p.stroke(this.colour);
            this.p.noFill();
            this.maxSize && this.p.fill(this.colour);
            this.p.rect(0, 0, this.size, this.size);
            !this.maxSize && this.p.rect(0, 0, this.innerSize, this.innerSize);
        }
    }
}