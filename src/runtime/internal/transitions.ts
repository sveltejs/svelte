import { run_all } from './utils';
import { now } from './environment';
import { setAnimationTimeout, useTween } from './loop';
import { animate_css } from './style_manager';
import { custom_event } from './dom';
import { TransitionConfig } from '../transition';
import { add_measure_callback, add_render_callback } from './scheduler';
import { Fragment } from './Component';

function startStopDispatcher(node: Element, is_intro: boolean) {
	node.dispatchEvent(custom_event(`${is_intro ? 'intro' : 'outro'}start`));
	return () => node.dispatchEvent(custom_event(`${is_intro ? 'intro' : 'outro'}end`));
}

const outroing = new Set();

let outros;
export function group_outros() {
	outros = {
		/* 	parent group 	*/ p: outros,
		/* 	callbacks 		*/ c: [],
		/* 	remaining outros */ r: 0,
	};
}

export function check_outros() {
	if (!outros.r) run_all(outros.c);
	outros = outros.p;
}

export function transition_in(block: Fragment, local?: 0 | 1) {
	if (!block || !block.i) return;
	outroing.delete(block);
	block.i(local);
}

export function transition_out(block: Fragment, local?: 0 | 1, detach?: 0 | 1, callback?: () => void) {
	if (!block || !block.o || outroing.has(block)) return;
	outroing.add(block);
	outros.c.push(() => {
		if (!outroing.has(block)) return;
		outroing.delete(block);
		if (!callback) return;
		if (detach) block.d(1);
		callback();
	});
	block.o(local);
}

const eased = (fn: (t: number) => any, easing: (t: number) => number, start, end) => (t: number) =>
	fn(start + (end - start) * easing(t));
//easing ? (!is_intro ? (t: number) => fn(easing(t)) : (t: number) => fn(1 - easing(1 - t))) : fn;
const runner = (fn: (t0: number, t1: number) => any, is_intro: boolean) =>
	is_intro ? (t: number) => fn(t, 1 - t) : (t: number) => fn(1 - t, t);
const mirror = (fn, easing, is_intro) => {
	const run = is_intro ? (t) => fn(1 - t, t) : (t) => fn(t, 1 - t);
	return easing ? (is_intro ? (t) => run(1 - easing(1 - t)) : (t) => run(easing(t))) : run;
};
type TransitionFn = (node: HTMLElement, params: any) => TransitionConfig;
export function run_transition(
	node: HTMLElement,
	fn: TransitionFn,
	is_intro = true,
	params = {},
	left_duration = 0,
	prev_left = 0
): StopResetReverse {
	let config;
	let running = true;

	let cancel_css;
	let cancel_raf;
	let dispatch_end;
	let end_time;
	let t;
	let start_ratio;

	const group = outros;
	if (!is_intro) group.r++;

	const start = ({ delay = 0, duration = 300, easing, tick, css }: TransitionConfig) => {
		if (!running) return;
		t = duration - (left_duration > 0 ? left_duration : 0);
		end_time = now() + t;
		start_ratio = 1 - easing((t - prev_left) / duration);
		if (css) cancel_css = animate_css(eased(runner(css, is_intro), easing, start_ratio, 1), node, t, 0);
		dispatch_end = startStopDispatcher(node, is_intro);
		cancel_raf = tick
			? useTween(eased(runner(tick, is_intro), easing, start_ratio, 1), stop, end_time, t)
			: setAnimationTimeout(stop, end_time);
	};

	const stop = (end_reset_reverse?: number | 1 | -1) => {
		if (!running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (t > end_time && dispatch_end) dispatch_end();
		if (!is_intro && !--group.r) for (let i = 0; i < group.c.length; i++) group.c[i]();
		if (!~end_reset_reverse)
			return run_transition(node, () => config, !is_intro, params, end_time - now(), left_duration);
		else if (left_duration) running_bidi.delete(node);
	};

	add_measure_callback(() => {
		config = fn(node, params);
		return () => start(typeof config === 'function' ? (config = config()) : config);
	});

	return stop;
}
export type StopResetReverse = (reset_reverse?: 1 | -1) => StopResetReverse;
const running_bidi: Map<HTMLElement, StopResetReverse> = new Map();
export function run_bidirectional_transition(node: HTMLElement, fn: TransitionFn, is_intro: boolean, params: any) {
	let cancel;
	if (running_bidi.has(node) && (cancel = running_bidi.get(node)(-1))) running_bidi.set(node, cancel);
	else running_bidi.set(node, (cancel = run_transition(node, fn, is_intro, params, -1)));
	return cancel;
}
