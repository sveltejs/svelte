const MapImplementation = "WeakMap" in window ? WeakMap : Map;

/**
 * Resize observer singleton
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
export class ResizeObserverSingleton {
	constructor(readonly options?: ResizeObserverOptions) {}

	addListener(element: Element, callback: (element: Element)=>any) {
		if (!this._callbacks.has(element)) {
			this._callbacks.set(element, new Set([callback]));
			this._getObserver().observe(element, this.options);
		} else {
			this._callbacks.get(element)!.add(callback);
			callback(element);
		}
	}

	removeListener(element: Element, callback: (element: Element)=>any) {
		const list = this._callbacks.get(element);
		if (!list) return;
		if (list.size > 1) {
			list.delete(callback);
		} else {
			this._callbacks.delete(element);
			this._getObserver().unobserve(element);
		}
	}

	// TODO: consider using Array instead of Set?
	// If we can guarantee one listener per element, we can simplify even more.
	private readonly _callbacks: WeakMap<Element, Set<(element: Element)=>any>> = new MapImplementation();
	private _observer: ResizeObserver|undefined = undefined;
	private _getObserver() {
		return this._observer ?? (this._observer = new ResizeObserver((entries)=>{
			for (const entry of entries) {
				const element = entry.target;
				const callbacks = this._callbacks.get(element);
				if (callbacks) {
					for (const callback of callbacks) callback(element);
				}
			}
		}));
	}
}