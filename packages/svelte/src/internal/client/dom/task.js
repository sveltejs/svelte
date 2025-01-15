import { run_all } from '../../shared/utils.js';

// Fallback for when requestIdleCallback is not available
export const request_idle_callback =
	typeof requestIdleCallback === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: requestIdleCallback;

let is_micro_task_queued = false;
let is_idle_task_queued = false;

/** @type {Array<() => void>} */
let queued_before_microtasks = [];
/** @type {Array<() => void>} */
let queued_after_microtasks = [];
/** @type {Array<() => void>} */
let queued_idle_tasks = [];

export function flush_before_micro_tasks() {
	const tasks = queued_before_microtasks.slice();
	queued_before_microtasks = [];
	run_all(tasks);
}

function flush_after_micro_tasks() {
	const tasks = queued_after_microtasks.slice();
	queued_after_microtasks = [];
	run_all(tasks);
}

function process_micro_tasks() {
	if (is_micro_task_queued) {
		is_micro_task_queued = false;
		flush_before_micro_tasks();
		flush_after_micro_tasks();
	}
}

function process_idle_tasks() {
	is_idle_task_queued = false;
	const tasks = queued_idle_tasks.slice();
	queued_idle_tasks = [];
	run_all(tasks);
}

/**
 * @param {() => void} fn
 */
export function queue_before_micro_task(fn) {
	if (!is_micro_task_queued) {
		is_micro_task_queued = true;
		queueMicrotask(process_micro_tasks);
	}
	queued_before_microtasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_after_micro_task(fn) {
	if (!is_micro_task_queued) {
		is_micro_task_queued = true;
		queueMicrotask(process_micro_tasks);
	}
	queued_after_microtasks.push(fn);
}

/**
 * @param {() => void} fn
 */
export function queue_idle_task(fn) {
	if (!is_idle_task_queued) {
		is_idle_task_queued = true;
		request_idle_callback(process_idle_tasks);
	}
	queued_idle_tasks.push(fn);
}

/**
 * Synchronously run any queued tasks.
 */
export function flush_after_tasks() {
	if (is_micro_task_queued) {
		process_micro_tasks();
	}
	if (is_idle_task_queued) {
		process_idle_tasks();
	}
}
