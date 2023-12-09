import { random } from "tinycolor2";
import { ASerializable, Vec3, Color } from "../../../../anigraph";
import { AInstancedParticleSystemModel } from "../../../../anigraph/effects";
import { SphereParticle } from "./SphereParticle";


@ASerializable("DirectionalParticleSystemModel")
export class DirectionalParticleSystemModel extends AInstancedParticleSystemModel<SphereParticle>{
  gravity: Vec3 = new Vec3(0, 0, -.0005); // Gravity vector

  lastEmittedIndex: number = 0;
  timesRun: number = 0;
  curr_position = new Vec3(0, 0, 0)

  constructor(nParticles: number = 100) {
    super(nParticles);
    this.initParticles(nParticles);
    this.signalParticlesUpdated();
  }

  reset(position: Vec3) {
    this.timesRun = 0
    this.curr_position = position
  }



  initParticles(nParticles: number) {
    for (let i = 0; i < nParticles; i++) {
      let newParticle = new SphereParticle();
      newParticle.visible = false;
      this.addParticle(newParticle);
    }
  }

  emit(mass?: number, radius?: number, t0: number = -1) {
    let i = (this.lastEmittedIndex + 1) % this.nParticles;


    this.particles[i].color = new Color(210, 180, 140);



    this.particles[i].size = radius ?? (0.75 + Math.random() * 0.85);



    let random_y = Math.random() * 0.3
    let random_x = Math.random() * 0.3


    this.particles[i].position = new Vec3(this.curr_position.x + random_x, this.curr_position.y + random_y, this.curr_position.z + 0);

    let ran_num = Math.random()

    if (ran_num > 0.75) {
      this.particles[i].velocity = new Vec3(-0.01, 0, .025)
    } else if (ran_num > 0.5) {
      this.particles[i].velocity = new Vec3(0, 0.01, .025)
    }
    else if (ran_num > 0.25) {
      this.particles[i].velocity = new Vec3(0, -0.01, .025)
    } else {
      this.particles[i].velocity = new Vec3(.01, 0, .025)
    }


    this.particles[i].mass = mass ?? 1;
    this.particles[i].size = radius ?? 0.1;
    this.particles[i].visible = true;
    this.particles[i].t0 = t0;

    this.lastEmittedIndex = i;
  }

  timeUpdate(t: number) {
    super.timeUpdate(t);


    if (this.timesRun < 50) {
      for (let i = 0; i < 1; i++) {


        this.emit();
      }

    }


    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.position = p.position.plus(
        p.velocity
      );

      p.velocity = p.velocity.plus(this.gravity);

      let age = t - p.t0;

      let shrinkRate = 0.005;
      p.size = Math.max(p.size * (1 - shrinkRate), 0);

      if (p.position.z <= 0) {
        p.visible = false
      }
    }

    this.signalParticlesUpdated();

    this.timesRun += 1
  }



}

