import { noop } from "./utils";

export const is_client = typeof window !== "undefined";

export let now: () => number = is_client
	? () => window.performance.now()
	: () => Date.now();

export let raf = /*#__PURE__*/ is_client ? (cb: FrameRequestCallback) => requestAnimationFrame(cb) : noop;

// used internally for testing
export function set_now(fn) {
	now = fn;
}

export function set_raf(fn) {
	raf = fn;
}
