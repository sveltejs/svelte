import { noop } from './utils';
export const resolved_promise = Promise.resolve();
export const is_client = typeof window !== 'undefined';
export const is_iframe = !is_client && window.self !== window.top;
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

export const globals = ((is_client
	? window
	: typeof globalThis !== 'undefined'
	? globalThis
	: global) as unknown) as typeof globalThis;

export const has_Symbol = typeof Symbol === 'function';
export let now = is_client ? performance.now.bind(performance) : Date.now.bind(Date);

export let raf = is_client ? requestAnimationFrame : noop;

/* tests only */
export const set_now = (fn) => void (now = fn);

export const set_raf = (fn) => void (raf = fn);
