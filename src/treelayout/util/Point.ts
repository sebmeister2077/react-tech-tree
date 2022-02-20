export class Point{
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    distance(x2: number, y2: number): number{
        return Math.sqrt((this.x - x2) * (this.x - x2) + (this.y - y2) * (this.y - y2));
    }

    static distance(x1: number, y1: number, x2: number, y2: number): number{
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    equals(p: Point): boolean{
        return p.x == this.x && p.y == this.y;
    }

    setLocation = (x: number, y: number): void => {
        this.x = x;
        this.y = y;
    }

    getX = () => this.x;

    getY = () => this.y;

    
}