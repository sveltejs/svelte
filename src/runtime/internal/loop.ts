import { now, raf } from './environment';

export interface Task { abort(): void; promise: Promise<void> }

const tasks = new Set();
let running = false;

function run_tasks() {
	tasks.forEach(task => {
		if (!task[0](now())) {
			tasks.delete(task);
			task[1]();
		}
	});

	running = tasks.size > 0;
	if (running) raf(run_tasks);
}

export function clear_loops() {
	// for testing...
	tasks.forEach(task => tasks.delete(task));
	running = false;
}

export function loop(fn: (number) => void): Task {
	let task;

	if (!running) {
		running = true;
		raf(run_tasks);
	}

	return {
		promise: new Promise<void>(fulfil => {
			tasks.add(task = [fn, fulfil]);
		}),
		abort() {
			tasks.delete(task);
		}
	};
}
