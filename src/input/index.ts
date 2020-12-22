import DomEventSource from "./DomEventSource";
import {FilterSinkWrapper, Pipe} from "@/input/pipe";
import KeyboardActionMapper from "@/input/KeyboardActionMapper";
import Game from "@/cube";

export function listenKeyboard(game: Game) {
    const keySrc = new DomEventSource(document, 'keydown', 1),
        sink = new FilterSinkWrapper(act => !!act, game.actionExecutor),
        mapper = new KeyboardActionMapper(),
        pipe = new Pipe(keySrc, sink, mapper)
    pipe.join()
    return pipe
}
