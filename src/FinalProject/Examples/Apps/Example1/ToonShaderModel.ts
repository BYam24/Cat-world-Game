import {ABlinnPhongShaderModel} from "../../../../anigraph/rendering/shadermodels";
import {
    AAppState,
    AShaderMaterial,
    AShaderModel,
    AShaderModelBase,
    ATexture,
    BlinnPhongDefaults,
    Color,
    GetAppState,
    Vec3
} from "../../../../anigraph";
enum AppStateKeys{
    AMBIENT = "ambient",
    DIFFUSE = "diffuse",
    SURFACE_COLORING = "surfaceColoring",
    OUTLINE_WIDTH = "outlineWidth",
    COSMIC_CAT = "cosmicCat",
    OUTLINE_COLOR = "outlineColor",
    LEVELS = "levels"
}

export class ToonShaderModel extends ABlinnPhongShaderModel {
    static AddAppState(){
        super.AddAppState();

        let appState = GetAppState();
        appState.addControlSpecGroup("ToonShader",
            {
                Ambient: appState.CreateControlPanelSliderSpec(AppStateKeys.AMBIENT, 1.0, 0.0, 2.0, 0.05),
                Diffuse : appState.CreateControlPanelSliderSpec(AppStateKeys.DIFFUSE, .4, 0.0, 1.0, 0.001),
                OutlineWidth: appState.CreateControlPanelSliderSpec(AppStateKeys.OUTLINE_WIDTH, -0.5, -1, 0, 0.01),
                CosmicCat: appState.CreateControlPanelCheckboxSpec(AppStateKeys.COSMIC_CAT, false),
                OutlineColor: appState.CreateControlPanelColorPickerSpec(AppStateKeys.OUTLINE_COLOR, Color.Blue()),
                Levels: appState.CreateControlPanelSliderSpec(AppStateKeys.LEVELS, 3.0, 1.0, 10.0, .5)
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
        mat.attachUniformToAppState(AppStateKeys.AMBIENT, AppStateKeys.AMBIENT);
        mat.attachUniformToAppState(AppStateKeys.DIFFUSE, AppStateKeys.DIFFUSE);
        mat.attachUniformToAppState(AppStateKeys.SURFACE_COLORING, AppStateKeys.SURFACE_COLORING);
        mat.attachUniformToAppState(AppStateKeys.OUTLINE_WIDTH, AppStateKeys.OUTLINE_WIDTH);
        mat.attachUniformToAppState(AppStateKeys.OUTLINE_COLOR, AppStateKeys.OUTLINE_COLOR);
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