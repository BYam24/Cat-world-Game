import {
    ACameraModel, AInteractionEvent, AMaterial,
    AppState, GetAppState,
    NodeTransform3D, Particle3D,
    V3, Vec2, Vec3, AShaderModel, AShaderModelBase, AShaderMaterial, AVisiblePointLightModel, APointLightModel, Color
} from "../../../../anigraph";
import {
    BillboardParticleSystemModel, SphereParticle,
} from "../../Nodes";
import { ExampleSceneModel } from "../ExampleSceneModel";
import {ToonShaderModel} from "./ToonShaderModel";
import { ABlinnPhongShaderModel } from "../../../../anigraph/rendering/shadermodels";
import { DirectionalParticleSystemModel } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemModel";

enum SHADERS{
    TOONSHADER="toonshader",
}


export class Example1SceneModel extends ExampleSceneModel {
    lights:APointLightModel[]=[];
    billboardParticles!: BillboardParticleSystemModel;
    directionalParticleSystem!: DirectionalParticleSystemModel;
    gravity: number = -2.62;
    camera_speed:number = 0.01;
    cosmic_cat = false;
    MAIN_LIGHT_KEY = "Main Light Color";
    NEW_LIGHT_KEY = "New Light Color";

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
        ToonShaderModel.AddAppState();
        ABlinnPhongShaderModel.AddAppState();
        appState.addColorControl(this.MAIN_LIGHT_KEY, Color.Green());
        appState.addColorControl(this.NEW_LIGHT_KEY, Color.White());
        // BillboardParticleSystemModel.AddParticleSystemControls();

    }


    async PreloadAssets() {
        await super.PreloadAssets();
        await this.LoadExampleTextures();
        await this.LoadExampleModelClassShaders()
        await this.LoadTheCat();

        await GetAppState().addShaderMaterialModel(SHADERS.TOONSHADER, ToonShaderModel);
        GetAppState().getShaderMaterialModel(SHADERS.TOONSHADER).usesVertexColors=true;
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
        this.addLight(Color.Green());

        /**
         * initialize terrain
         */
        this.initTerrain();

        /**
         * Let's generate a random slightly bumpy terrain.
         * It's just uniform random bumps right now, nothing fancy.
         */
        this.terrain.reRollRandomHeightMap();



        let appState = GetAppState();

        let material = appState.CreateShaderMaterial(SHADERS.TOONSHADER);
        ABlinnPhongShaderModel.attachMaterialUniformsToAppState(material);

        // await this.addBotsInHierarchy();

        this.initCatPlayer(material);

        // this.addExampleThreeJSNodeModel();

        // this.addExampleBilboardParticleSystem();


        // this.directionalParticleSystem = new DirectionalParticleSystemModel();

        // this.addChild(this.directionalParticleSystem)





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

    addLight(col : Color){
        /**
         * This creates a point light with a small sphere around it (so we can see where the point light is)
         * @type {AVisiblePointLightModel}
         */
        let light = new AVisiblePointLightModel(
            this.camera.transform.clone(),
            col,1, 1, 1
        );

        this.lights.push(light);
        this.addChild(light)
    }

    removeLastLight(col : Color){
        let removed = this.lights.pop();
        if (removed !== undefined){
            this.removeChild(removed);
        }
    }

    timeUpdate(t: number, ...args: any[]) {
        
        this.timeUpdateDescendants(t);

        // this.player.position = V3(-0.5, 0.7, 0);// move the cat to a specific place

        // this.terrain.reRollHeightMap() // set the terrain to flat
        // this.terrain.dig_hole(this.player.position.xy, 0.3, 0.5) // dig a hole right beneath the cat
        // this.terrain.dig_diamond_hole(this.player.position.xy,0.5,0.4) // dig a square hole right beneath the cat
        // this.player.position.z = this.terrain.getTerrainHeightAtPoint(this.player.position.xy) // adjust player's height based on the height map
        
        //decelerate
        // let gravity = -1.62
        let gravity = -5 // larger gravity
        let new_z = this.player.position.z + gravity * 0.0008
        let directionalParticleSystem = new DirectionalParticleSystemModel()


        if (new_z > this.terrain.getTerrainHeightAtPoint(this.player.position.xy)){
            this.player.position.z = new_z
        }
        else{
            this.player.position.z = this.terrain.getTerrainHeightAtPoint(this.player.position.xy) // adjust player's height based on the height map
        }

        if (this.player.dig && (this.player.position.z == this.terrain.getTerrainHeightAtPoint(this.player.position.xy))){
            directionalParticleSystem.curr_position = this.player.position
            this.addChild(directionalParticleSystem)

            if(this.player.dig_type == 0){
                this.terrain.dig_hole(this.player.position.xy, 0.3, 0.5) // dig a hole right beneath the cat

            }
            else if(this.player.dig_type == 1){
                this.terrain.dig_diamond_hole(this.player.position.xy,0.5,0.4) // dig a square hole right beneath the cat
            }
            else if(this.player.dig_type == 2){
                this.terrain.pile_hill(this.player.position.xy, 0.3, 0.5)
            }
            else if(this.player.dig_type == 3){
                this.terrain.pile_pyramid(this.player.position.xy,0.5,0.4)
            }

            this.player.dig = false
        }


        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                // final_camera_pos,
                this.player.position.plus(V3(-0.15,-1,1)),
                this.player.position,
                V3(0, 0, 1)
            )
        )



        for (let ei = 0; ei < this.bots.length; ei++) {
            let e = this.bots[ei];
            /**
             * adjust their height
             */
            this.adjustParticleHeight(e);
        }
        // this.timeUpdateOrbitBots(t);
        let appState = GetAppState();
        this.cosmic_cat = appState.getState("cosmicCat");

        if (this.lights.length != 0){
            this.lights[0].color = appState.getState(this.MAIN_LIGHT_KEY);
        }

    }


}


