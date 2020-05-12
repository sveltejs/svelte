'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.now = /*#__PURE__*/ is_browser ? performance.now.bind(performance) : Date.now.bind(Date);
exports.raf = /*#__PURE__*/ is_browser ? requestAnimationFrame : noop;
exports.framerate = 1000 / 60;
exports.raf((t1) => {
	exports.raf((d) => {
		const f24 = 1000 / 24,
			f144 = 1000 / 144;
		exports.framerate = (d = d - t1) > f144 ? f144 : d < f24 ? f24 : d;
	});
});

/* tests only */
const test$set_now = (fn) => void (exports.now = fn);
const test$set_raf = (fn) => void (exports.raf = fn);

exports.globals = globals;
exports.has_Symbol = has_Symbol;
exports.is_browser = is_browser;
exports.is_cors = is_cors;
exports.is_iframe = is_iframe;
exports.resolved_promise = resolved_promise;
exports.test$set_now = test$set_now;
exports.test$set_raf = test$set_raf;
