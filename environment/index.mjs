function noop() {}
const is_browser = typeof window !== 'undefined';
const is_iframe = is_browser && window.self !== window.top;
const is_cors =
	is_iframe &&
	/*#__PURE__*/ (() => {
		try {
			if (window.parent) void window.parent.document;
			return false;
		} catch (error) {
			return true;
		}
	})();
const has_Symbol = typeof Symbol === 'function';
/* eslint-disable no-var */

const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;
const resolved_promise = Promise.resolve();

let now = is_browser ? window.performance.now.bind(window.performance) : Date.now.bind(Date);
let raf = is_browser ? requestAnimationFrame : noop;
let framerate = 1000 / 60;

/* tests only */
const set_now = (v) => void (now = v);
const set_raf = (fn) => void (raf = fn);
const set_framerate = (v) => void (framerate = v);

export { framerate, globals, has_Symbol, is_browser, is_cors, is_iframe, noop, now, raf, resolved_promise, set_framerate, set_now, set_raf };
