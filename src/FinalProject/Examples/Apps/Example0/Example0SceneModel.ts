/**
 * @file Main scene model
 * @description Scene model for your application
 */

import {
    AInteractionEvent,
    AppState, ATriangleMeshModel,
    GetAppState, NodeTransform3D,
    V2,
    V3,
    V4,
    Vec2, VertexArray3D
} from "../../../../anigraph";
import {ExampleSceneModel} from "../ExampleSceneModel";
import {BillboardParticleSystemModel, ExampleParticleSystemModel} from "../../Nodes";
import {UpdateGUIJSX, UpdateGUIWithBots} from "../../GUIHelpers";

export class Example0SceneModel extends ExampleSceneModel {
    playerParticleSystemModel!:ExampleParticleSystemModel;

    initAppState(appState: AppState): void {
        BillboardParticleSystemModel.AddParticleSystemControls();

        /**
         * Here we will specify functions that determine what is displayed in the react gui part of our webpage
         */
        appState.setReactGUIContentFunction(UpdateGUIJSX);
        appState.setReactGUIBottomContentFunction(UpdateGUIWithBots);
    }

    async PreloadAssets() {
        await super.PreloadAssets();
        await this.LoadExampleModelClassShaders()
        await this.LoadExampleTextures();

        /**
         * For the cursor
         */
        await this.LoadSimpleTextureShader();
        await this.LoadCursorTexture();
    }

    initCamera(...args:any[]) {
        super.initCamera();

        // the ground is the xy plane
        this.camera.setPose(
            NodeTransform3D.LookAt(V3(0,0,1), V3(), V3(0,1,0))
        );
    }

    initScene() {
        let appState = GetAppState();

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
         * initialize characters
         */
        this.initCharacters();


        /**
         * Let's add the cursor model but keep it invisible until an appropriate mode is activated
         * @type {boolean}
         */
        this.initCursorModel();
        this.cursorModel.visible = false;


        /**
         * Add an example bilboard particle system starter
         */
        // this.addExampleBilboardParticleSystem()
        // this.addExampleThreeJSNodeModel();
    }



    initCharacters(){
        this.initTankPlayer();
        this.addBotsInHierarchy()

        /**
         * Let's add our basic particle system to the player
         */
        this.playerParticleSystemModel = this.CreateExampleBasicParticleSystem(3);
        this.player.addChild(this.playerParticleSystemModel);
    }

    timeUpdate(...args:any[]) {
        let t: number = this.clock.time;

        /**
         * Call the timeUpdate function of all the node models in the scene
         */
        this.timeUpdateDescendants(t);

        /**
         * Update the bots
         */
        this.timeUpdateOrbitBots(t);


        /**
         * Update stuff here
         */

        /**
         * Optionally update the React GUI every frame
         */
        GetAppState().updateComponents();

    }


    onClick(event:AInteractionEvent){
        console.log(event);
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


