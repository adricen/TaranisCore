import type { IComponent, IEvent } from "@/core/components";

// TODO: Could be possible to improve by using a pooling system for listener...
// could be usefull if it take a lot of mount / unmount element like particles
// otherwise, not that much
class ListenerComponent implements IComponent {
    listen: Map<IEvent['name'], Function[]>;

    constructor({
        listen = new Map(),
    }: Partial<ListenerComponent> = {}) {
        this.listen = listen;
    }

    addListener(args: {event: IEvent['name'], listener: Function}) {
        if (!this.listen.has(args.event)) {
            this.listen.set(args.event, []);
        }
        this.listen.get(args.event)?.push(args.listener);
    }

    removeListener(args: {event: IEvent['name'], listener: Function}) {
        const listeners = this.listen.get(args.event);
        if (!listeners) return;
        this.listen.set(
            args.event,
            listeners.filter(l => l !== args.listener)
        );
    }

    debugListenerList() {
        return Array.from(this.listen.values());
    }
}

export { ListenerComponent };