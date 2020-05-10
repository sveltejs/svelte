import { TransitionConfig } from '../transition';
import { Fragment } from './Component';
import { custom_event } from './dom';
import { now } from './environment';
import { setFrameTimeout, setTweenTimeout } from './loop';
import { add_measure_callback } from './scheduler';
import { animate_css } from './style_manager';

type TransitionFn = (node: HTMLElement, params: any) => TransitionConfig;
export type StopResetReverse = (reset_reverse?: 1 | -1) => StopResetReverse;

export const transition_in = (block: Fragment, local?) => {
	if (!block || !block.i) return;
	outroing.delete(block);
	block.i(local);
};

export const transition_out = (block: Fragment, local) => {
	if (!block || !block.o || outroing.has(block)) return;
	outroing.add(block);
	block.o(local);
};

let transition_group;
const outroing = new Set();
const check_transition_group = (group, decrement = true) => {
	if (decrement) group.r--;
	if (!group.r) for (let i = 0; i < group.c.length; i++) group.c[i]();
};
export const group_transition_out = (fn) => {
	const c = [];
	const current_group = (transition_group = { p: transition_group, c, r: 0 });
	fn((block, callback, detach = true) => {
		if (!block || !block.o || outroing.has(block)) return;
		outroing.add(block);
		c.push(() => {
			if (outroing.has(block)) {
				outroing.delete(block);
				if (detach) block.d(1);
				// callback always ?
				callback();
			}
		});
		block.o(1);
	});
	check_transition_group(current_group, false);
	transition_group = transition_group.p;
};
// todo : deprecate
function startStopDispatcher(node: Element, is_intro: boolean) {
	node.dispatchEvent(custom_event(`${is_intro ? 'intro' : 'outro'}start`));
	return () => node.dispatchEvent(custom_event(`${is_intro ? 'intro' : 'outro'}end`));
}

/* todo: deprecate */
const swap = (fn, is_intro) =>
	fn.length === 1 ? (is_intro ? fn : (t) => fn(1 - t)) : is_intro ? (t) => fn(t, 1 - t) : (t) => fn(1 - t, t);

const mirrored = (fn, is_intro, easing) => {
	const run = swap(fn, is_intro);
	return easing ? (!is_intro ? (t) => run(1 - easing(1 - t)) : (t) => run(easing(t))) : run;
};

const reversed = (fn, is_intro, easing, start = 0, end = 1) => {
	const run = swap(fn, is_intro);
	const difference = end - start;
	return easing ? (t) => run(start + difference * easing(t)) : (t) => run(start + difference * t);
};

export const run_transition = (
	node: HTMLElement,
	fn: TransitionFn,
	is_intro = true,
	params = {},
	/* internal to this file */
	is_bidirectional = false,
	elapsed_duration = 0,
	delay_left = -1,
	elapsed_ratio = 0
) => {
	let config;
	let running = true;

	let cancel_css;
	let cancel_raf;
	let dispatch_end;

	let start_time = 0;
	let end_time = 0;

	const current_group = transition_group;
	if (!is_intro) transition_group.r++;

	const start = ({ delay = 0, duration = 300, easing, tick, css, strategy = 'reverse' }: TransitionConfig) => {
		if (!running) return;

		if (~delay_left) delay = delay_left;

		const solver = strategy === 'reverse' ? reversed : mirrored;
		const runner = (fn) => solver(fn, is_intro, easing, elapsed_ratio, 1);

		if (solver === mirrored) {
			delay -= elapsed_duration;
		} else if (solver === reversed) {
			duration -= elapsed_duration;
		}

		end_time = (start_time = now() + delay) + duration;

		dispatch_end = startStopDispatcher(node, is_intro);

		if (css) cancel_css = animate_css(runner(css), node, duration, delay);
		cancel_raf = tick ? setTweenTimeout(stop, end_time, runner(tick), duration) : setFrameTimeout(stop, end_time);
	};

	const stop: StopResetReverse = (t?: number | 1 | -1) => {
		if (!running) return;
		else running = false;

		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (t > end_time) {
			if (dispatch_end) {
				dispatch_end();
			}
		}

		if (!is_intro) check_transition_group(current_group);

		if (is_bidirectional) {
			if (-1 === t) {
				return (
					(t = now()) < end_time &&
					run_transition(
						node,
						() => config,
						!is_intro,
						params,
						true,
						end_time - t,
						start_time > t ? start_time - t : 0,
						(1 - elapsed_ratio) * (1 - config.easing(1 - (end_time - t) / (end_time - start_time)))
					)
				);
			} else {
				running_bidi.delete(node);
			}
		}
	};

	add_measure_callback(() => {
		config = fn(node, params);
		return () => start(typeof config === 'function' ? (config = config()) : config);
	});

	return stop;
};

const running_bidi: Map<HTMLElement, StopResetReverse> = new Map();
export const run_bidirectional_transition = (node: HTMLElement, fn: TransitionFn, is_intro: boolean, params: any) => {
	let cancel;
	if (running_bidi.has(node) && (cancel = running_bidi.get(node)(-1))) running_bidi.set(node, cancel);
	else running_bidi.set(node, (cancel = run_transition(node, fn, is_intro, params, true)));
	return cancel;
};
export const run_duration = (duration, ...args): number =>
	typeof duration === 'function' ? duration.apply(null, args) : duration;
