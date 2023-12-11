import { AParticle3D } from "../../../../anigraph";
import { Color, Vec3 } from "../../../../anigraph";

export class SphereParticle extends AParticle3D {
    color!: Color;
    lifespan!: number
    negative_x!: boolean
    negative_y!: boolean

    constructor(position?: Vec3, velocity?: Vec3, mass?: number, size?: number, color?: Color, lifespan?: number) {
        super(position, velocity, mass, size);
        this.color = color ?? Color.FromString("#00ff00");
        this.lifespan = lifespan ?? 5
        this.negative_x = false
        this.negative_y = false
    }



}
