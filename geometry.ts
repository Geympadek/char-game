function rotatePointAround(point : {x: number, y: number}, center : {x: number, y: number}, angle : number)
{
    angle *= DEG_TO_RADIANS;

    let cosAngle = Math.cos(angle);
    let sinAngle = Math.sin(angle);

    let rotatedPoint = {
        x: cosAngle * (point.x - center.x) - sinAngle * (point.y - center.y) + center.x,
        y: sinAngle * (point.x - center.x) + cosAngle * (point.y - center.y) + center.y  
    };
    return rotatedPoint;
}

class Line 
{
    a : {x: number, y: number};
    b : {x: number, y: number};
    constructor(a : {x: number, y: number}, b : {x: number, y: number})
    {
        this.a = a;
        this.b = b;
    }
    //Bresenham's rasterization algorithm
    draw() : void
    {
        let p0 = { x: Math.round(this.a.x / coordPerPixel), y: Math.round(this.a.y / coordPerPixel)};
        let p1 = { x: Math.round(this.b.x / coordPerPixel), y: Math.round(this.b.y / coordPerPixel)};

        let d = { x: Math.abs(p0.x - p1.x), y: Math.abs(p0.y - p1.y)};
        let s = { x: (p0.x < p1.x) ? 1 : -1, y: (p0.y < p1.y) ? 1 : -1};

        let error = d.x - d.y;
        let x = p0.x;
        let y = p0.y;

        while (x != p1.x || y != p1.y)
        {
            pixels[getPixelIndex(x, y)] = true;

            let e2 = 2 * error;
            if (e2 > -d.y)
            {
                error -= d.y;
                x += s.x;
            }
            if (e2 < d.x)
            {
                error += d.x;
                y += s.y;
            }
        }
        pixels[getPixelIndex(x, y)] = true;
    }
    rotateAround(center : {x: number, y: number}, angle : number) : Line
    {
        return new Line(rotatePointAround(this.a, center, angle), rotatePointAround(this.b, center, angle));
    }
}

function sortVertices(a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number})
{
    let d1 = {x: b.x - a.x, y: b.y - a.y};
    let d2 = {x: c.x - a.x, y: c.y - a.y};

    if (calculateCrossProduct(d1, d2) < 0)
    {
        [b, c] = [c, b];
    }
    return [a, b, c];
}

function calculateCrossProduct(a: {x: number, y: number}, b: {x: number, y: number}) : number
{
    return a.x * b.y - a.y * b.x;
}

class Triangle
{
    a: {x: number, y: number};
    b: {x: number, y: number};
    c: {x: number, y: number};
    constructor(a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number})
    {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    draw()
    {
        let points = sortVertices(this.a, this.b, this.c);

        points[0].x = Math.round(points[0].x / coordPerPixel);
        points[0].y = Math.round(points[0].y / coordPerPixel);
        points[1].x = Math.round(points[1].x / coordPerPixel);
        points[1].y = Math.round(points[1].y / coordPerPixel);
        points[2].x = Math.round(points[2].x / coordPerPixel);
        points[2].y = Math.round(points[2].y / coordPerPixel);

        //define bounding box
        let start = {x: Math.round(Math.min(points[0].x, points[1].x, points[2].x)), y: Math.round(Math.min(points[0].y, points[1].y, points[2].y))};
        let end = {x: Math.round(Math.max(points[0].x, points[1].x, points[2].x)), y: Math.round(Math.max(points[0].y, points[1].y, points[2].y))};

        for (let i = start.x; i <= end.x; i++)
        {
            for (let j = start.y; j <= end.y; j++)
            {
                if (Triangle.checkIfInside({x: i, y: j}, points))
                {
                    pixels[getPixelIndex(i, j)] = true;
                }
            }
        }
    }
    static checkIfInside(point: {x: number, y: number}, trianglePoints: {x: number, y: number}[])
    {
        if (edgeFunction(trianglePoints[0], trianglePoints[1], point) < 0)
        {
            return false;
        }
        if (edgeFunction(trianglePoints[1], trianglePoints[2], point) < 0)
        {
            return false;
        }
        if (edgeFunction(trianglePoints[2], trianglePoints[0], point) < 0)
        {
            return false;
        }
        return true;
    }
    rotateAround(center: {x: number, y: number}, angle: number)
    {
        return new Triangle(
            rotatePointAround(this.a, center, angle),
            rotatePointAround(this.b, center, angle),
            rotatePointAround(this.c, center, angle)
        );
    }
    rotateAroundItself(angle: number)
    {
        return this.rotateAround(this.findCentroid(), angle);
    }
    findCentroid()
    {
        return {
            x: (this.a.x + this.b.x + this.c.x) / 3,
            y: (this.a.y + this.b.y + this.c.y) / 3 
        };
    }
}

class Circle
{
    center: {x: number, y: number};
    radius: number;
    constructor(center: {x: number, y: number}, radius: number)
    {
        this.center = center;
        this.radius = radius;
    }

    draw()
    {
        let center = {x: this.center.x / coordPerPixel, y: this.center.y / coordPerPixel};
        let radius = this.radius / coordPerPixel;

        let start = {x: center.x - radius, y: center.y - radius};
        let end = {x: center.x + radius, y: center.y + radius};

        start.x = Math.floor(start.x);
        start.y = Math.floor(start.y);
        end.x = Math.floor(end.x);
        end.y = Math.floor(end.y);

        for (let x = start.x; x <= end.x; x++)
        {
            for (let y = start.y; y <= end.y; y++)
            {
                let pixelRadius = 0.5;

                let xLeg = Math.abs(center.x - (x + pixelRadius));
                let yLeg= Math.abs(center.y - (y + pixelRadius));

                let distance = Math.sqrt(xLeg * xLeg + yLeg * yLeg);
                if (distance <= (radius + pixelRadius))
                {
                    pixels[getPixelIndex(x, y)] = true; 
                }
            }
        }
    }
}