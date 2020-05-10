'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const is_browser = typeof window !== 'undefined';
const is_iframe = is_browser && window.self !== window.top;
const is_cors =
	is_iframe &&
	(() => {
		try {
			if (window.parent) void window.parent.document;
			return false;
		} catch (error) {
			return true;
		}
	})();
const has_Symbol = typeof Symbol === 'function';
const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;

exports.globals = globals;
exports.has_Symbol = has_Symbol;
exports.is_browser = is_browser;
exports.is_cors = is_cors;
exports.is_iframe = is_iframe;
