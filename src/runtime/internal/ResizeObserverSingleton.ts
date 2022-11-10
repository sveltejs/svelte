const MapImplementation = "WeakMap" in window ? WeakMap : Map;

/**
 * Resize observer singleton
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
export class ResizeObserverSingleton {
	constructor(readonly options?: ResizeObserverOptions) {}

	addListener(element: Element, callback: Callback) {
		if (!this._subscriptions.has(element)) {
			this._subscriptions.set(element, new Subscription(new Set([callback])));
			this._getObserver().observe(element, this.options);
		} else {
			const subscription = this._subscriptions.get(element)!;
			subscription.listeners.add(callback);
			callback.call(element, subscription.lastEntry!);
		}
	}

	removeListener(element: Element, callback: Callback) {
		const subscription = this._subscriptions.get(element);
		if (!subscription) return;
		if (subscription.listeners.size > 1) {
			subscription.listeners.delete(callback);
		} else {
			this._subscriptions.delete(element);
			this._getObserver().unobserve(element);
		}
	}

	getLastEntry(element: Element) {
		return this._subscriptions.get(element)?.lastEntry;
	}

	private readonly _subscriptions: WeakMap<Element, Subscription> = new MapImplementation();
	private _observer: ResizeObserver|undefined = undefined;
	private _getObserver() {
		return this._observer ?? (this._observer = new ResizeObserver((entries)=>{
			for (const entry of entries) {
				const element = entry.target;
				const subscription = this._subscriptions.get(element);
				if (!subscription) continue;
				subscription.lastEntry = entry;
				for (const callback of subscription.listeners) callback.call(element, entry);
			}
		}));
	}
}

type Callback = (this: Element, entry: ResizeObserverEntry)=>any;

class Subscription {
	// TODO: consider using Array instead of Set?
	// If we can guarantee one listener per element, we can simplify even more.
	constructor(
		readonly listeners: Set<Callback>,
		public lastEntry?: ResizeObserverEntry,
	) {}
}