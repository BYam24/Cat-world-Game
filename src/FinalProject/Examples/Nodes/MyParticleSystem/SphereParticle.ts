import { AParticle3D } from "../../../../anigraph";
import { Color, Vec3 } from "../../../../anigraph";

export class SphereParticle extends AParticle3D {
    color!: Color;
    t0: number = 0;

    constructor(position?: Vec3, velocity?: Vec3, mass?: number, size?: number, color?: Color) {
        super(position, velocity, mass, size);
        this.color = color ?? Color.FromString("#00ff00");
    }



}
