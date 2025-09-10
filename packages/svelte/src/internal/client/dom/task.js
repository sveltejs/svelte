import { run_all } from '../../shared/utils.js';
import { is_flushing_sync } from '../reactivity/batch.js';

// Fallback for when requestIdleCallback is not available
const request_idle_callback =
	typeof requestIdleCallback === 'undefined'
		? (/** @type {() => void} */ cb) => setTimeout(cb, 1)
		: requestIdleCallback;

/** @type {Array<() => void>} */
let micro_tasks = [];

/** @type {Array<() => void>} */
let idle_tasks = [];

function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}

function run_idle_tasks() {
	var tasks = idle_tasks;
	idle_tasks = [];
	run_all(tasks);
}

export function has_pending_tasks() {
	return micro_tasks.length > 0 || idle_tasks.length > 0;
}

/**
 * @param {() => void} fn
 */
export function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
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

/**
 * Synchronously run any queued tasks.
 */
export function flush_tasks() {
	if (micro_tasks.length > 0) {
		run_micro_tasks();
	}

	if (idle_tasks.length > 0) {
		run_idle_tasks();
	}
}
