import { run_all } from '../../shared/utils.js';

// Fallback for when requestIdleCallback is not available
// TODO: find a proper polyfill for Safari, this doesn't work
export const request_idle_callback =
	typeof requestIdleCallback === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: requestIdleCallback;

// Fallback for when scheduler.yield is not available
// TODO: find a proper polyfill for Safari, this doesn't work
export const scheduler_yield =
	// @ts-ignore
	typeof scheduler === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: async (/** @type {() => void} */ fn) => {
				// @ts-ignore
				await scheduler.yield();
				fn();
			};

let is_micro_task_queued = false;
let is_idle_task_queued = false;

/** @type {Array<() => void>} */
let current_queued_micro_tasks = [];
/** @type {Array<() => void>} */
let current_queued_idle_tasks = [];

function process_micro_tasks() {
	is_micro_task_queued = false;
	const tasks = current_queued_micro_tasks.slice();
	current_queued_micro_tasks = [];
	run_all(tasks);
}

function process_idle_tasks() {
	is_idle_task_queued = false;
	const tasks = current_queued_idle_tasks.slice();
	current_queued_idle_tasks = [];
	run_all(tasks);
}

/**
 * @param {() => void} fn
 */
export function queue_micro_task(fn) {
	if (!is_micro_task_queued) {
		is_micro_task_queued = true;
		queueMicrotask(process_micro_tasks);
	}
	current_queued_micro_tasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_idle_task(fn) {
	if (!is_idle_task_queued) {
		is_idle_task_queued = true;
		request_idle_callback(process_idle_tasks);
	}
	current_queued_idle_tasks.push(fn);
}

/**
 * Synchronously run any queued tasks.
 */
export function flush_tasks() {
	if (is_micro_task_queued) {
		process_micro_tasks();
	}
	if (is_idle_task_queued) {
		process_idle_tasks();
	}
}
