import { now, raf, framerate } from './environment';
import { noop } from './utils';
type TaskCallback = (t: number) => boolean;
type TaskCanceller = () => void;

let i = 0;
let j = 0;
let n = 0;
let v: TaskCallback;

let running_frame: TaskCallback[] = [];
let	next_frame: TaskCallback[] = [];

const run = (t: number) => {
	[running_frame, next_frame] = [next_frame, running_frame];
	for (t = now(), i = n = 0, j = running_frame.length; i < j; i++) {
		if ((v = running_frame[i])(t)) {
			next_frame[n++] = v;
		}
	}
	if ((running_frame.length = 0) < n) {
		raf(run);
	}
};

type TimeoutTask = { timestamp: number; callback: (now: number) => void };

const pending_insert_timed: TimeoutTask[] = [];
const timed_tasks: TimeoutTask[] = [];

let pending_inserts = false;
let	running_timed = false;

const run_timed = (now: number) => {
	let last_index = timed_tasks.length - 1;
	while (~last_index && now >= timed_tasks[last_index].timestamp) timed_tasks[last_index--].callback(now);
	if (pending_inserts) {
		for (let i = 0, j = 0, this_task: TimeoutTask, that_task: TimeoutTask; i < pending_insert_timed.length; i++)
			if (now >= (this_task = pending_insert_timed[i]).timestamp) this_task.callback(now);
			else {
				for (j = last_index; ~j && this_task.timestamp > (that_task = timed_tasks[j]).timestamp; j--)
					timed_tasks[j + 1] = that_task;
				timed_tasks[j + 1] = this_task;
				last_index++;
			}
		pending_insert_timed.length = 0;
		pending_inserts = false;
	}
	return (running_timed = !!(timed_tasks.length = last_index + 1));
};

const unsafe_loop = (fn) => {
	if (0 === n) raf(run);
	next_frame[n++] = fn;
};

export const loop = (fn) => {
	let running = true;
	if (0 === n) raf(run);
	next_frame[n++] = (t) => !running || fn(t);
	return () => void (running = false);
};

export const setFrameTimeout = (callback: (t: number) => void, timestamp: number): TaskCanceller => {
	const task: TimeoutTask = { callback, timestamp };
	if (running_timed) {
		pending_inserts = !!pending_insert_timed.push(task);
	} else {
		unsafe_loop(run_timed);
		running_timed = true;
		timed_tasks.push(task);
	}
	return () => void (task.callback = noop);
};

/**
 * Calls function every frame with linear tween from 0 to 1
 */
export const setTweenTimeout = (
	stop: (now: number) => void,
	end_time: number,
	run: (now: number) => void,
	duration = end_time - now(),
	is_outro = false
): TaskCanceller => {
	let running = true;
	let t = 1 - (end_time - now) / duration || 0;
	if (!is_outro && t <= 1.0) run(t >= 0.0 ? t : 0);
	unsafe_loop((now) => {
		if (!running) return false;
		t = 1 - (end_time - now) / duration;
		if (t >= 1.0) return run(1), stop(now), false;
		if (t >= 0.0) run(t);
		return running;
	});
	return (run_last = false) => {
		if (run_last) run(1);
		running = false;
	};
};
/**
 * Calls function every frame with time elapsed in seconds
 */
export const onEachFrame = (
	callback: (seconds_elapsed: number) => boolean,
	on_stop?,
	max_skipped_frames = 4
): TaskCanceller => {
	max_skipped_frames *= framerate;
	let lastTime = now();
	let running = true;
	const cancel = (t) => (on_stop && on_stop(t), false);
	unsafe_loop((t: number) => {
		if (!running) return cancel(t);
		if (t > lastTime + max_skipped_frames) t = lastTime + max_skipped_frames;
		return callback((-lastTime + (lastTime = t)) / 1000) ? true : cancel(t);
	});
	return () => void (running = false);
};

/** tests only */
export const clear_loops = () => {
	next_frame.length = running_frame.length = timed_tasks.length = pending_insert_timed.length = n = i = j = +(running_timed = pending_inserts = false);
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