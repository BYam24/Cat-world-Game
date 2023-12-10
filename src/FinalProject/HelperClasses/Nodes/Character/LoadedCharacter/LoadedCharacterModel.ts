import {ALoadedModel} from "../../../../../anigraph/scene/nodes/loaded/ALoadedModel";
import {AMaterial, AObject3DModelWrapper, ASerializable, ATexture, Color, V3, Vec3} from "../../../../../anigraph";
import {CharacterModelInterface} from "../CharacterModel";
import {CharacterMaterial} from "../CharacterShaderModel";
import * as THREE from "three";

@ASerializable("LoadedCharacterModel")
export class LoadedCharacterModel extends ALoadedModel implements CharacterModelInterface{
    mass:number=1;
    velocity:Vec3 = V3();
    dig:boolean = false;
    fire: boolean =false;

    dig_type:number = 0;

    get position(){
        return this.transform.position;
    }
    set position(value:Vec3){
        this.transform.position = value;
    }

    get worldPosition(){
        return this.getWorldTransform().getPosition();
    }

    _characterColor!:Color;
    /** Get set characterColor */
    getCharacterColor(){
        return this._characterColor;
    }
    setCharacterColor(c:Color){
        this._characterColor = c;
        (this.material as CharacterMaterial).setCharacterColor(c);
    }

    static Create(loaded3DModel:THREE.Object3D|AObject3DModelWrapper, material?:AMaterial, ...args:any[]){
        let newmodel = new this(loaded3DModel, material, ...args);
        return newmodel;
    }

}
