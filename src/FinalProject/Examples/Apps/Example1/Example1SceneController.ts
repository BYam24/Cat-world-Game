import { ExampleSceneController } from "../ExampleSceneController";
import { AGLContext, AMaterial, Color, Mat3, V3 } from "../../../../anigraph";
import { Example1SceneModel } from "./Example1SceneModel";
import { DirectionalParticleSystemModel } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemModel";
import { DirectionalParticleSystemView } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemView";
import { FlameParticleSystemModel } from "../../Nodes/FlameParticleSystem/FlameParticleSystemModel";
import { FlameParticleSystemView } from "../../Nodes/FlameParticleSystem/FlameParticleSystemView";



export class Example1SceneController extends ExampleSceneController {
    get model(): Example1SceneModel {
        return this._model as Example1SceneModel;
    }

    /**
     * This is where you specify the mapping from model classes to view classes.
     */
    initModelViewSpecs(): void {
        super.initModelViewSpecs();
        this.addExampleModelViewSpecs();
        this.addModelViewSpec(DirectionalParticleSystemModel, DirectionalParticleSystemView);
        this.addModelViewSpec(FlameParticleSystemModel, FlameParticleSystemView)
    }

    async initScene(): Promise<void> {
        await super.initScene()
        this.initSkyBoxCubeMap();
        this.setClearColor(Color.Black());
    }

    initInteractions() {
        super.initInteractions();
        super.initExampleInteractions();
    }

    onAnimationFrameCallback(context: AGLContext) {
        /**
         * let's update the model...
         */
        this.model.timeUpdate(this.model.clock.time);

        /**
         * and let's update the controller...
         * This will mostly update any interactions that depend on time.
         * Keep in mind that the model and controller run on separate clocks for this, since we may
         * want to pause our model's clock and continue interacting with the scene (e.g., moving the camera around).
         */
        this.timeUpdate();

        /**
         * Clear the rendering context.
         * you can also specify which buffers to clear: clear(color?: boolean, depth?: boolean, stencil?: boolean)
         * ``` this.renderer.clear(false, true); ```
         */
        context.renderer.clear();
        context.renderer.autoClear = false;

        if(this.model.cosmic_cat){
            this.model.player.material.setRenderSide(AMaterial.GEOMETRY_SIDE.BOTH);
            this.model.player.material.setUniform("outline", false, "bool");
            context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());

            this.model.player.material.setRenderSide(AMaterial.GEOMETRY_SIDE.BACK);
            this.model.player.material.setUniform("outline", true, "bool");
            context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());
        } else {
            // render the scene view
            this.model.player.material.setRenderSide(AMaterial.GEOMETRY_SIDE.BACK);
            this.model.player.material.setUniform("outline", true, "bool");
            context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());

            this.model.player.material.setRenderSide(AMaterial.GEOMETRY_SIDE.BOTH);
            this.model.player.material.setUniform("outline", false, "bool");
            context.renderer.render(this.getThreeJSScene(), this.getThreeJSCamera());
        }


    }

}




