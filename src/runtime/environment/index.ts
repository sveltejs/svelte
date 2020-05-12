import { noop } from '../internal/utils';
export const is_browser = typeof window !== 'undefined';
export const is_iframe = /*#__PURE__*/ is_browser && window.self !== window.top;
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
export const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;
export const resolved_promise = Promise.resolve();

export let now = /*#__PURE__*/ is_browser ? performance.now.bind(performance) : Date.now.bind(Date);
export let raf = /*#__PURE__*/ is_browser ? requestAnimationFrame : noop;
export let framerate = 1000 / 60;
raf((t1) => {
	raf((d) => {
		const f24 = 1000 / 24,
			f144 = 1000 / 144;
		framerate = (d = d - t1) > f144 ? f144 : d < f24 ? f24 : d;
	});
});

/* tests only */
export const test$set_now = (fn) => void (now = fn);
export const test$set_raf = (fn) => void (raf = fn);
