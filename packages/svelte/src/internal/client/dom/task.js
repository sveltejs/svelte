import { run_all } from '../../shared/utils.js';

let is_task_queued = false;
let is_raf_queued = false;

/** @type {Array<() => void>} */
let current_queued_tasks = [];
/** @type {Array<() => void>} */
let current_raf_tasks = [];

function process_task() {
	is_task_queued = false;
	const tasks = current_queued_tasks.slice();
	current_queued_tasks = [];
	run_all(tasks);
}

function process_raf_task() {
	is_raf_queued = false;
	const tasks = current_raf_tasks.slice();
	current_raf_tasks = [];
	run_all(tasks);
}

/**
 * Synchronously run any queued tasks.
 */
export function flush_tasks() {
	if (is_task_queued) {
		process_task();
	}
	if (is_raf_queued) {
		process_raf_task();
	}
}
