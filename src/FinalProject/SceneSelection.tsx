import {ClassInterface} from "../anigraph";
import {MainSceneModel} from "./Main/Scene/MainSceneModel";
import {MainSceneController} from "./Main/Scene/MainSceneController";

import {ABasicSceneController, ABasicSceneModel} from "../anigraph/starter";
import {ExampleApps} from "./Examples"

export let SceneModel:ABasicSceneModel;
export let SceneControllerClass:ClassInterface<ABasicSceneController>;


const enum Scenes{
    Main="Main", // This example is an empty scene. Room to fill with your hopes and dreams...
    Example0="Example0",
    Example1="Example1",
    Example2="Example2",
    Example3="Example3",
    ShaderDemo="ShaderDemo",
}

// let SceneSelection:Scenes = Scenes.Main; // This example is an empty scene. Room to fill with your hopes and dreams...
// let SceneSelection:Scenes = Scenes.Example0;
let SceneSelection:Scenes = Scenes.Example1;
// let SceneSelection:Scenes = Scenes.Example2;
// let SceneSelection:Scenes = Scenes.Example3;
// let SceneSelection:Scenes = Scenes.ShaderDemo;



switch (SceneSelection) {
    // @ts-ignore
    case Scenes.Main:
        SceneModel = new MainSceneModel();
        SceneModel.name = "My Awesome App"
        SceneControllerClass = MainSceneController;
        break
    // @ts-ignore
    case Scenes.Example0:
        SceneModel = new ExampleApps.Example0SceneModel();
        SceneModel.name = "Example 0"
        SceneControllerClass = ExampleApps.Example0SceneController;
        break
    // @ts-ignore
    case Scenes.Example1:
        SceneModel = new ExampleApps.Example1SceneModel();
        SceneModel.name = "Example 1"
        SceneControllerClass = ExampleApps.Example1SceneController;
        break
    // @ts-ignore
    case Scenes.Example2:
        SceneModel = new ExampleApps.Example2SceneModel();
        SceneModel.name = "Example 2"
        SceneControllerClass = ExampleApps.Example2SceneController;
        break
    // @ts-ignore
    case Scenes.Example3:
        SceneModel = new ExampleApps.Example3SceneModel();
        SceneModel.name = "Example 2"
        SceneControllerClass = ExampleApps.Example3SceneController;
        break
    // @ts-ignore
    case Scenes.ShaderDemo:
        SceneModel = new ExampleApps.ShaderDemoSceneModel();
        SceneModel.name = "Shader Demo"
        SceneControllerClass = ExampleApps.ShaderDemoSceneController;
        break
    default:
        console.warn(`Unrecognized Scene ${SceneSelection}!`)
        SceneModel = new MainSceneModel();
        SceneModel.name = "My Awesome App"
        SceneControllerClass = MainSceneController;
        break

}
