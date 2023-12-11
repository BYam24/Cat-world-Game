import { random } from "tinycolor2";
import { ASerializable, Vec3, Color, ACamera } from "../../../../anigraph";
import { AInstancedParticleSystemModel } from "../../../../anigraph/effects";
import { SphereParticle } from "./SphereParticle";


@ASerializable("FlameParticleSystemModel")
export class FlameParticleSystemModel extends AInstancedParticleSystemModel<SphereParticle>{


  lastEmittedIndex: number = 0;
  curr_position = new Vec3(0, 0, 0)
  camera !: ACamera

  constructor(camera: ACamera, nParticles: number = 2000) {

    super(nParticles);
    this.camera = camera
    this.initParticles(nParticles);
    this.signalParticlesUpdated();
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


    let x_offset = Math.random() * 0.2
    let y_offset = Math.random() * 0.2


    this.particles[i].velocity = new Vec3(-0.0005, -0.0005, .005)

    this.particles[i].color = new Color(255, 0, 0);

    if (Math.random() < 0.5) {
      this.particles[i].velocity.x = -this.particles[i].velocity.x
      x_offset = -x_offset
      this.particles[i].negative_x = true


    }

    if (Math.random() < 0.5) {
      this.particles[i].velocity.y = -this.particles[i].velocity.y
      y_offset = -y_offset
      this.particles[i].negative_y = true

    }

    this.particles[i].position = new Vec3(this.curr_position.x + x_offset, this.curr_position.y + y_offset, this.curr_position.z)




    this.particles[i].size = radius ?? (0.75 + Math.random() * 0.85);

    this.particles[i].lifespan = Math.random() * 5

    this.particles[i].mass = mass ?? 1;
    this.particles[i].size = radius ?? 0.1;
    this.particles[i].visible = true;


    this.lastEmittedIndex = i;
  }

  timeUpdate(t: number) {
    super.timeUpdate(t);




    this.emit()
    this.emit()
    this.emit()




    for (let i = 0; i < this.particles.length; i++) {

      let p = this.particles[i];

      if ((p.negative_x && p.position.x < this.curr_position.x) || (!p.negative_x && p.position.x > this.curr_position.x)) {
        p.position = p.position.plus(p.velocity);
      }

      if ((p.negative_y && p.position.y < this.curr_position.y) || (!p.negative_y && p.position.y > this.curr_position.y)) {
        p.position = p.position.plus(p.velocity);
      }

      p.position.z += 0.008;

      if (p.color.g < 255) {
        p.color.g += 0.05;
      }

      if (p.position.z >= 0.5) {
        p.visible = false;
      }



    }




    this.signalParticlesUpdated();


  }



}

