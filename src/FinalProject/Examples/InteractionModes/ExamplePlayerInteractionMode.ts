import {
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent, AKeyboardInteraction, AParticle,
    ASerializable,
    NodeTransform3D, Particle3D, Vec2,
    Vec3, Color,
    AWheelInteraction, GetAppState
} from "../../../anigraph";
import {ABasicSceneController, ASceneInteractionMode} from "../../../anigraph/starter";
import type {HasInteractionModeCallbacks} from "../../../anigraph"
import {Example1SceneModel} from "../Apps";


interface HasPosition3D{
    position:Vec3;
    dig: boolean
    dig_type: number
    fire: boolean
}

@ASerializable("ExamplePlayerInteractionMode")
export class ExamplePlayerInteractionMode extends ASceneInteractionMode{

    /**
     * You may want to define some parameters to adjust the speed of controls...
     */
    mouseMovementSpeed:number=3;
    keyboardMovementSpeed:number=0.25;
    cameraOrbitSpeed:number=3;

    cameraTarget!:HasPosition3D;

    get camera(){
        return this.cameraModel.camera;
    }

    constructor(owner?:ABasicSceneController,
                name?:string,
                interactionCallbacks?:HasInteractionModeCallbacks,
                ...args:any[]) {
        super(name, owner, interactionCallbacks, ...args);
        // this.reset();
    }

    target!:AParticle<Vec3>;

    reset(){
        // You can reset the control mode here
        this.camera.pose = NodeTransform3D.LookAt(
            this.cameraTarget.position.plus(Vec3.UnitZ().times(3)),
            this.cameraTarget.position,
            Vec3.UnitY()
        )
    }

    /**
     * This gets called immediately before the interaction mode is activated. For now, we will call reset()
     * @param args
     */
    beforeActivate(...args:any[]) {
        super.beforeActivate(...args);
        this.reset();
    }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: ABasicSceneController, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        console.log(`Wheel moved! deltaY: ${zoom}`);
    }

    onMouseMove(event:AInteractionEvent, interaction: ADOMPointerMoveInteraction){
        // console.log(`mouse move! ${event}`);
    }

    onKeyDown(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(interaction.keysDownState['w']){
            this.cameraTarget.position.y = this.cameraTarget.position.y+this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['a']){
            this.cameraTarget.position.x = this.cameraTarget.position.x-this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['s']){
            this.cameraTarget.position.y = this.cameraTarget.position.y-this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['d']){
            this.cameraTarget.position.x = this.cameraTarget.position.x+this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['f']){
            this.cameraTarget.dig = true;
            this.cameraTarget.dig_type = 0;
        }
        if(interaction.keysDownState['g']){
            this.cameraTarget.dig = true;
            this.cameraTarget.dig_type = 1;
        }
        if(interaction.keysDownState['h']){
            this.cameraTarget.dig = true;
            this.cameraTarget.dig_type = 2;
        }
        if(interaction.keysDownState['j']){
            this.cameraTarget.dig = true;
            this.cameraTarget.dig_type = 3;
        }
        if(interaction.keysDownState[' ']){
            this.cameraTarget.position.z = this.cameraTarget.position.z+this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['q']){
            this.cameraTarget.fire = true;
        }

        if(event.key=='L' && event.shiftKey){
            (this.owner.model as Example1SceneModel)
             .addLight();
        }

        if(event.key=='R' && event.shiftKey){
            (this.owner.model as Example1SceneModel)
                .removeLastLight();
        }

    }

    onKeyUp(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(!interaction.keysDownState['w']){
        }
        if(!interaction.keysDownState['a']){
        }
        if(!interaction.keysDownState['s']){
        }
        if(!interaction.keysDownState['d']){
        }
        if(!interaction.keysDownState[' ']){
        }
        if(!interaction.keysDownState['r']){
        }
        if(!interaction.keysDownState['f']){
        }
        if(!interaction.keysDownState['g']){
        }
        if(!interaction.keysDownState['h']){
        }
        if(!interaction.keysDownState['j']){
        }
    }

    onDragStart(event: AInteractionEvent, interaction: ADragInteraction): void {
        /**
         * Here we will track some interaction state. Specifically, the last cursor position.
         */
        interaction.setInteractionState('lastCursor', event.ndcCursor);
    }
    onDragMove(event: AInteractionEvent, interaction: ADragInteraction): void {
        if(!event.ndcCursor){
            return;
        }
        let mouseMovement = event.ndcCursor.minus(interaction.getInteractionState('lastCursor'));
        interaction.setInteractionState('lastCursor', event.ndcCursor);

        let movementX = mouseMovement.x*this.mouseMovementSpeed;
        let movementY = mouseMovement.y*this.mouseMovementSpeed;
        this.cameraTarget.position = this.cameraTarget.position.plus(new Vec3(movementX, movementY, 0));
        this.camera.transform.position = this.camera.position.plus(new Vec3(movementX, movementY, 0));
    }
    onDragEnd(event: AInteractionEvent, interaction: ADragInteraction): void {
        let cursorWorldCoordinates:Vec2|null = event.ndcCursor;
        let dragStartWorldCoordinates:Vec2|null = interaction.dragStartEvent.ndcCursor;
    }

    /**
     * This would be a good place to implement the time update of any movement filters
     * @param t
     * @param args
     */
    timeUpdate(t: number, ...args:any[]) {
    }

}
