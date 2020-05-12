function noop() {}

const is_browser = typeof window !== 'undefined';
const is_iframe = /*#__PURE__*/ is_browser && window.self !== window.top;
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
const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;
const resolved_promise = Promise.resolve();

let now = /*#__PURE__*/ is_browser ? performance.now.bind(performance) : Date.now.bind(Date);
let raf = /*#__PURE__*/ is_browser ? requestAnimationFrame : noop;
let framerate = 1000 / 60;
raf((t1) => {
	raf((d) => {
		const f24 = 1000 / 24,
			f144 = 1000 / 144;
		framerate = (d = d - t1) > f144 ? f144 : d < f24 ? f24 : d;
	});
});

/* tests only */
const test$set_now = (fn) => void (now = fn);
const test$set_raf = (fn) => void (raf = fn);

export { framerate, globals, has_Symbol, is_browser, is_cors, is_iframe, now, raf, resolved_promise, test$set_now, test$set_raf };
