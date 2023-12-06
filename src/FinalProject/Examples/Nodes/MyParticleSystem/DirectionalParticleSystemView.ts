import { DirectionalParticleSystemModel } from "./DirectionalParticleSystemModel";
import { Color, Mat3, Mat4, NodeTransform3D, Quaternion, Vec3 } from "../../../../anigraph";
import {
  AInstancedParticleSystemGraphic, AInstancedParticleSystemView,
} from "../../../../anigraph/effects/particles/InstancedParticles";
import { DirectionalParticleSystemGraphic } from "./DirectionalParticleSystemGraphic";
import { SphereParticle } from "./SphereParticle";

export class DirectionalParticleSystemView extends AInstancedParticleSystemView<SphereParticle>{
  static MAX_PARTICLES = 300;

  get particlesElement(): DirectionalParticleSystemGraphic {
    return this._particlesElement as DirectionalParticleSystemGraphic;
  }
  get model(): DirectionalParticleSystemModel {
    return this._model as DirectionalParticleSystemModel;
  }

  createParticlesElement(...args: any[]): DirectionalParticleSystemGraphic {
    return AInstancedParticleSystemGraphic.Create(DirectionalParticleSystemView.MAX_PARTICLES,
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
    // throw new Error("Method not implemented.");
    let particle = this.model.particles[i];
    let nt = new NodeTransform3D(particle.position, new Quaternion(), particle.size);
    return nt.getMat4();
  }

  update(args: any): void {
  }
}
