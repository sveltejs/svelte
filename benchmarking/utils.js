import { performance, PerformanceObserver } from 'node:perf_hooks';
import v8 from 'v8-natives';

// Credit to https://github.com/milomg/js-reactivity-benchmark for the logic for timing + GC tracking.

async function track(fn) {
	v8.collectGarbage();

	/** @type {PerformanceEntry[]} */
	const entries = [];

	const observer = new PerformanceObserver((list) => entries.push(...list.getEntries()));
	observer.observe({ entryTypes: ['gc'] });

	const start = performance.now();
	fn();
	const end = performance.now();

	await new Promise((f) => setTimeout(f, 10));

	const gc_time = entries
		.filter((e) => e.startTime >= start && e.startTime < end)
		.reduce((t, e) => e.duration + t, 0);

	observer.disconnect();

	return { time: end - start, gc_time };
}

/**
 * @param {number} times
 * @param {() => void} fn
 */
export async function fastest_test(times, fn) {
	/** @type {Array<{ time: number, gc_time: number }>} */
	const results = [];

	for (let i = 0; i < 2; i++) {
		results.push(await track(fn));
	}

	return results.reduce((a, b) => (a.time < b.time ? a : b));
}
