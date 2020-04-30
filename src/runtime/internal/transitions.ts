import { run_all } from './utils';
import { now } from './environment';
import { setAnimationTimeout, loopThen } from './loop';
import { animate_css } from './style_manager';
import { custom_event } from './dom';
import { TransitionConfig } from '../transition';
import { add_render_callback, add_flush_callback } from './scheduler';
import { Fragment } from './Component';

function startStopDispatcher(node: Element, direction: boolean) {
	add_render_callback(() => node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}start`)));
	return () => node.dispatchEvent(custom_event(`${!direction ? 'intro' : 'outro'}end`));
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

const eased = (fn: (t: number) => any, easing: (t: number) => number) => (easing ? (t: number) => fn(easing(t)) : fn);
const runner = (fn: (t0: number, t1: number) => any, reversed: boolean) =>
	reversed ? (t: number) => fn(1 - t, t) : (t: number) => fn(t, 1 - t);
type TransitionFn = (node: HTMLElement, params: any) => TransitionConfig;
export function run_transition(
	node: HTMLElement,
	fn: TransitionFn,
	is_intro = true,
	params = {},
	reversed_from = -1
): StopResetReverse {
	let config = fn(node, params);
	let running = true;

	let cancel_css;
	let cancel_raf;
	let dispatch_end;
	let end_time;

	const group = outros;
	if (!is_intro) group.r++;

	function start({ delay = 0, duration = 300, easing, tick, css }: TransitionConfig) {
		if (!running) return;
		const start_time = ~reversed_from ? reversed_from : now() + delay;
		end_time = start_time + duration;
		if (css)
			cancel_css = animate_css(
				runner(eased(css, easing), is_intro),
				node,
				duration,
				(end_time - start_time) / duration
			);
		dispatch_end = startStopDispatcher(node, is_intro);
		cancel_raf = tick
			? loopThen(runner(eased(tick, easing), is_intro), stop, duration, end_time)
			: setAnimationTimeout(stop, end_time);
	}
	function stop(reset_reverse?: 1 | -1) {
		if (!is_intro && 1 === reset_reverse && config && 'tick' in config) config.tick(1, 0);
		if (!running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (dispatch_end) dispatch_end();
		if (!is_intro && !--group.r) for (let i = 0; i < group.c.length; i++) group.c[i]();
		if (!~reset_reverse) return run_transition(node, fn, !is_intro, params, end_time);
		else if (!~reversed_from) running_bidi.delete(node);
	}
	// @ts-ignore
	if (typeof config === 'function') add_flush_callback(() => start((config = config())));
	else start(config);
	return stop;
}
export type StopResetReverse = (reset_reverse?: 1 | -1) => StopResetReverse;
const running_bidi: Map<HTMLElement, StopResetReverse> = new Map();
export function run_bidirectional_transition(node: HTMLElement, fn: TransitionFn, is_intro: boolean, params: any) {
	let cancel;
	if (running_bidi.has(node)) running_bidi.set(node, (cancel = running_bidi.get(node)(-1)));
	else running_bidi.set(node, (cancel = run_transition(node, fn, is_intro, params, -1)));
	return cancel;
}
