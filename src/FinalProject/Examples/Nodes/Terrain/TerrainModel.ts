import {ATerrainModel} from "../../../../anigraph/scene/nodes/terrain/ATerrainModel";
import {
    ASerializable, assert, BlinnPhongShaderAppState,
    CreatesShaderModels, SeededRandom, Vec2
} from "../../../../anigraph";
import {TerrainShaderModel} from "./TerrainShaderModel";
import type {TransformationInterface} from "../../../../anigraph";
import {ATexture} from "../../../../anigraph/rendering/ATexture";
import {ADataTextureFloat1D} from "../../../../anigraph/rendering/image";
import * as THREE from "three";
import {makeNoise2D} from "fast-simplex-noise";
import {BlinnPhongMaterial} from "../../../../anigraph/rendering/shadermodels";



@ASerializable("TerrainModel")
export class TerrainModel extends ATerrainModel{

    useDataTexture:boolean=true;

    /**
     * Reusable instance of the shader model, which is a factory for creating shader materials
     */
    static ShaderModel:TerrainShaderModel;

    /**
     * Function to load the shader
     */
    static async LoadShaderModel(...args:any[]){
        this.ShaderModel = await TerrainShaderModel.CreateModel("terrain")
    }


    textureWrapX:number=5;
    textureWrapY:number=5;

    constructor(
        width?:number,
        height?:number,
        widthSegments?:number,
        heightSegments?:number,
        transform?:TransformationInterface,
        textureWrapX?:number,
        textureWrapY?:number
        ) {
        super(width, height, widthSegments, heightSegments, transform);
        if(textureWrapX!==undefined){this.textureWrapX = textureWrapX;}
        if(textureWrapY!==undefined){this.textureWrapY=textureWrapY;}
    }

    getTerrainHeightAtPoint(p:Vec2){
        //you can access height map pixels using something like this:
        /**
         *  you can access height map pixels using something like this:
         *  this.heightMap.pixelData.getPixelNN(5, 5);
         */
        let uv_pos = this.get_uv_on_texture(p)
        return this.get_uv_height(uv_pos)
    }

    get_uv_height(uv_pos:Vec2){
        let u = Math.floor(uv_pos.x)
        let v = Math.floor(uv_pos.y)
        let alpha = uv_pos.x-u
        let beta = uv_pos.y-v
        let p00 = this.heightMap.pixelData.getPixelNN(u, v)
        let p10 = this.heightMap.pixelData.getPixelNN(u+1, v)
        let p11 = this.heightMap.pixelData.getPixelNN(u+1, v+1)
        let p01 = this.heightMap.pixelData.getPixelNN(u, v+1)
        return this.biliear_interpolation(alpha,beta,p00,p10,p11,p01)
    }

    biliear_interpolation(alpha:number, beta:number,p00:number,p10:number,p11:number,p01:number){
        let t0 = (1-alpha)*p00 + alpha*p10
        let t1 = (1-alpha)*p01 + alpha*p11
        return (1-beta)*t0 + beta*t1
    }

    static Create(
        diffuseMap:ATexture,
        width?:number,
        height?:number,
        widthSegments?:number,
        heightSegments?:number,
        transform?:TransformationInterface,
        wrapTextureX?:number,
        wrapTextureY?:number,
        ...args:any[]){

        assert(TerrainModel.ShaderModel !== undefined, "You need to call TerrainModel.LoadShaderModel() in an async function like PreloadAssets")

        /**
         * Create and initialize the terrain with the provided texture
         */
        let terrain = new this(width, height, widthSegments, heightSegments, transform, wrapTextureX,wrapTextureY);
        terrain.init(diffuseMap);
        return terrain;
    }

    init(diffuseMap:ATexture, useDataTexture?:boolean){

        /**
         * Set the diffuse color map if provided with a texture
         */
        this.diffuseMap = diffuseMap;

        if(useDataTexture!==undefined){
            this.useDataTexture = useDataTexture;
        }

        /**
         * If you want to use a data texture to implement displacement map terrain, create a heightMap data texture.
         * Most recent machines should support this feature, but I haven't verified on all platforms.
         * If it seems to fail, you might set useDataTexture to false by default.
         */
        if(useDataTexture??this.useDataTexture){
            this.heightMap = ADataTextureFloat1D.CreateSolid(this.widthSegments, this.heightSegments, 0.5)
            this.heightMap.setMinFilter(THREE.LinearFilter);
            this.heightMap.setMagFilter(THREE.LinearFilter);
            this.reRollHeightMap();
        }

        let terrainMaterial = TerrainModel.ShaderModel.CreateMaterial(
            this.diffuseMap,
            this.heightMap,
        );

        terrainMaterial.setUniform(BlinnPhongShaderAppState.Diffuse, 0.5);
        this.setMaterial(terrainMaterial);
    }

