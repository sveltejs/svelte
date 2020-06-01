import { noop } from './utils';

export const is_client = typeof window !== 'undefined';

export let now: () => number = is_client
	? () => window.performance.now()
	: () => Date.now();

export let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
export let framerate = 1000 / 60;
/*#__PURE__*/ raf((t1) => {
	raf((d) => {
		const f24 = 1000 / 24;
		const f144 = 1000 / 144;
		framerate = (d = d - t1) > f144 ? f144 : d < f24 ? f24 : d;
	});
});

// used internally for testing
export function set_now(fn) {
	now = fn;
}

export function set_raf(fn) {
	raf = fn;
}
