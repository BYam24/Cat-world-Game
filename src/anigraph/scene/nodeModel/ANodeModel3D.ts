import {Mat3, Mat4, NodeTransform3D, TransformationInterface} from "../../math";
import {VertexArray3D, BoundingBox2D, BoundingBox3D, HasBounds} from "../../geometry";
import {ANodeModelSubclass} from "./NodeModelSubclass";
import {ASerializable} from "../../base";
import {ANodeTransformModel2D} from "./ANodeTransformModel2D";

@ASerializable("ANodeModel3D")
export class ANodeModel3D extends ANodeModelSubclass<NodeTransform3D, VertexArray3D> implements HasBounds {
    constructor(verts?:VertexArray3D, transform?:NodeTransform3D, ...args:any) {
        super(verts, transform);
        this._setVerts(new VertexArray3D());
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds(): BoundingBox3D {
        return this.getBounds3D();
    }

    get zValue(){
        return this.transform.getPosition().z;
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox2D}
     */
    getBounds2D(): BoundingBox2D {
        let tpoint = new VertexArray3D()
        tpoint.position = this.verts.position.GetTransformedByMatrix(this.transform.getMatrix());
        return tpoint.getBounds().getBoundsXY();
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds3D(): BoundingBox3D {
        // let b = this.verts.getBounds();
        let b = this.geometry.getBounds()
        b.transform = this.transform.getMat4();
        return b;
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBoundsXY(): BoundingBox2D {
        return this.getBounds3D().getBoundsXY();
    }

    setTransformToIdentity(){
        // this._transform = Mat4.Identity();
        this._transform = new NodeTransform3D();
    }

    setTransform(transform: TransformationInterface): void {
        if(transform instanceof NodeTransform3D){
            this._transform = transform;
        }else {
            this._transform = NodeTransform3D.FromPoseMatrix(transform.getMat4())
        }
    }

    /**
     * Returns the transform from object coordinates (the coordinate system where this.verts is
     * defined) to world coordinates
     * @returns {TransformType}
     */
    getWorldTransform():Mat4{
        let parent = this.parent;
        if(parent && parent instanceof ANodeModelSubclass){
            return parent.getWorldTransform().getMat4().times(this.transform.getMat4());
        }else{
            return this.transform.getMat4();
        }
    }

}



