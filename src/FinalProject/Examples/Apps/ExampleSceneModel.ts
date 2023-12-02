import {BaseSceneModel, CharacterInterface, CharacterModel, CharacterModelInterface} from "../../HelperClasses";
import {
    BillboardParticleSystemModel,
    BotModel,
    ExampleLoadedCharacterModel, ExampleParticleSystemModel,
    ExampleThreeJSNodeModel,
    PlayerModel, SphereParticle,
    TerrainModel,
    TriangleMeshCharacterModel
} from "../Nodes";
import {
    AInteractionEvent,
    AModel,
    AppState, AShaderMaterial, AShaderModel,
    ATexture, ATriangleMeshModel,
    Color,
    GetAppState,
    NodeTransform3D,
    Particle3D,
    V3,
    Vec2,
    Vec3
} from "../../../anigraph";

const N_CAT_TEXTURES = 6;

enum TEXTURES{
    TERRAIN="ground01",
}

export abstract class ExampleSceneModel extends BaseSceneModel {
    /**
     * Our custom terrain model
     */
    terrain!:TerrainModel;
    /**
     * An array of bots...
     */
    bots:BotModel[]=[];

    /**
     * Our custom player model. We will use getters and setters to access to make the player feel special...
     * Actually, it's to support more flexible subclassing behavior, but let's let the player *think* it's because they
     * are special...
     */
    _player!:CharacterModelInterface;
    get player():CharacterModel{
        return this._player as CharacterModel;
    }
    set player(v:CharacterModel){
        this._player = v;
    }

    //###############################################--Example asset loading--###############################################

    async loadBotTexture(i:number){
        await this.loadTexture(`./images/catfaces/catface0${i + 1}.jpeg`, `cat${i}`)
    }

    getBotTexture(i:number){
        return this.getTexture(`cat${i}`);
    }

    /**
     * This function would be called from inside a PreloadAssets() function:
     * ```await this.LoadExampleAssets();```
     * @returns {Promise<void>}
     * @constructor
     */
    async LoadExampleModelClassShaders() {

        /**
         * Some custom models can have their own shaders (see implementations for details)
         * Which we can load to the model class.
         */
        await TerrainModel.LoadShaderModel();
        await CharacterModel.LoadShaderModel();
        await ExampleParticleSystemModel.LoadShaderModel();
        await BillboardParticleSystemModel.LoadShaderModel();
    }

    async LoadExampleTextures(){
        /**
         * Let's load some example textures
         */
        await this.loadTexture("./images/gradientParticle.png", "particle")
        await this.loadTexture("./images/tanktexburngreen.jpeg", "tank")
        await this.loadTexture( "./images/terrain/ground01.jpeg", "ground01")
        for(let i=0;i<N_CAT_TEXTURES;i++){
            await this.loadBotTexture(i)
        }
        // await ExampleParticleSystemModel.LoadShaderModel();
        // this.materials.setMaterialModel("textured", await ABasicShaderModel.CreateModel("basic"));
    }

    //###############################################//--Load The Dragon!--\\###############################################
    //<editor-fold desc="Load The Dragon!">
    async LoadTheDragon(){
        let makeDragonPointDownYAxis = NodeTransform3D.RotationX(Math.PI*0.5);
        await this.load3DModel("./models/ply/dragon.ply", "dragon", makeDragonPointDownYAxis);
    }
    //</editor-fold>


    //#####################################//--Loading and using the cat model (3D model with texture)--\\#####################################
    //<editor-fold desc="Loading and using the cat model (3D model with texture)">
    /**
     * First let's declare some instance attributes we will use to keep track of the cat assets.
     * Normally we would do this at the top of the class definition, but we're putting them here to associate them
     * with the rest of the cat-model-related content.
     */
    static CAT_MODEL_STRING_IDENTIFIER:string="CatModel"; // we will use this to keep track of the 3D model and texture
    catModelMaterial!:AShaderMaterial;

