import DomEventSource from "./DomEventSource";
import {Pipe} from "@/input/pipe";
import {keyboardMoveMapper} from "@/input/KeyboardActionMapper";
import Game from "@/cube";
import {IMove} from "@/cube/Mover";

export function listenKeyboard(game: Game): Pipe<IMove> {
    const keySrc = new DomEventSource(document, 'keydown', 1)
        .map(keyboardMoveMapper)
        .filter(act => !!act)
    return new Pipe(keySrc, game.mover).join()
}
