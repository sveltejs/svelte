import { now, raf } from './environment';
import { calc_framerate, FRAME_RATE } from './style_manager';
import { noop } from './utils';
type TaskCallback = (t: number) => boolean;
type TaskCanceller = () => void;

let next_frame: Array<TaskCallback> = [];
let running_frame: Array<TaskCallback> = [];
let next_frame_length = 0;
const run = (t: number) => {
	t = now();
	[running_frame, next_frame] = [next_frame, running_frame];
	for (let i = (next_frame_length = 0), j = running_frame.length, v; i < j; i++) {
		if ((v = running_frame[i])(t)) {
			next_frame[next_frame_length++] = v;
		}
	}
	running_frame.length = 0;
	if (next_frame_length) raf(run);
	else console.log('ended loop');
};

type TimeoutTask = { timestamp: number; callback: (now: number) => void };
const timed_tasks: Array<TimeoutTask> = [];
const pending_insert_timed: Array<TimeoutTask> = [];
let running_timed = false;
let pending_inserts = false;
const run_timed = (now: number) => {
	/* Runs every timed out task */
	let last_index = timed_tasks.length - 1;
	while (~last_index && now >= timed_tasks[last_index].timestamp) timed_tasks[last_index--].callback(now);
	if (pending_inserts) {
		for (let i = 0, j = 0, this_task: TimeoutTask, that_task: TimeoutTask; i < pending_insert_timed.length; i++)
			if (now >= (this_task = pending_insert_timed[i]).timestamp) this_task.callback(now);
			else {
				/* moves each task up until this_task.timestamp > task.timestamp */
				for (j = last_index; ~j && this_task.timestamp > (that_task = timed_tasks[j]).timestamp; j--)
					timed_tasks[j + 1] = that_task;
				timed_tasks[j + 1] = this_task;
				last_index++;
			}
		pending_inserts = !!(pending_insert_timed.length = 0);
	}
	return (running_timed = !!(timed_tasks.length = last_index + 1));
};
const unsafe_loop = (fn) => {
	if (!next_frame_length) raf(run);
	next_frame[next_frame_length++] = fn;
};
export const loop = (fn) => {
	let running = true;
	if (!next_frame_length) raf(run);
	next_frame[next_frame_length++] = (t) => !running || fn(t);
	return () => void (running = false);
};
export const setAnimationTimeout = (callback: () => void, timestamp: number): TaskCanceller => {
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
 * Calls function every frame with a value going from 0 to 1
 */
export const useTween = (
	run: (now: number) => void,
	stop: (now: number) => void,
	end_time: number,
	duration = end_time - now()
): TaskCanceller => {
	let running = true;
	unsafe_loop((t) => {
		if (!running) return false;
		t = (end_time - t) / duration;
		if (t >= 1) return run(1), stop(t), false;
		if (t >= 0) run(t);
		return running;
	});
	return () => void (running = false);
};
/**
 * Calls function every frame with the amount of elapsed frames
 */
export const onEachFrame = (
	each_frame: (seconds_elapsed: number) => boolean,
	on_stop?,
	max_skipped_frames = 4
): TaskCanceller => {
	max_skipped_frames *= FRAME_RATE || calc_framerate();
	let lastTime = now();
	let running = true;
	const cancel = (t) => (on_stop && on_stop(t), false);
	unsafe_loop((t: number) => {
		if (!running) return cancel(t);
		if (t > lastTime + max_skipped_frames) t = lastTime + max_skipped_frames;
		return each_frame((-lastTime + (lastTime = t)) / 1000) ? true : cancel(t);
	});
	return () => void (running = false);
};
// tests
export const clear_loops = () =>
	void (next_frame.length = running_frame.length = timed_tasks.length = pending_insert_timed.length = next_frame_length = +(running_timed = pending_inserts = false));