    /**
     * Here we are going to load a 3D cat model and corresponding cat texture.
     * @returns {Promise<void>}
     * @constructor
     */
    async LoadTheCat(){
        let appState=GetAppState();
        /**
         *
         *
         * Let's start by loading the 3D model. We will use one defined as a .glb file, which you can export from blender by
         * exporting a mesh as a gltf format. We can also provide a transform that will be applied to the model geometry
         * when it is loaded, which is useful when the model was built with inconvenient choice of default scale or
         * orientation. Finally, we will load a texture that comes with the model as well.
         */
        let catTransform = NodeTransform3D.FromPositionZUpAndScale(V3(), Vec3.UnitZ().times(1), Vec3.UnitY().times(-1), 0.02);
        await this.load3DModel("./models/gltf/cat.glb", ExampleSceneModel.CAT_MODEL_STRING_IDENTIFIER, catTransform);

        /**
         * Load the texture atlas. The uv coordinates on our model are specified relative to this atlas.
         */
        await this.loadTexture("./models/gltf/Cat_diffuse.jpg", ExampleSceneModel.CAT_MODEL_STRING_IDENTIFIER)
    }

    /**
     * Create and return a cat model
     * @returns {LoadedCharacterModel}
     * @constructor
     */
    CreateCatModel(){
        if(!this.get3DModel(ExampleSceneModel.CAT_MODEL_STRING_IDENTIFIER)){
            throw new Error("You need to load the cat assets using LoadTheCat() in PreloadAssets!")
        }

        /**
         * Let's start by creating an instance of our material
         */
        let catMaterial = CharacterModel.CreateMaterial();

        /**
         * We will set the sampler2D called "xxxMap" using setTexture("xxx", aTextureInstance)
         * Here we will set the diffuse texture listed as "diffuseMap" in our shader to our texture atlas
         */
        catMaterial.setTexture("diffuse", this.getTexture(ExampleSceneModel.CAT_MODEL_STRING_IDENTIFIER))

        // optionally use vertex colors for your model. don't need them for the cat model (we get color from texture)
        // catMaterial.usesVertexColors=true;

        return ExampleLoadedCharacterModel.Create(
            this.get3DModel(ExampleSceneModel.CAT_MODEL_STRING_IDENTIFIER),
            catMaterial
        )
    }
    //</editor-fold>





    //###############################################//--Some custom Bot objects--\\###############################################
    //<editor-fold desc="Some custom Bot objects">
    addBotHierarchy(){
        if(!this.terrain){
            throw new Error("Must initialize terrain before adding bot hierarchy... they need something to stand on.")
        }

        /**
         * Let's create a bunch of bots with different cat faces...
         * Here we will make each one a child of the last.
         */
        let parent:AModel = this;
        for(let e=0;e<6; e++) {
            let bot = BotModel.Create(this.getBotTexture(e));
            bot.position = new Vec3((Math.random() - 0.5) * this.terrain.width, (Math.random() - 0.5) * this.terrain.height, 0);
            bot.mass = 50;
            this.bots.push(bot);
            parent.addChild(bot);
            parent = bot;
        }
    }
    //</editor-fold>


    initCamera(...args:any[]) {
        const appState = GetAppState();
        this.initPerspectiveCameraFOV(0.5*Math.PI, 1.0)

        // We will set the camera based on a location, direction, and up vector
        // let cameraPose = NodeTransform3D.LookAt(V3(0,0,1), V3(), V3(0,1,0));
        // this.camera.setPose(cameraPose);
    }

    initTerrain(texture_name?:string){
        let appState = GetAppState();
        let terrainScaleX= appState.globalScale*10.0;
        let terrainScaleY= appState.globalScale*10.0;
        let terrainTextureWidth = 128;
        let terrainTextureHeight = 128;
        let terrainTextureWrapX = 15.0;
        let terrainTextureWrapY = 15.0;

        this.terrain = TerrainModel.Create(
            this.getTexture(texture_name??"ground01"), // texture
            terrainScaleX, // scaleX
            terrainScaleY, // scaleY
            terrainTextureWidth, // number of vertices wide
            terrainTextureHeight, // number of vertices tall
            undefined, // transform for terrain, identity if left blank
            terrainTextureWrapX, // number of times texture should wrap across surface in X
            terrainTextureWrapY, // number of times texture should wrap across surface in Y
        );
        this.addChild(this.terrain);
    }

