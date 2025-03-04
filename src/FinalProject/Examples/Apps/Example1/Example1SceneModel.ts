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
import { ToonShaderModel } from "./ToonShaderModel";
import { ABlinnPhongShaderModel } from "../../../../anigraph/rendering/shadermodels";
import { DirectionalParticleSystemModel } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemModel";
import { FlameParticleSystemModel } from "../../Nodes/FlameParticleSystem/FlameParticleSystemModel";

enum SHADERS {
    TOONSHADER = "toonshader",
}


export class Example1SceneModel extends ExampleSceneModel {
    lights:APointLightModel[]=[];
    billboardParticles!: BillboardParticleSystemModel;
    directionalParticleSystem!: DirectionalParticleSystemModel;
    flameParticleSystem!: FlameParticleSystemModel
    gravity: number = -2.62;
    camera_speed:number = 0.01;
    cosmic_cat = false;
    MAIN_LIGHT_KEY = "Main Light Color";
    MAIN_LIGHT_INTENSITY = "Main Light Intensity";
    NEW_LIGHT_KEY = "New Light Color";
    NEW_LIGHT_INTENSITY = "New Light Intensity";
    previous_t: number = 0;
    camera_look_at: Vec3 = V3(0, 0, 0);
    current_flame !: FlameParticleSystemModel;
    remove_flame:boolean = false;
    

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
        appState.addColorControl(this.MAIN_LIGHT_KEY, Color.White());
        appState.addSliderControl(this.MAIN_LIGHT_INTENSITY, 0.4, 0, 1, .05);
        appState.addColorControl(this.NEW_LIGHT_KEY, Color.Blue());
        appState.addSliderControl(this.NEW_LIGHT_INTENSITY, 0.4, 0, 1, .05);
        // BillboardParticleSystemModel.AddParticleSystemControls();

    }


    async PreloadAssets() {
        await super.PreloadAssets();
        await this.LoadExampleTextures();
        await this.LoadExampleModelClassShaders()
        await this.LoadTheCat();

        await GetAppState().addShaderMaterialModel(SHADERS.TOONSHADER, ToonShaderModel);
        GetAppState().getShaderMaterialModel(SHADERS.TOONSHADER).usesVertexColors = true;
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
        this.addLight(Color.White(), .4);

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


        // this.flameParticleSystem = new FlameParticleSystemModel();

        // this.addChild(this.flameParticleSystem)
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

    addLight(col? : Color, inten? : number){
        /**
         * This creates a point light with a small sphere around it (so we can see where the point light is)
         * @type {AVisiblePointLightModel}
         */
        col = col ?? GetAppState().getState(this.NEW_LIGHT_KEY);
        inten = inten ?? GetAppState().getState(this.NEW_LIGHT_INTENSITY)
        let light = new AVisiblePointLightModel(
            this.camera.transform.clone(),
            col,inten, 1, 1
        );

        this.lights.push(light);
        this.addChild(light)
    }

    removeLastLight(){
        if(this.lights.length > 1){
            let removed = this.lights.pop();
            if (removed !== undefined){
                this.removeChild(removed);
            }
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
        // this.player.velocity = new Vec3(1000,1000,1000);
        let gravity = Math.min(-5 * this.player.position.z / .4, -5) // larger gravity
        let new_z = this.player.position.z + gravity * 0.0008


        // let children_size = this.children.length
        // for (let i = children_size - 1; i > children_size - this.additional_children; i--){
        //     this.removeChild(this.children[i])
        //     this.additional_children -=1
        // }


        let directionalParticleSystem = new DirectionalParticleSystemModel(this.camera)

        let flameParticleSystem = new FlameParticleSystemModel(this.camera)



        for (let c of this.getDescendantList()) {

            if (c instanceof FlameParticleSystemModel) {
                c.camera = this.camera
            }

            if (c instanceof DirectionalParticleSystemModel) {
                c.camera = this.camera
            }
        }


        if (new_z > this.terrain.getTerrainHeightAtPoint(this.player.position.xy)) {
            this.player.position.z = new_z
        }
        else {
            this.player.position.z = this.terrain.getTerrainHeightAtPoint(this.player.position.xy) // adjust player's height based on the height map
        }

        if (this.player.dig && (this.player.position.z == this.terrain.getTerrainHeightAtPoint(this.player.position.xy))) {
            directionalParticleSystem.curr_position = this.player.position

            if (this.remove_flame){
                this.removeChild(this.current_flame)
                this.remove_flame = false
            }
            this.addChild(directionalParticleSystem)
            if (this.player.dig_type == 0) {
                this.terrain.dig_hole(this.player.position.xy, 0.3, 0.5) // dig a hole right beneath the cat
            }
            else if (this.player.dig_type == 1) {
                this.terrain.dig_diamond_hole(this.player.position.xy, 0.5, 0.4) // dig a square hole right beneath the cat
            }
            else if (this.player.dig_type == 2) {
                this.terrain.pile_hill(this.player.position.xy, 0.3, 0.5)
            }
            else if (this.player.dig_type == 3) {
                this.terrain.pile_pyramid(this.player.position.xy, 0.5, 0.4)
            }

            this.player.dig = false
        }
        
        if (this.player.fire) {
            if (this.remove_flame){
                this.removeChild(this.current_flame)
                this.remove_flame = false
            }
            let offset = new Vec3(0, -0.8, 0)
            flameParticleSystem.curr_position = this.player.position.plus(offset)
            this.addChild(flameParticleSystem)
            this.current_flame = flameParticleSystem
            // this.additional_children+=1
            this.player.fire = false
            this.remove_flame = true
        }


        // this.cameraModel.setPose(
        //     NodeTransform3D.LookAt(
        //         // final_camera_pos,
        //         this.player.position.plus(V3(-0.15,-1,1)),
        //         this.player.position,
        //         V3(0, 0, 1)
        //     )
        // )
        let delta_t = t - this.previous_t;
        this.previous_t = t;
        let cur_camera_pos = this.camera.position;
        let l_pos = 0.25
        // let target_camera_pos = this.player.position.plus(V3(0, -1, 1));
        let target_camera_pos = this.player.position.plus(V3(-0.3, -1, 2));
        let final_camera_pos = cur_camera_pos.plus(target_camera_pos.minus(cur_camera_pos).times(Math.min(1, delta_t / l_pos)))

        let cur_look_at = this.camera_look_at
        // let target_look_at = this.player.position
        let target_look_at = this.player.position.plus(V3(-0.3,0,1))
        let l_look_at = 0.25
        this.camera_look_at = cur_look_at.plus(target_look_at.minus(cur_look_at).times(Math.min(1, delta_t / l_look_at)))

        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                final_camera_pos,
                // this.player.position.plus(V3(-0.15,-1,1)),
                this.camera_look_at,
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
            this.lights[0].intensity = appState.getState(this.MAIN_LIGHT_INTENSITY);
        }

    }


}


