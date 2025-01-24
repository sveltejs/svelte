import { run_all } from '../../shared/utils.js';

// Fallback for when requestIdleCallback is not available
export const request_idle_callback =
	typeof requestIdleCallback === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: requestIdleCallback;

let is_micro_task_queued = false;
let is_idle_task_queued = false;

/** @type {Array<() => void>} */
let queued_boundary_microtasks = [];
/** @type {Array<() => void>} */
let queued_post_microtasks = [];
/** @type {Array<() => void>} */
let queued_idle_tasks = [];

export function flush_boundary_micro_tasks() {
	const tasks = queued_boundary_microtasks.slice();
	queued_boundary_microtasks = [];
	run_all(tasks);
}

export function flush_post_micro_tasks() {
	const tasks = queued_post_microtasks.slice();
	queued_post_microtasks = [];
	run_all(tasks);
}

export function flush_idle_tasks() {
	if (is_idle_task_queued) {
		is_idle_task_queued = false;
		const tasks = queued_idle_tasks.slice();
		queued_idle_tasks = [];
		run_all(tasks);
	}
}

function flush_all_micro_tasks() {
	if (is_micro_task_queued) {
		is_micro_task_queued = false;
		flush_boundary_micro_tasks();
		flush_post_micro_tasks();
	}
}

/**
 * @param {() => void} fn
 */
export function queue_boundary_micro_task(fn) {
	if (!is_micro_task_queued) {
		is_micro_task_queued = true;
		queueMicrotask(flush_all_micro_tasks);
	}
	queued_boundary_microtasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_micro_task(fn) {
	if (!is_micro_task_queued) {
		is_micro_task_queued = true;
		queueMicrotask(flush_all_micro_tasks);
	}
	queued_post_microtasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_idle_task(fn) {
	if (!is_idle_task_queued) {
		is_idle_task_queued = true;
		request_idle_callback(flush_idle_tasks);
	}
	queued_idle_tasks.push(fn);
}