    /**
     * Adds a very basic rgb triangle for testing / debugging purposes
     */
    addDebugTriangle(){
        let model = ATriangleMeshModel.Create(false,
            false,
            true);
        let material = GetAppState().materials.createRGBAShaderMaterial();
        model.setMaterial(material);
        model.verts.addVertex(V3(), undefined, undefined, Color.FromRGBA(1.0, 0.0, 0.0, 1.0));
        model.verts.addVertex(V3(1, 1,0), undefined, undefined, Color.FromRGBA(0.0, 1.0, 0.0, 1.0));
        model.verts.addVertex(V3(1, 0,0), undefined, undefined, Color.FromRGBA(0.0, 0.0, 1.0, 1.0));
        model.verts.indices.push([0,1,2])
        this.addChild(model);
    }

    addExampleThreeJSNodeModel(){
        this.addChild(new ExampleThreeJSNodeModel());
    }


    addBotsInHierarchy(){
        /**
         * Then we will create a bunch of bots with different cat faces...
         * Let's make each one a child of the last.
         */
        let parent:AModel = this;
        for(let e=0;e<6; e++) {
            let bot = BotModel.Create(this.getBotTexture(e));
            bot.position = new Vec3((Math.random() - 0.5) * this.terrain.width, (Math.random() - 0.5) * this.terrain.height, 0);
            bot.mass = 50;
            this.bots.push(bot);
            parent.addChild(bot);
            parent = bot;
        }
    }

    /**
     * Initialized a tank player and adds it to the scene
     * @param texture
     */
    initTankPlayer(texture?:ATexture){
        /**
         * First we will initialze the player and add it to the scene.
         */
        this.player = PlayerModel.Create(texture??this.getTexture("tank"));
        this.addChild(this.player);
    }

    initDragonPlayer(material?:AShaderMaterial){
        let playerMaterial =material?? CharacterModel.CreateMaterial();
        playerMaterial.usesVertexColors=true;
        this.player = ExampleLoadedCharacterModel.Create(
            this.get3DModel("dragon"),
            playerMaterial
        );
        this.addChild(this.player)
    }

    initCatPlayer(){
        this.player = this.CreateCatModel();
        this.addChild(this.player);
    }

    CreateExampleBasicParticleSystem(n:number){
        /**
         * Now an example particle system.
         */
        let particles = new ExampleParticleSystemModel();
        particles.orbitRadius = 0.3;
        let radius = 0.05;
        for(let i=0;i<n;i++) {
            particles.addParticle(new SphereParticle(undefined, undefined, radius));
        }
        return particles;
    }

    addExampleThreeJSNode(){
        this.addChild(new ExampleThreeJSNodeModel());
    }


    CreateBilboardParticleSystem(nParticles:number){
        // BillboardParticleSystemModel.AddParticleSystemControls();
        /**
         * And now let's create our particle system
         */

        let billboardParticles = BillboardParticleSystemModel.Create(nParticles, this.getTexture("particle"));
        return billboardParticles
    }

    addExampleBilboardParticleSystem(nParticles:number=50){
        this.addChild(this.CreateBilboardParticleSystem(nParticles))
    }

    timeUpdateOrbitBots(t:number, ...args:any[]) {
        /**
         * For interactions between models, we can trigger logic here. For example, if you want characters to walk on
         * uneven terrain, you can make that happen by completing the functions used here:
         */
        const self = this;
        function adjustHeight(character:Particle3D){
            let height = self.terrain.getTerrainHeightAtPoint(character.position.xy);
            if(character.position.z<height){character.position.z = height;}
        }

        /**
         * Here we would apply our adjust height function to the player
         */
        adjustHeight(this.player);

        /**
         * Now lets update bots
         */
        let orbitradius = 0.25;
        for(let ei=0;ei<this.bots.length;ei++){
            let e = this.bots[ei];

            /**
             * Characters have velocity and mass properties in case you want to implement particle physics
             * But for now we will just have them orbit each other.
             */
            e.position = new Vec3(Math.cos(t*(ei+1)), Math.sin(t*(ei+1)),0).times(orbitradius);

            /**
             * adjust their height
             */
            adjustHeight(e);
        }
    }

    timeUpdateDescendants(t:number, ...args:any[]) {
        /**
         * We can call timeUpdate on all of the model nodes in the scene here, which will trigger any updates that they
         * individually define.
         */
        for(let c of this.getDescendantList()){
            c.timeUpdate(t);
        }
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


