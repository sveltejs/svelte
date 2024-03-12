import { render_effect } from '../../../reactivity/effects.js';

/**
 * Fires the handler once immediately (unless corresponding arg is set to `false`),
 * then listens to the given events until the render effect context is destroyed
 * @param {Element | Window} target
 * @param {Array<string>} events
 * @param {() => void} handler
 * @param {any} call_handler_immediately
 */
export function listen(target, events, handler, call_handler_immediately = true) {
	if (call_handler_immediately) {
		handler();
	}

	for (var name of events) {
		target.addEventListener(name, handler);
	}

	render_effect(() => {
		return () => {
			for (var name of events) {
				target.removeEventListener(name, handler);
			}
		};
	});
}
