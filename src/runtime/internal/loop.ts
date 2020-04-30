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

function add(c: TaskCallback) {
	const task = { c, f: noop };
	if (!tasks.size) raf(run_tasks);
	tasks.add(task);
	return () => tasks.delete(task);
}

type TimeoutTask = { t: number; c: (now: number) => void };

// sorted descending
const timed_tasks: Array<TimeoutTask> = [];

/**
 * basically
 * (fn, t) => setTimeout( () => raf(fn), t )
 */
export function setAnimationTimeout(callback: () => void, timestamp: number) {
	let i = timed_tasks.length;
	let v;
	const task = { c: callback, t: timestamp };
	if (i) {
		while (i > 0 && timestamp > (v = timed_tasks[i - 1]).t) timed_tasks[i--] = v;
		timed_tasks[i] = task;
	} else {
		timed_tasks.push(task);
		add((now) => {
			let i = timed_tasks.length;
			while (i > 0 && now >= timed_tasks[--i].t) timed_tasks.pop().c(now);
			return !!timed_tasks.length;
		});
	}
	return () => {
		const index = timed_tasks.indexOf(task);
		if (~index) timed_tasks.splice(index, 1);
	};
}
export const loopThen = (run: (now: number) => void, stop: () => void, duration: number, end_time: number) =>
	add((t) => {
		t = (end_time - t) / duration;
		if (t >= 1) return void run(1), stop();
		else if (t >= 0) run(t);
		return true;
	});
