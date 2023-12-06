import {
    ACameraModel, AInteractionEvent,
    AppState,
    NodeTransform3D, Particle3D,
    V3, Vec2, Vec3,
} from "../../../../anigraph";
import {
    BillboardParticleSystemModel, SphereParticle,
} from "../../Nodes";
import { ExampleSceneModel } from "../ExampleSceneModel";
import { ABlinnPhongShaderModel } from "../../../../anigraph/rendering/shadermodels";
import { DirectionalParticleSystemModel } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemModel";

export class Example1SceneModel extends ExampleSceneModel {
    billboardParticles!: BillboardParticleSystemModel;
    directionalParticleSystem!: DirectionalParticleSystemModel;

    /**
     * Optionally add some app state here. Good place to set up custom control panel controls.
     * @param appState
     */
    initAppState(appState: AppState): void {

        /**
         * Adding sliders to control blinn phong parameters
         * We can attach the corresponding parameters for a material later on by calling
         * ```
         * ABlinnPhongShaderModel.attachMaterialUniformsToAppState(material);
         * ```
         */
        ABlinnPhongShaderModel.AddAppState();
        // BillboardParticleSystemModel.AddParticleSystemControls();

    }


    async PreloadAssets() {
        await super.PreloadAssets();
        await this.LoadExampleTextures();
        await this.LoadExampleModelClassShaders()
        await this.LoadTheCat();
    }


    initCamera() {
        super.initCamera();
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(0, -1, 1),
                V3(0, 0, 0),
                V3(0, 0, 1)
            )
        )
    }


    initScene() {
        /**
         * We need to add a light before we can see anything.
         * The easiest thing is to just attach a point light to the camera.
         */
        this.addViewLight();

        /**
         * initialize terrain
         */
        this.initTerrain();

        /**
         * Let's generate a random slightly bumpy terrain.
         * It's just uniform random bumps right now, nothing fancy.
         */
        this.terrain.reRollRandomHeightMap();

        // await this.addBotsInHierarchy();

        this.initCatPlayer();

        // this.addExampleThreeJSNodeModel();

        // this.addExampleBilboardParticleSystem();



        this.directionalParticleSystem = new DirectionalParticleSystemModel();

        this.addChild(this.directionalParticleSystem)



        /**
         * Here we attach our character's shader parameters to controls in the control panel
         */
        ABlinnPhongShaderModel.attachMaterialUniformsToAppState(this.player.material);
    }


    getCoordinatesForCursorEvent(event: AInteractionEvent) {
        return event.ndcCursor ?? new Vec2();
    }

    /**
     * Here we will separate out logic that check to see if a particle (characters implement the particle interface, so
     * this can be used on characters as well) intersects the terrain.
     * @param particle
     */
    adjustParticleHeight(particle: Particle3D) {
        let height = this.terrain.getTerrainHeightAtPoint(particle.position.xy);
        if (particle.position.z < height) { particle.position.z = height; }
    }






    timeUpdate(t: number, ...args: any[]) {

        this.timeUpdateDescendants(t);
        this.player.position = V3(-0.5, 0.7, 0);// move the cat to a specific place
        this.terrain.reRollHeightMap() // set the terrain to flat
        this.terrain.dig_hole(this.player.position.xy, 0.3, 0.5) // dig a hole right beneath the cat
        // this.terrain.dig_diamond_hole(this.player.position.xy,0.5,0.4) // dig a square hole right beneath the cat
        this.player.position.z = this.terrain.getTerrainHeightAtPoint(this.player.position.xy) // adjust player's height based on the height map


        for (let ei = 0; ei < this.bots.length; ei++) {
            let e = this.bots[ei];
            /**
             * adjust their height
             */
            this.adjustParticleHeight(e);
        }
        // this.timeUpdateOrbitBots(t);
    }


}