    /**
     * Can be used to re-randomize height map
     * You may find the code:
     * ```
     * let simplexNoise = makeNoise2D(randomgen.rand);
     * let noiseAtXY = simplexNoise(x, y)
     * ```
     * Useful for generating simplex noise
     *
     * @param seed
     * @param gridResX
     * @param gridResY
     */
    reRollHeightMap(seed?:number, gridResX:number=5, gridResY:number=5){
        for(let y=0;y<this.heightMap.height;y++){
            for(let x=0;x<this.heightMap.width;x++) {
                /**
                 * For the starter code, we are just setting the map to 0
                 */
                this.heightMap.setPixelNN(x, y, 0);
                // this.heightMap.setPixelNN(x, y, Math.sin(2*x)*0.2+Math.sin(2*y)*0.2);
            }
        }
        this.heightMap.setTextureNeedsUpdate();
    }

    /**
     * Can be used to re-randomize height map
     * You may find the code:
     * ```
     * let simplexNoise = makeNoise2D(randomgen.rand);
     * let noiseAtXY = simplexNoise(x, y)
     * ```
     * Useful for generating simplex noise
     *
     * @param seed
     * @param gridResX
     * @param gridResY
     */
    reRollRandomHeightMap(seed?:number, gridResX:number=5, gridResY:number=5){
        for(let y=0;y<this.heightMap.height;y++){
            for(let x=0;x<this.heightMap.width;x++) {
                /**
                 * For the starter code, we are just setting the map to 0
                 */
                this.heightMap.setPixelNN(x, y, Math.random()*0.05);
                // let theta_x = x/this.heightMap.width*2*Math.PI
                // let theta_y= y/this.heightMap.height*2*Math.PI
                // this.heightMap.setPixelNN(x, y, Math.sin(theta_x));
            }
        }
        this.heightMap.setTextureNeedsUpdate();
    }

    get_uv_on_texture(world_pos:Vec2){
        let u = (world_pos.x/(this.width)+0.5)*this.widthSegments
        let v = (world_pos.y/(this.height)+0.5)*this.heightSegments
        return new Vec2(u,v)
    }
    get_cos_height(r:number,depth:number){
        let theta = r*Math.PI/2
        return -Math.cos(theta)*depth
    }


    in_hole_range(r:number){
        return r<1 && r>-1
    }
    dig_hole(world_pos:Vec2, depth = 0.3, radius = 0.5){
        // dig a hole at the world_pos in world coordinate
        let uv_pos = this.get_uv_on_texture(world_pos)
        let r_x = radius/this.width*this.widthSegments
        let r_y = radius/this.height*this.heightSegments
        console.log(this.heightMap.width, this.heightMap.height)
        for(let y=0;y<this.heightMap.height;y++){
            for(let x=0;x<this.heightMap.width;x++) {
                let d_x = (x-uv_pos.x)
                let d_y = (y-uv_pos.y)
                let r = (d_x/r_x)*(d_x/r_x) + (d_y/r_y)*(d_y/r_y)
                if (this.in_hole_range(r)){
                    let height = this.get_cos_height(r,depth);
                    // console.log(x,y)
                    if (height<this.heightMap.pixelData.getPixelNN(x,y)){
                        this.heightMap.setPixelNN(x, y, height);
                    }

                }

            }
        }
        this.heightMap.setTextureNeedsUpdate();
    }


    dig_diamond_hole(world_pos:Vec2, depth = 0.3, radius = 0.5){
        // dig a hole at the world_pos in world coordinate
        let uv_pos = this.get_uv_on_texture(world_pos)
        let r_x = radius/this.width*this.widthSegments
        let r_y = radius/this.height*this.heightSegments
        console.log(this.heightMap.width, this.heightMap.height)
        for(let y=0;y<this.heightMap.height;y++){
            for(let x=0;x<this.heightMap.width;x++) {
                let d_x = (x-uv_pos.x)
                let d_y = (y-uv_pos.y)
                let r = (d_x/r_x)*(d_x/r_x) + (d_y/r_y)*(d_y/r_y)
                if (r_x>d_x && d_x>-r_x && r_y>d_y && d_y>-r_y){
                    let height = -Math.min(1-Math.abs(d_x/r_x), 1-Math.abs(d_y/r_y))*depth;
                    // console.log(x,y)
                    if (height<this.heightMap.pixelData.getPixelNN(x,y)){
                        this.heightMap.setPixelNN(x, y, height);
                    }

                }

            }
        }
        this.heightMap.setTextureNeedsUpdate();
    }


}
