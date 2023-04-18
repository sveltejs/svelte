import { globals } from './globals';

/**
 * Resize observer singleton.
 * One listener per element only!
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
export class ResizeObserverSingleton {
	constructor(readonly options?: ResizeObserverOptions) {}

	observe(element: Element, listener: Listener) {
		this._listeners.set(element, listener);
		this._getObserver().observe(element, this.options);
		return () => {
			this._listeners.delete(element);
			this._observer.unobserve(element); // this line can probably be removed
		};
	}

	private readonly _listeners: WeakMap<Element, Listener> = 'WeakMap' in globals ? new WeakMap() : undefined;
	private _observer?: ResizeObserver;
	private _getObserver() {
		return this._observer ?? (this._observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				(ResizeObserverSingleton as any).entries.set(entry.target, entry);
				this._listeners.get(entry.target)?.(entry);
			}
		}));
	}
}
// Needs to be written like this to pass the tree-shake-test
(ResizeObserverSingleton as any).entries = 'WeakMap' in globals ? new WeakMap() : undefined;

type Listener = (entry: ResizeObserverEntry)=>any;

// TODO: Remove this
interface ResizeObserverSize {
    readonly blockSize: number;
    readonly inlineSize: number;
}

interface ResizeObserverEntry {
    readonly borderBoxSize: readonly ResizeObserverSize[];
    readonly contentBoxSize: readonly ResizeObserverSize[];
    readonly contentRect: DOMRectReadOnly;
    readonly devicePixelContentBoxSize: readonly ResizeObserverSize[];
    readonly target: Element;
}

type ResizeObserverBoxOptions = 'border-box' | 'content-box' | 'device-pixel-content-box';

interface ResizeObserverOptions {
    box?: ResizeObserverBoxOptions;
}

interface ResizeObserver {
    disconnect(): void;
    observe(target: Element, options?: ResizeObserverOptions): void;
    unobserve(target: Element): void;
}

interface ResizeObserverCallback {
    (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

declare let ResizeObserver: {
    prototype: ResizeObserver;
    new(callback: ResizeObserverCallback): ResizeObserver;
};
