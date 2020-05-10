export const is_browser = typeof window !== 'undefined';
export const is_iframe = is_browser && window.self !== window.top;
export const is_cors =
	is_iframe &&
	(() => {
		try {
			if (window.parent) void window.parent.document;
			return false;
		} catch (error) {
			return true;
		}
	})();
export const has_Symbol = typeof Symbol === 'function';
export const globals = is_browser ? window : typeof globalThis !== 'undefined' ? globalThis : global;
