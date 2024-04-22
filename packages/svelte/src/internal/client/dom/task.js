import { run_all } from '../../shared/utils.js';

let is_task_queued = false;

/** @type {Array<() => void>} */
let current_queued_tasks = [];

function process_task() {
	is_task_queued = false;
	const tasks = current_queued_tasks.slice();
	current_queued_tasks = [];
	run_all(tasks);
}

/**
 * @param {() => void} fn
 */
export function queue_task(fn) {
	if (!is_task_queued) {
		is_task_queued = true;
		queueMicrotask(process_task);
	}
	current_queued_tasks.push(fn);
}

/**
 * Synchronously run any queued tasks.
 */
export function flush_tasks() {
	if (is_task_queued) {
		process_task();
	}
}
