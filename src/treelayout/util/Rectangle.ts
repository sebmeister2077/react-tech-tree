export interface RectangleProps{
    x: number;
    y: number;
    height: number;
    width: number;
}

const min = (a: number, b: number): number => Math.min(a, b)

const max = (a: number, b: number): number => Math.max(a, b)


export class Rectangle{
    x: number;
    y: number;
    height: number;
    width: number;

    #x2: number;//second x coord
    #y2: number;//second y coord

    constructor(props?:Rectangle | Partial<RectangleProps>) {
        this.x = props?.x ?? 0;
        this.y = props?.y ?? 0;
        this.height = props?.height ?? 0;
        this.width = props?.width ?? 0;

        this.#x2 = this.x + this.width;
        this.#y2 = this.y + this.height;

        Rectangle.validateRect(this);
    }

    getX2 = () => this.#x2;
    
    getY2 = () => this.#y2;

    createIntersection(r: Rectangle): Rectangle | null {
        if (!this.intersects(r))
            return null;

        let res = new Rectangle();

        res.x = this.x;
        if (this.#isInsideAxisX(r.x)) {
            res.x = r.x;
        }

        res.y = this.y;
        if (this.#isInsideAxisY(r.y)) {
            res.y = r.y;
        }
        
        res.width = this.width - (this.x - res.x);//shorten the width if x has moved
        if (this.#isInsideAxisX(r.x + r.width)) {
            res.width = this.width - (r.x + r.width);//move the width inwards
        }

        res.height = this.height - (this.y - res.y);//shorten the width if x has moved
        if (this.#isInsideAxisY(r.y + r.height)) {
            res.height = this.height - (r.y + r.height);//move the width inwards
        }

        return res;
    }

    createUnion(r: Rectangle): Rectangle | null{
        
    }

    equals = (rect: Rectangle): boolean => this.x == rect.x && this.y == rect.y && this.height == rect.height && this.width == rect.width;

    /** Determines where the specified coordinates lie inside this Rectangle */
    isInside = (x: number, y: number) => {
        let isOutsideX = x < this.x && x > this.x + this.width;
        let isOutsideY = y < this.y && y > this.y + this.height;
        return !(isOutsideX || isOutsideY);
    }

    intersects = (r: Rectangle): boolean => {
        let isXInside = this.#isInsideAxisX(r.x);
        let isWidthInside = this.#isInsideAxisX(r.x+r.width);
        let isYInside = this.#isInsideAxisY(r.y);
        let isHeightInside = this.#isInsideAxisY(r.y + r.height);
        
        return isHeightInside || isWidthInside || isXInside || isYInside;
    }

    

    setRect(r: Rectangle) {
        this.x = r.x
        this.y = r.y
        this.height = r.height
        this.width = r.width

        this.#x2 = this.x + this.width;
        this.#y2 = this.y + this.height;
    }

    recalculate2ndCoords() {
        this.#x2 = this.x + this.width;
        this.#y2 = this.y + this.height;
    }

    #recaulculateSize() {
        this.height = this.#x2 - this.x;
        this.width = this.#y2 - this.y;
    }

    #isInsideAxisX = (x: number): boolean => {
        let isOutsideX = x < this.x && x > this.x + this.width;
        return !isOutsideX
    }

    #isInsideAxisY = (y: number): boolean => {
        let isOutsideY = y < this.y && y > this.y + this.height;
        return !isOutsideY
    }

    static validateRect(r: Rectangle): never | void {
        if (r.width < 0 || r.height < 0)
            throw new Error("Rectangle has invalid size");
        return;
    }
}

let f = new Rectangle();