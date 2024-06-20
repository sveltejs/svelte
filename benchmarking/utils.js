import { performance, PerformanceObserver } from 'node:perf_hooks';
import v8 from 'v8-natives';

// Credit to https://github.com/milomg/js-reactivity-benchmark for the logic for timing + GC tracking.

class GarbageTrack {
	track_id = 0;
	observer = new PerformanceObserver((list) => this.perf_entries.push(...list.getEntries()));
	perf_entries = [];
	periods = [];

	watch(fn) {
		this.track_id++;
		const start = performance.now();
		const result = fn();
		const end = performance.now();
		this.periods.push({ track_id: this.track_id, start, end });

		return { result, track_id: this.track_id };
	}

	/**
	 * @param {number} track_id
	 */
	async gcDuration(track_id) {
		await promise_delay(10);

		const period = this.periods.find((period) => period.track_id === track_id);
		if (!period) {
			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
			return Promise.reject('no period found');
		}

		const entries = this.perf_entries.filter(
			(e) => e.startTime >= period.start && e.startTime < period.end
		);
		return entries.reduce((t, e) => e.duration + t, 0);
	}

	destroy() {
		this.observer.disconnect();
	}

	constructor() {
		this.observer.observe({ entryTypes: ['gc'] });
	}
}

function promise_delay(timeout = 0) {
	return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * @param {{ (): void; (): any; }} fn
 */
function run_timed(fn) {
	const start = performance.now();
	const result = fn();
	const time = performance.now() - start;
	return { result, time };
}

/**
 * @param {() => void} fn
 */
async function run_tracked(fn) {
	v8.collectGarbage();
	const gc_track = new GarbageTrack();
	const { result: wrappedResult, track_id } = gc_track.watch(() => run_timed(fn));
	const gc_time = await gc_track.gcDuration(track_id);
	const { result, time } = wrappedResult;
	gc_track.destroy();
	return { result, timing: { time, gc_time } };
}

/**
 * @param {number} times
 * @param {() => void} fn
 */
export async function fastest_test(times, fn) {
	const results = [];
	for (let i = 0; i < times; i++) {
		const run = await run_tracked(fn);
		results.push(run);
	}
	const fastest = results.reduce((a, b) => (a.timing.time < b.timing.time ? a : b));

	return fastest;
}

/**
 * @param {boolean} a
 */
export function assert(a) {
	if (!a) {
		throw new Error('Assertion failed');
	}
}
