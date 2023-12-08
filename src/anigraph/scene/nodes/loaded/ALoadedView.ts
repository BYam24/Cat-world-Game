import {ANodeView} from "../../nodeView";

export class ALoadedView extends ANodeView{
    init(): void {
        // this.threejs.add(this.model.)
        this.initLoadedObjects();
        this.update();
    }

    update(...args: any[]): void {
        this.setTransform(this.model.transform);
    }

}
