/**
 * This modifier ensures that the provided callback
 * function `fn` is invoked exactly once for the given event.
 *
 * @param {import("./public.js").EventHandler}  fn - The function to call once.
 * @returns {import("./public.js").EventHandler} A new function that wraps the original function `fn`.
 */
export function once(fn) {
	return function (event) {
		// @ts-ignore
		if (fn) fn.call(this, event);
		// @ts-expect-error - fn cannot be null, but we need to set it to null
		fn = null;
	};
}

/**
 * Modifies the behavior of an event handler to prevent the default action associated
 * with the event before executing the provided callback function `fn`.
 *
 * @param {import("./public.js").EventHandler} fn - The callback function to execute after
 * 																									the default action has been prevented.
 * @returns {import("./public.js").EventHandler} A new function that acts as the modified event handler,
 * 																							calling the provided callback function after preventing the
 *																								default action of the event.
 */
export function preventDefault(fn) {
	return function (event) {
		event.preventDefault();

		// @ts-ignore
		fn.call(this, event);
	};
}

/**
 * Modifies the behavior of an event handler to stop the propagation of the event
 * through the DOM tree before executing the provided callback function `fn`.
 *
 * @param {import("./public.js").EventHandler} fn - The callback function to execute after
 *                                                  the event propagation has been stopped.
 * @returns {import("./public.js").EventHandler} A new function that acts as the modified event handler, calling the 																							provided callback function after stopping the propagation of the event.
 */
export function stopPropagation(fn) {
	return function (event) {
		event.stopPropagation();

		// @ts-ignore
		fn.call(this, event);
	};
}

/**
 * Modifies the behavior of an event handler to immediately halt further processing
 * of the current event in both the capturing and bubbling phases, and then executes
 * the provided callback function `fn`.
 *
 * @param {import("./public.js").EventHandler} fn - The callback function to execute after
 *                                                  immediate propagation has been stopped.
 * @returns {import("./public.js").EventHandler} A new function that acts as the modified event handler, calling
 * 																							the provided callback function after stopping immediate
 *																							propagation of the event.
 */
export function stopImmediatePropagation(fn) {
	return function (event) {
		event.stopImmediatePropagation();

		// @ts-ignore
		fn.call(this, event);
	};
}

/**
 * This modifier ensures that the original function (`fn`) is called only if the event's target is the element itself.
 *
 * @param {import("./public.js").EventHandler} fn The original function to be executed when
 *                                                the event occurs directly on the element.
 * @returns {import("./public.js").EventHandler} A new function that acts as the modified event handler.
 */
export function self(fn) {
	return function (event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

/**
 * This modifier function specifically checks if the event is trusted using the `isTrusted` property of the Event interface.
 *
 * @param {import("./public.js").EventHandler} fn The original function to be executed
 *                                                when a trusted event occurs.
 * @returns {import("./public.js").EventHandler} A new function that acts as the modified event handler.
 */
export function trusted(fn) {
	return function (event) {
		// @ts-ignore
		if (event.isTrusted) fn.call(this, event);
	};
}
