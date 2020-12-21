import Actions from "@/cube/Actions";
import DomEventSource from "./DomEventSource";
import ActionExecutor from "./ActionExecutor";
import {FilterSinkWrapper, Pipe} from "@/input/pipe";
import KeyboardActionMapper from "@/input/KeyboardActionMapper";

export function listenKeyboard(actions: Actions) {
    const keySrc = new DomEventSource(document, 'keydown', 1),
        sink = new FilterSinkWrapper(act => !!act, new ActionExecutor()),
        mapper = new KeyboardActionMapper(actions),
        pipe = new Pipe(keySrc, sink, mapper)
    pipe.join()
}
