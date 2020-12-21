import {CombinedSource, ISource} from "@/input/pipe";
import DomEventSource from "@/input/DomEventSource";

export default class ShortcutRecorder implements ISource<string> {
    private keydownSrc = new DomEventSource(document, 'keydown', 4)
    private keyupSrc = new DomEventSource(document, 'keyup', 4)
    private cmbSrc = new CombinedSource([this.keydownSrc, this.keyupSrc])

    async get(): Promise<string> {
        let key = ''
        while (true) {
            const ev = await this.cmbSrc.get()
            ev.preventDefault()
            if (ev.type === 'keydown')
                key = ev.getDescription()
            else if (ev.type === 'keyup' && key)
                break
        }
        return key
    }

    abort() {
    }
}