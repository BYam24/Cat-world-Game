import {ABlinnPhongShaderModel} from "../../../../anigraph/rendering/shadermodels";
import {AAppState, AShaderMaterial, AShaderModel, AShaderModelBase, ATexture, Color, GetAppState, Vec3} from "../../../../anigraph";
enum AppStateKeys{
    SURFACE_COLORING = "surfaceColoring",
    USE_VIEWLIGHT = "useViewLight",
    OUTLINE_WIDTH = "outlineWidth",
    LEVELS = "levels"
}

export class ToonShaderModel extends ABlinnPhongShaderModel {
    static AddAppState(){
        let appState = GetAppState();
        super.AddAppState();
        appState.addControlSpecGroup("CustomLoadedShader",
            {
                SurfaceColoring: appState.CreateControlPanelSliderSpec(AppStateKeys.SURFACE_COLORING, 1.0, 0.0, 1.0, 0.01),
                UseViewLight: appState.CreateControlPanelCheckboxSpec(AppStateKeys.USE_VIEWLIGHT, true),
                OutlineWidth: appState.CreateControlPanelSliderSpec(AppStateKeys.OUTLINE_WIDTH, 0.02, 0, 1, 0.005),
                Levels: appState.CreateControlPanelSliderSpec(AppStateKeys.LEVELS, 2.0, 1.0, 10.0, .2)
            }
        )

        appState.setState("time", 0);
    }

    /**
     * Here we are creating the model, which represents the shader program itself. You can think of this as a material
     * factory, i.e., it creates materials that are compiled instances of the shader program.
     * @param shaderName
     * @param args
     * @returns {Promise<ShaderDemoShaderModel>}
     * @constructor
     */
    static async CreateModel(shaderName?:string, ...args:any[]){
        if(shaderName === undefined){
            shaderName = "toonshader";
        }
        await AShaderModel.ShaderSourceLoaded(shaderName);

        let model = new this(shaderName, ...args);
        // model.usesLights=true;
        model.usesVertexColors=true;
        return model;
    }
    /**
     * When you create an instance of this material, you need to attach the corresponding shader uniforms to the
     * app state we have created.
     * @param args
     * @returns {AShaderMaterial}
     * @constructor
     */
    CreateMaterial(...args:any[]){
        let appState = GetAppState();
        let mat = super.CreateMaterial();
        mat.attachUniformToAppState(AppStateKeys.SURFACE_COLORING, AppStateKeys.SURFACE_COLORING);
        mat.attachUniformToAppState(AppStateKeys.USE_VIEWLIGHT, AppStateKeys.USE_VIEWLIGHT);
        mat.attachUniformToAppState(AppStateKeys.OUTLINE_WIDTH, AppStateKeys.OUTLINE_WIDTH);
        mat.attachUniformToAppState(AppStateKeys.LEVELS, AppStateKeys.LEVELS);

        // Note that we could also remove one of the lines above and instead set the uniform on a per-instance basis.
        // Every node typically has its own material instance (the output of this function)
        // you can set individual uniformvalues like so:

        // generic
        // mat.setUniform("nameInShader", value)

        // a vec3 uniform in the shader
        // mat.setUniform3fv("uniformName", new Vec3(1,2,3))

        // a vec4 uniform in the shader
        // mat.setUniform4fv("uniformName", new Vec4(1,2,3,4))

        // a color uniform in the shader. Here we set it to green with alpha=0.8
        // mat.setUniformColor("uniformName", new Color(0.0,1.0,0.0), 0.8);

        return mat;
    }
}