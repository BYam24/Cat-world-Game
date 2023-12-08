import { ExampleSceneController } from "../ExampleSceneController";
import { Color, Mat3, V3 } from "../../../../anigraph";
import { Example1SceneModel } from "./Example1SceneModel";
import { DirectionalParticleSystemModel } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemModel";
import { DirectionalParticleSystemView } from "../../Nodes/MyParticleSystem/DirectionalParticleSystemView";



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
    }

    async initScene(): Promise<void> {
        await super.initScene()
        this.initSkyBoxCubeMap();
        this.setClearColor(Color.Black());
    }

    initInteractions() {
        super.initInteractions();
        this.initExampleInteractions();


    }

}




