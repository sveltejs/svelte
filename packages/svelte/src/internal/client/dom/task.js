import { run_all } from '../../shared/utils.js';

// Fallback for when requestIdleCallback is not available
const request_idle_callback =
	typeof requestIdleCallback === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: requestIdleCallback;

/** @type {Array<() => void>} */
let boundary_micro_tasks = [];

/** @type {Array<() => void>} */
let micro_tasks = [];

/** @type {Array<() => void>} */
let idle_tasks = [];

export function flush_boundary_micro_tasks() {
	var tasks = boundary_micro_tasks;
	boundary_micro_tasks = [];
	run_all(tasks);
}

export function flush_post_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}

export function run_idle_tasks() {
	var tasks = idle_tasks;
	idle_tasks = [];
	run_all(tasks);
}

function run_micro_tasks() {
	flush_boundary_micro_tasks();
	flush_post_micro_tasks();
}

/**
 * @param {() => void} fn
 */
export function queue_boundary_micro_task(fn) {
	if (boundary_micro_tasks.length === 0 && micro_tasks.length === 0) {
		queueMicrotask(run_micro_tasks);
	}

	boundary_micro_tasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_micro_task(fn) {
	if (boundary_micro_tasks.length === 0 && micro_tasks.length === 0) {
		queueMicrotask(run_micro_tasks);
	}

	micro_tasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_idle_task(fn) {
	if (idle_tasks.length === 0) {
		request_idle_callback(run_idle_tasks);
	}

	idle_tasks.push(fn);
}
