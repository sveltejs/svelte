import { raf, now } from './environment';
import { noop } from './utils';

export interface Task {
	abort(): void;
	promise: Promise<void>;
}
type TaskCallback = (now: number) => boolean | void;
type TaskEntry = { c: TaskCallback; f: () => void };

const tasks = new Set<TaskEntry>();

function run_tasks(now: number) {
	tasks.forEach((task) => {
		if (task.c(now)) return;
		tasks.delete(task);
		task.f();
	});
	if (tasks.size) raf(run_tasks);
}

/**
 * For testing purposes only!
 */
export function clear_loops() {
	tasks.clear();
}

/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
export function loop(callback: TaskCallback): Task {
	let task: TaskEntry;
	if (!tasks.size) raf(run_tasks);
	return {
		promise: new Promise((fulfill) => {
			tasks.add((task = { c: callback, f: fulfill }));
		}),
		abort() {
			tasks.delete(task);
		},
	};
}

function add(c) {
	const task = { c, f: noop };
	if (!tasks.size) raf(run_tasks);
	tasks.add(task);
	return () => tasks.delete(task);
}

const timed_tasks = [];
// callback on 1st frame after timestamp
export function raf_timeout(callback: () => void, timestamp: number) {
	let i = timed_tasks.length;
	let v;
	const task = { c: callback, t: timestamp };
	if (i) {
		while (i > 0 && timestamp > (v = timed_tasks[i - 1]).t) {
			// bubble sort descending until timestamp < task.timestamp
			timed_tasks[i--] = v;
		}
		timed_tasks[i] = task;
	} else {
		timed_tasks.push(task);
		add((now) => {
			let i = timed_tasks.length;
			while (i > 0 && now >= timed_tasks[--i].t) {
				// pop() until now < task.timestamp
				timed_tasks.pop().c(now);
			}
			console.log(i, timed_tasks, now);
			return timed_tasks.length;
		});
	}
	return () => {
		const index = timed_tasks.indexOf(task);
		if (~index) timed_tasks.splice(index, 1);
		console.log(timed_tasks);
	};
}
export function loopThen(delay: number, run: (now: number) => void, stop: () => void, end_time: number) {
	const fn = () => add((now) => (now < end_time ? (run(now), true) : (stop(), false)));
	if (delay < 16) return fn();
	else {
		let cancel = raf_timeout(() => (cancel = fn()), now() + delay - 16.6667);
		return () => cancel();
	}
}
export function next_frame(callback) {
	return add(() => (callback(), false));
}
