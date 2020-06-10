import { now, raf } from './environment';
import { noop } from './utils';

export const frame = {
	rate: 1000 / 60,
	time: 0.0,
	sync() {
		return n ? this.time : (this.time = now());
	},
};
type TaskCallback = (t: number) => boolean;
type TaskCanceller = () => void;
type TimeoutTask = { t: number; c: (now: number) => void };

const pending_sort: TimeoutTask[] = [];
const timed_tasks: TimeoutTask[] = [];

let i = 0;
let j = 0;
let t = 0;
let c: TaskCallback;

let running_frame: TaskCallback[] = [];
let	next_frame: TaskCallback[] = [];

let this_task: TimeoutTask;
let that_task: TimeoutTask;

let l = -1;
let n = 0;
let p = 0;

const run = (time: number) => {
	time = (frame.time = now());
	if (0 !== n) {
		[running_frame, next_frame] = [next_frame, running_frame];
		j = n;
		for (i = n = 0; i < j; i++) {
			c = running_frame[i];
			if (c(time)) {
				next_frame[n++] = c;
			}
		}
		running_frame.length = 0;
	}
	if (-1 !== l) {
		while (-1 !== l && time >= timed_tasks[l].t) { 
			timed_tasks[l--].c(time);
		}
		if (0 !== p) {
			for (i = j = 0; i < p; i++) {
				this_task = pending_sort[i];
				t = this_task.t;
				if (time >= t) {
					this_task.c(time);
					continue;
				}
				for (j = l++; -1 !== j; j--) {
					that_task = timed_tasks[j];
					if (t <= that_task.t) break;
					timed_tasks[j + 1] = that_task;
				}
				timed_tasks[j + 1] = this_task;
			}
			pending_sort.length = p = 0;
		}
		timed_tasks.length = l + 1;
	}
	if (0 !== n || -1 !== l) {
		raf(run);
	}
};

const loop = (fn) => {
	let running = true;
	if (0 === n) raf(run);
	next_frame[n++] = (t) => running && fn(t);
	return () => {
		running = false;
	};
};

export const setFrameTimeout = (c: (t: number) => void, t: number): TaskCanceller => {
	const task: TimeoutTask = { c, t };
	if (-1 !== l) {
		pending_sort[p++] = task;
	} else {
		if (0 === n) raf(run);
		timed_tasks[(l = 0)] = task;
	}
	return () => {
		task.c = noop;
	};
};
export const setTweenTimeout = (
	stop: (now: number) => void,
	end_time: number,
	run: (now: number) => void,
	duration = end_time - frame.sync()
): TaskCanceller => {
	let t = 0.0;
	return loop((now) => {
		t = 1.0 - (end_time - now) / duration;
		if (t >= 1.0) return run(1), stop(now), false;
		if (t >= 0.0) run(t);
		return true;
	});
};

/** tests only */
export const clear_loops = () => {
	running_frame.length = 0;
	pending_sort.length = 0;
	timed_tasks.length = 0;
	next_frame.length = 0;
	i = j = t = n = p = 0;
	l = -1;
	tasks.clear();
};

/** legacy loop for svelte/motion */

export interface MotionTask { abort(): void; promise: Promise<void> }
type MotionTaskCallback = (now: number) => boolean | void;
type MotionTaskEntry = { c: MotionTaskCallback; f: () => void };

const tasks = new Set<MotionTaskEntry>();

function run_tasks(now: number) {
	tasks.forEach(task => {
		if (!task.c(now)) {
			tasks.delete(task);
			task.f();
		}
	});

	if (tasks.size !== 0) raf(run_tasks);
}
export function motion_loop(callback: MotionTaskCallback): MotionTask {
	let task: MotionTaskEntry;

	if (tasks.size === 0) raf(run_tasks);

	return {
		promise: new Promise(fulfill => {
			tasks.add(task = { c: callback, f: fulfill });
		}),
		abort() {
			tasks.delete(task);
		}
	};
}