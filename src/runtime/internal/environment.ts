export function noop() {}
export const is_browser = typeof window !== 'undefined';
export const is_iframe = is_browser && window.self !== window.top;
export const is_cors =
	is_iframe &&
	/*#__PURE__*/ (() => {
		try {
			if (window.parent) void window.parent.document;
			return false;
		} catch (error) {
			return true;
		}
	})();
export const has_Symbol = typeof Symbol === 'function';
declare const global: any;
export const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;
export const resolved_promise = Promise.resolve();
export let now = is_browser ? window.performance.now.bind(window.performance) : Date.now.bind(Date);
export let raf = is_browser ? requestAnimationFrame : noop;

// used internally for testing
export function set_now(fn) {
	now = fn;
}

export function set_raf(fn) {
	raf = fn;
}
