import { performance, PerformanceObserver } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import inspector from 'node:inspector/promises';
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

	for (let i = 0; i < times; i++) {
		results.push(await track(fn));
	}

	return results.reduce((a, b) => (a.time < b.time ? a : b));
}

export function safe(name) {
	return name.replace(/[^a-z0-9._-]+/gi, '_');
}

/**
 * @template T
 * @param {string | null} profile_dir
 * @param {string} profile_name
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function with_cpu_profile(profile_dir, profile_name, fn) {
	if (profile_dir === null) {
		return await fn();
	}

	fs.mkdirSync(profile_dir, { recursive: true });

	const session = new inspector.Session();
	session.connect();

	await session.post('Profiler.enable');
	await session.post('Profiler.start');

	try {
		return await fn();
	} finally {
		const { profile } = /** @type {{ profile: object }} */ (await session.post('Profiler.stop'));
		const file = path.join(profile_dir, `${safe(profile_name)}.cpuprofile`);
		fs.writeFileSync(file, JSON.stringify(profile));
		session.disconnect();
	}
}
