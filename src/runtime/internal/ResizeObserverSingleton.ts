const MapImplementation = 'WeakMap' in window ? WeakMap : ('Map' in window ? Map : undefined);

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

	static readonly entries: WeakMap<Element, ResizeObserverEntry> = MapImplementation ? new MapImplementation() : undefined;

	private readonly _listeners: WeakMap<Element, Listener> = MapImplementation ? new MapImplementation() : undefined;
	private _observer?: ResizeObserver;
	private _getObserver() {
		return this._observer ?? (this._observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				ResizeObserverSingleton.entries.set(entry.target, entry);
				this._listeners.get(entry.target)?.(entry);
			}
		}));
	}
}

type Listener = (entry: ResizeObserverEntry)=>any;
