import {
    AInteractionEvent,
    AObject3DModelWrapper,
    AppState,
    AShaderMaterial,
    NodeTransform3D,
    Quaternion,
    V3,
    Vec2
} from "src/anigraph";
import { ExampleLoadedCharacterModel, ExampleParticleSystemModel } from "../../Nodes";
import { ExampleSceneModel } from "../ExampleSceneModel";
import {ABlinnPhongShaderModel} from "../../../../anigraph/rendering/shadermodels";


export class Example3SceneModel extends ExampleSceneModel {
    initAppState(appState: AppState) {
        ABlinnPhongShaderModel.AddAppState();
    }

    async PreloadAssets() {
        await super.PreloadAssets();
        await super.LoadBasicShaders();
        await super.LoadExampleTextures();
        await super.LoadExampleModelClassShaders();
        await this.LoadTheDragon();
    }


    initCamera() {
        super.initCamera();
        // the ground is the xy plane
        this.camera.setPose(NodeTransform3D.LookAt(V3(0,0,1), V3(), V3(0,1,0)));
    }

    initCharacters(){
        this.initDragonPlayer();
        ABlinnPhongShaderModel.attachMaterialUniformsToAppState(this.player.material)
    }


    initScene() {
        this.addViewLight();
        this.initTerrain();
        this.initCharacters();
    }

    /**
     * We update the scene here
     * @param t
     * @param args
     */
    timeUpdate(t?: number, ...args:any[]) {
        t = t??this.clock.time;
        super.timeUpdateDescendants(t);

    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


