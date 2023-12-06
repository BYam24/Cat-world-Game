import { ASerializable, Vec3, Color } from "../../../../anigraph";
import { AInstancedParticleSystemModel } from "../../../../anigraph/effects";
import { SphereParticle } from "./SphereParticle";


@ASerializable("DirectionalParticleSystemModel")
export class DirectionalParticleSystemModel extends AInstancedParticleSystemModel<SphereParticle>{
  // Define additional properties if needed

  constructor(nParticles?: number, ...args: any[]) {
    super(nParticles);
    this.initParticles(nParticles = 100);
    this.signalParticlesUpdated();
  }

  initParticles(nParticles: number) {
    for (let i = 0; i < nParticles; i++) {
      let newParticle = new SphereParticle();
      newParticle.visible = false; // Initialize as invisible
      this.addParticle(newParticle);
    }
  }

  addParticle(particle: SphereParticle) {
    this.particles.push(particle);
  }

  emitParticlesAtLocation(location: Vec3, leftDirection: Vec3, rightDirection: Vec3, count = 10, lifespan = 3) {
    for (let i = 0; i < count / 2; i++) {
      let upwardForce = 0.5;
      let leftVelocity = new Vec3(leftDirection.x * Math.random(), leftDirection.y * Math.random(), upwardForce);
      let rightVelocity = new Vec3(rightDirection.x * Math.random(), rightDirection.y * Math.random(), upwardForce);

      let leftParticle = new SphereParticle(location, leftVelocity, lifespan);
      let rightParticle = new SphereParticle(location, rightVelocity, lifespan);

      this.addParticle(leftParticle);
      this.addParticle(rightParticle);
    }
  }

  timeUpdate(t: number, ...args: any[]) {
    super.timeUpdate(t);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let particle = this.particles[i];

      particle.position.plus(particle.velocity);


      particle.lifespan -= t;

      if (particle.lifespan <= 0) {

        this.particles.splice(i, 1);
      } else {

        let lifespanFraction = particle.lifespan / particle.initialLifespan;
        particle.radius = particle.initialRadius * lifespanFraction;



      }

    }

    this.signalParticlesUpdated();
  }
}
