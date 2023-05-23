import { globals } from './globals.js';

/**
 * Resize observer singleton.
 * One listener per element only!
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
export class ResizeObserverSingleton {
	/**
	 * @private
	 * @readonly
	 * @type {WeakMap<Element, import('./private.js').Listener>}
	 */
	_listeners = 'WeakMap' in globals ? new WeakMap() : undefined;

	/**
	 * @private
	 * @type {ResizeObserver}
	 */
	_observer = undefined;

	/** @type {ResizeObserverOptions} */
	options;

	/** @param {ResizeObserverOptions} options */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @param {Element} element
	 * @param {import('./private.js').Listener} listener
	 * @returns {() => void}
	 */
	observe(element, listener) {
		this._listeners.set(element, listener);
		this._getObserver().observe(element, this.options);
		return () => {
			this._listeners.delete(element);
			this._observer.unobserve(element); // this line can probably be removed
		};
	}

	/**
	 * @private
	 */
	_getObserver() {
		return (
			this._observer ??
			(this._observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					ResizeObserverSingleton.entries.set(entry.target, entry);
					this._listeners.get(entry.target)?.(entry);
				}
			}))
		);
	}
}

// Needs to be written like this to pass the tree-shake-test
ResizeObserverSingleton.entries = 'WeakMap' in globals ? new WeakMap() : undefined;
