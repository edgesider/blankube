import {Action} from "@/cube/Actions";
import {ISink} from "@/input/pipe";

export default class ActionExecutor implements ISink<Action> {
    async put(o: Action): Promise<any> {
        await o()
    }

    abort() {
    }
}
