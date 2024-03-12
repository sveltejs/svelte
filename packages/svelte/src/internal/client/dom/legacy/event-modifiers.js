/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function trusted(fn) {
	return function (...args) {
		var event = /** @type {Event} */ (args[0]);
		if (event.isTrusted) {
			// @ts-ignore
			fn.apply(this, args);
		}
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function self(fn) {
	return function (...args) {
		var event = /** @type {Event} */ (args[0]);
		// @ts-ignore
		if (event.target === this) {
			// @ts-ignore
			fn.apply(this, args);
		}
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopPropagation(fn) {
	return function (...args) {
		var event = /** @type {Event} */ (args[0]);
		event.stopPropagation();
		// @ts-ignore
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function once(fn) {
	var ran = false;

	return function (...args) {
		if (ran) return;
		ran = true;

		// @ts-ignore
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopImmediatePropagation(fn) {
	return function (...args) {
		var event = /** @type {Event} */ (args[0]);
		event.stopImmediatePropagation();
		// @ts-ignore
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function preventDefault(fn) {
	return function (...args) {
		var event = /** @type {Event} */ (args[0]);
		event.preventDefault();
		// @ts-ignore
		return fn.apply(this, args);
	};
}
