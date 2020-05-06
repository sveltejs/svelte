import { now, raf } from './environment';
import { calc_framerate, FRAME_RATE } from './style_manager';
import { noop } from './utils';
type TaskCallback = (t: number) => boolean;
type TaskCanceller = () => void;

let next_frame: Array<TaskCallback> = [];
let running_frame: Array<TaskCallback> = [];
function run(t: number) {
	[running_frame, next_frame] = [next_frame, running_frame];
	let next_frame_tasks = 0;
	for (let i = 0, j = running_frame.length, v; i < j; i++) {
		if ((v = running_frame[i])(t)) next_frame[next_frame_tasks++] = v;
	}
	running_frame.length = 0;
	if (next_frame_tasks) raf(run);
}

type TimeoutTask = { t: number; c: (now: number) => void };
const timed_tasks: Array<TimeoutTask> = [];
const pending_insert_timed: Array<TimeoutTask> = [];
let running_timed = false;
let pending_inserts = false;
function run_timed(now: number) {
	/* Runs every timed out task */
	let last_index = timed_tasks.length - 1;
	while (last_index >= 0 && now >= timed_tasks[last_index].t) {
		timed_tasks[last_index--].c(now);
	}
	if (pending_inserts) {
		for (
			let i = 0, j = last_index, this_task: TimeoutTask, that_task: TimeoutTask;
			i < pending_insert_timed.length;
			i++
		) {
			if (now >= (this_task = pending_insert_timed[i]).t) {
				this_task.c(now);
			} else {
				for (j = last_index; j > 0 && this_task.t > (that_task = timed_tasks[j]).t; j--) {
					/* move each task up until this_task.timestamp > task.timestamp */
					timed_tasks[j + 1] = that_task;
				}
				timed_tasks[j] = this_task;
				last_index++;
			}
		}
		pending_inserts = !!(pending_insert_timed.length = 0);
	}
	return (running_timed = !!(timed_tasks.length = last_index + 1));
}
export function setAnimationTimeout(callback: () => void, timestamp: number): TaskCanceller {
	const task: TimeoutTask = { c: callback, t: timestamp };
	if (running_timed) {
		pending_inserts = !!pending_insert_timed.push(task);
	} else {
		timed_tasks.push(task);
		if (1 === next_frame.push(run_timed)) raf(run);
	}
	return () => void (task.c = noop);
}
/**
 * Calls function every frame with a value going from 0 to 1
 */
export function useTween(
	run: (now: number) => void,
	stop: () => void,
	end_time: number,
	duration = end_time - now()
): TaskCanceller {
	let running = true;
	if (
		1 ===
		next_frame.push((t) => {
			if (!running) return false;
			t = (end_time - t) / duration;
			if (t >= 1) return run(1), stop(), (running = false);
			if (t >= 0) run(t);
			return running;
		})
	)
		raf(run);
	return () => void (running = false);
}
/**
 * Calls function every frame with the amount of elapsed frames
 */
export function onEachFrame(
	each_frame: (seconds_elapsed: number) => boolean,
	on_stop?,
	max_skipped_frames = 4
): TaskCanceller {
	max_skipped_frames *= FRAME_RATE || calc_framerate();
	let lastTime = now();
	let running = true;
	if (
		1 ===
		next_frame.push((t: number) => {
			if (!running) return on_stop && on_stop(t), false;
			if (t > lastTime + max_skipped_frames) t = lastTime + max_skipped_frames;
			return each_frame((-lastTime + (lastTime = t)) / 1000);
		})
	)
		raf(run);
	return () => void (running = false);
}
// tests
export const clear_loops = () =>
	void (next_frame.length = running_frame.length = timed_tasks.length = pending_insert_timed.length = 0);
