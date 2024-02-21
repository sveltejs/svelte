import { run_all } from '../../common.js';

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
 * @param {() => void} fn
 * @returns {void}
 */
export function schedule_task(fn) {
	if (!is_task_queued) {
		is_task_queued = true;
		setTimeout(process_task, 0);
	}
	current_queued_tasks.push(fn);
}

/**
 * @param {() => void} fn
 * @returns {void}
 */
export function schedule_raf_task(fn) {
	if (!is_raf_queued) {
		is_raf_queued = true;
		requestAnimationFrame(process_raf_task);
	}
	current_raf_tasks.push(fn);
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
