import DomEventSource from "./DomEventSource";
import {Pipe} from "@/input/pipe";
import keyboardActionMapper from "@/input/KeyboardActionMapper";
import Game from "@/cube";
import {ActionName} from "@/cube/Actions";

export function listenKeyboard(game: Game): Pipe<ActionName> {
    const keySrc = new DomEventSource(document, 'keydown', 1)
        .map(keyboardActionMapper)
        .filter(act => !!act)
    return new Pipe(keySrc, game.actionExecutor).join()
}
