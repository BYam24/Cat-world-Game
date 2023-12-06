import { AParticle3D } from "../../../../anigraph";
import { Color, Vec3 } from "../../../../anigraph";

export class SphereParticle extends AParticle3D {
    radius: number;
    color: Color;
    initialRadius: number;
    lifespan: number;
    initialLifespan: number;

    constructor(position?: Vec3, velocity?: Vec3, radius = 5, mass?: number, lifespan = 10) {
        super(position, velocity, mass);
        this.radius = radius;
        this.initialRadius = radius;
        this.color = Color.FromRGBA(0, 1, 0, 1);
        this.lifespan = lifespan;
        this.initialLifespan = lifespan;
    }

    updateSizeOverTime(deltaTime: number) {

        this.lifespan -= deltaTime;


        if (this.lifespan > 0) {
            let lifespanFraction = this.lifespan / this.initialLifespan;
            this.radius = this.initialRadius * lifespanFraction;
        } else {
            this.radius = 0;
        }
    }

    get opacity() {
        return this.color.a;
    }
}
