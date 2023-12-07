import {
    ACamera,
    ACameraModel,
    AInteractionEvent, ANodeModel3D,
    AObject3DModelWrapper,
    AppState,
    AShaderMaterial, ATriangleMeshModel, GetAppState, Mat4, NodeTransform,
    NodeTransform3D,
    Quaternion,
    UnitQuadModel, V2,
    V3,
    Vec2, VertexArray3D
} from "src/anigraph";
import { ExampleLoadedCharacterModel, ExampleParticleSystemModel } from "../../Nodes";
import { ExampleSceneModel } from "../ExampleSceneModel";
import {ABlinnPhongShaderModel} from "../../../../anigraph/rendering/shadermodels";
import {ARenderTarget} from "../../../../anigraph/rendering/multipass/ARenderTarget";


const VirtualScreenCameraIsMovingAppStateKey:string="MoveVirtualScreenCamera"
const FlipVirtualScreenCameraAppStateKey:string="FlipVirtualScreenCamera"

export class Example2SceneModel extends ExampleSceneModel {
    textureRenderTarget!:ARenderTarget

    /**
     * This will be the virtual screen / mirror / window that we render our texture onto.
     * @type {ANodeModel3D}
     */
    virtualScreen!:ATriangleMeshModel;

    /**
     * This will control where we render our virtual screen image from
     * @type {ACamera}
     */
    virtualScreenCamera!:ACameraModel;

    /**
     * This is the material we will use to render our virtual screen
     * @type {AShaderMaterial}
     */
    virtualScreenMaterial!: AShaderMaterial;
    virtualScreenCameraIsMoving:boolean=false;
    virtualScreenCameraIsFlipped:boolean=false;



    initAppState(appState: AppState) {
        ABlinnPhongShaderModel.AddAppState();
        appState.addCheckboxControl(VirtualScreenCameraIsMovingAppStateKey, false);
        appState.addCheckboxControl(FlipVirtualScreenCameraAppStateKey, false);
    }

    async PreloadAssets() {
        await super.PreloadAssets();
        await super.LoadBasicShaders();
        await super.LoadExampleTextures();
        await super.LoadExampleModelClassShaders();
        await this.LoadTheDragon();
        let appState = GetAppState();

        /**
         * Load a custom shader. We will use this when we render our texture to the screen
         */
        await appState.loadShaderMaterialModel("postprocessing");
        this.virtualScreenMaterial = appState.CreateShaderMaterial("postprocessing");

        /**
         * Add a slider to control one of our uniforms
         */
        appState.addSliderIfMissing("sliderValue", 0,-1,1,0.01);
        this.virtualScreenMaterial.attachUniformToAppState("sliderValue", "sliderValue")

    }



    initCamera() {
        super.initCamera();
        // the ground is the xy plane
        this.camera.setPose(NodeTransform3D.LookAt(V3(-0.05,0.5,0.2), V3(0,0,0.1), V3(0,0,1)));

        /**
         * We will create a virtual camera to render our virtual screen's viewpoint from
         * @type {ACameraModel}
         */
        this.virtualScreenCamera = new ACameraModel(ACamera.CopyOf(this.camera));
        // this.addChild(this.virtualScreenCamera);
        this.cameraModel.addChild(this.virtualScreenCamera);

        const self = this;
        this.subscribeToAppState(VirtualScreenCameraIsMovingAppStateKey, (v:boolean)=>{
            if(v) {
                self.virtualScreenCameraIsMoving=true;
            }else{
                self.virtualScreenCameraIsMoving=false;

                /**
                 * We will reset the virtual screen camera's pose to the identity so that it is the same as our main
                 * camera (because it is a child of our main camera)
                 */
                self.virtualScreenCamera.setPose(new NodeTransform3D());
            }
        })

        this.subscribeToAppState(FlipVirtualScreenCameraAppStateKey, (v:boolean)=>{
            self.virtualScreenCameraIsFlipped=v;
            if(v){
                self.virtualScreenCamera.setProjection(self.virtualScreenCamera.projection.times(Mat4.Scale3D(V3(1.0,-1.0,1.0))));
            }else{
                self.virtualScreenCamera.setProjection(self.camera.projection);

            }
        })



    }

    initCharacters(){
        this.initDragonPlayer();
        ABlinnPhongShaderModel.attachMaterialUniformsToAppState(this.player.material)
    }

    /**
     * This will create textured quad geometry with texture coordinates where the x axis has been flipped / mirrored
     * @param scale
     * @returns {VertexArray3D}
     */
    createFlippedTexturedQuadGeometry(scale?:number){
        scale = scale??1.0;
        let verts = VertexArray3D.CreateForRendering(false, true);
        // Add a vertex for each corner of a square
        verts.addVertex(V3(-1,-1,0).times(scale),undefined, V2(1,0))
        verts.addVertex(V3(1,-1,0).times(scale),undefined, V2(0,0))
        verts.addVertex(V3(1,1,0).times(scale),undefined, V2(0,1))
        verts.addVertex(V3(-1,1,0).times(scale),undefined, V2(1,1))

        //make two triangles by connecting corners 012 and corners 230
        verts.addTriangleIndices(0,1,2);
        verts.addTriangleIndices(2,3,0);
        return verts;
    }


    initScene() {
        this.addViewLight();
        this.initTerrain();
        this.initCharacters();

        /**
         * We will create a big quad to use as our virtual screen
         * @type {ATriangleMeshModel}
         */
        this.virtualScreen =new ATriangleMeshModel();
        this.virtualScreen.setVerts(this.createFlippedTexturedQuadGeometry());
        this.virtualScreen.setMaterial(this.virtualScreenMaterial);
        this.virtualScreen.setTransform(new NodeTransform3D(V3(0,-0.75,0.0), Quaternion.RotationX(Math.PI*0.5)));
        this.addChild(this.virtualScreen);
    }

    /**
     * A hook for our controller to call before it renders the first passs
     * @param target
     * @param args
     */
    prepForFirstPass(target?:ARenderTarget, ...args:any[]){
        this.virtualScreenMaterial.setTexture("input", target?target.targetTexture:undefined);
    }

    /**
     * A hook for our controller to call before it renders the second passs
     * @param target
     * @param args
     */
    prepForSecondPass(target:ARenderTarget, ...args:any[]){
        this.virtualScreenMaterial.setTexture("input", target.targetTexture);
    }

    /**
     * We update the scene here
     * @param t
     * @param args
     */
    timeUpdate(t?: number, ...args:any[]) {
        t = t??this.clock.time;
        super.timeUpdateDescendants(t);

        if(this.virtualScreenCameraIsMoving){
            this.virtualScreenCamera.setPose(new NodeTransform3D(
                V3(Math.sin(t)*0.22, 0, 0)
            ))
        }

    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


