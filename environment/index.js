'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.now = is_browser ? window.performance.now.bind(window.performance) : Date.now.bind(Date);
exports.raf = is_browser ? requestAnimationFrame : noop;
exports.framerate = 1000 / 60;

/* tests only */
const set_now = (v) => void (exports.now = v);
const set_raf = (fn) => void (exports.raf = fn);
const set_framerate = (v) => void (exports.framerate = v);

exports.globals = globals;
exports.has_Symbol = has_Symbol;
exports.is_browser = is_browser;
exports.is_cors = is_cors;
exports.is_iframe = is_iframe;
exports.noop = noop;
exports.resolved_promise = resolved_promise;
exports.set_framerate = set_framerate;
exports.set_now = set_now;
exports.set_raf = set_raf;
