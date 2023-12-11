import { FlameParticleSystemModel } from "./FlameParticleSystemModel";
import { Color, Mat3, Mat4, NodeTransform3D, Quaternion, Vec3 } from "../../../../anigraph";
import {
  AInstancedParticleSystemGraphic, AInstancedParticleSystemView,
} from "../../../../anigraph/effects/particles/InstancedParticles";
import { FlameParticleSystemGraphic } from "./FlameParticleSystemGraphic";
import { SphereParticle } from "./SphereParticle";

export class FlameParticleSystemView extends AInstancedParticleSystemView<SphereParticle>{
  static MAX_PARTICLES = 1000;

  get particlesElement(): FlameParticleSystemGraphic {
    return this._particlesElement as FlameParticleSystemGraphic;
  }
  get model(): FlameParticleSystemModel {
    return this._model as FlameParticleSystemModel;
  }

  createParticlesElement(...args: any[]): FlameParticleSystemGraphic {
    return AInstancedParticleSystemGraphic.Create(FlameParticleSystemView.MAX_PARTICLES,
      this.model.material);
  }

  init() {
    super.init();
  }

  updateParticles(...args: any[]) {
    for (let i = 0; i < this.model.particles.length; i++) {
      if (!this.model.particles[i].visible) {
        this.particlesElement.setMatrixAt(i, Mat4.Zeros());
      } else {
        //  if you want to use particle opacity, you must update the particles using the following function
        this.particlesElement.setMatrixAndColorAt(i, this._getTransformForParticleIndex(i), this._getColorForParticleIndex(i), true);

        // If you aren't using opacity, you can use the following functions
        // this.particlesElement.setColorAt(i, this._getColorForParticleIndex(i));
        // this.particlesElement.setMatrixAt(i, this._getTransformForParticleIndex(i));
      }
    }
    this.particlesElement.setNeedsUpdate();
    this.update([]);
  }

  /**
   * This function should return the color to be applied to the particle associated with the provided particle index
   * @param particle
   */
  _getColorForParticleIndex(i: number): Color {
    // throw new Error("Method not implemented.");
    return this.model.particles[i].color;
  }

  /**
   * This function should return the transformation to be applied to geometry associated with the provided particle
   * @param particle
   */
  _getTransformForParticleIndex(i: number): Mat4 {
    let particle = this.model.particles[i];
    let cameraPosition = this.model.camera.position;

    let directionToCamera = cameraPosition.minus(particle.position).getNormalized();
    let forwardVector = new Vec3(0, 0, 1);

    let rotation = Quaternion.FromRotationBetweenTwoVectors(forwardVector, directionToCamera);

    let nt = new NodeTransform3D(particle.position, rotation, particle.size);
    return nt.getMat4();
  }

  update(args: any): void {
  }
}
