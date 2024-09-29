export class Vector {
  constructor(public x: number, public y: number) {}

  // Method to add two vectors
  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  // Method to subtract two vectors
  subtract(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  // Method to check if two vectors are equal
  equals(v: Vector): boolean {
    return this.x === v.x && this.y === v.y;
  }

  // Method to calculate the dot product of two vectors
  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y;
  }

  // Method to calculate the magnitude of the vector
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Method to project this vector onto another vector
  projectOnto(v: Vector): Vector {
    const dotProduct = this.dot(v);
    const vMagSquared = v.magnitude() ** 2;
    if (vMagSquared === 0) return new Vector(0, 0); // Handle zero-length vectors
    const scalar = dotProduct / vMagSquared;
    return new Vector(v.x * scalar, v.y * scalar);
  }

  // Method to scale the vector by a scalar
  scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  // Method to normalize the vector
  normalize(): Vector {
    const mag = this.magnitude();
    if (mag === 0) return new Vector(0, 0); // Handle zero-length vectors
    return new Vector(this.x / mag, this.y / mag);
  }
}
