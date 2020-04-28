import { identity as linear, run_all, is_function } from './utils';
import { now } from './environment';
import { raf_timeout, loopThen } from './loop';
import { generate_rule } from './style_manager';
import { custom_event } from './dom';
import { TransitionConfig } from '../transition';
import { add_render_callback } from './scheduler';

function startStopDispatcher(node: Element, direction: boolean) {
	add_render_callback(() => node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}start`)));
	return () => node.dispatchEvent(custom_event(`${!direction ? 'intro' : 'outro'}end`));
}

const outroing = new Set();
let outros;

export function group_outros() {
	outros = {
		/* parent group */ p: outros,
		/* remaining outros */ r: 0,
		/* callbacks */ c: [],
	};
}

export function check_outros() {
	if (!outros.r) run_all(outros.c);
	outros = outros.p;
}

export function transition_in(block, local?: 0 | 1) {
	if (!block || !block.i) return;
	outroing.delete(block);
	block.i(local);
}

export function transition_out(block, local?: 0 | 1, detach?: 0 | 1, callback?: () => void) {
	if (!block || !block.o || outroing.has(block)) return;
	outroing.add(block);
	outros.c.push(() => {
		outroing.delete(block);
		if (!callback) return;
		if (detach) block.d(1);
		callback();
	});
	block.o(local);
}

const null_transition: TransitionConfig = { duration: 0 };

type TransitionFn = (node: HTMLElement, params: any) => TransitionConfig;
export function run_transition(
	node: HTMLElement,
	fn: TransitionFn,
	is_intro: boolean,
	params?: any,
	reversed_from?: number
): StopResetReverse {
	let config = fn(node, params);
	let running = true;

	let cancel_css;
	let cancel_raf;
	let dispatch_end;
	let start_time;

	const group = outros;
	if (!is_intro) group.r++;

	function start({ delay = 0, duration = 300, easing = linear, tick, css } = null_transition) {
		if (!running) return;
		const run = tick && (is_intro ? tick : (a, b) => tick(b, a));
		if (reversed_from) delay += duration - (now() - reversed_from);
		start_time = now() + delay;
		const end_time = start_time + duration;
		cancel_css = css && generate_rule(node, +!is_intro, +is_intro, duration, delay, easing, css);
		dispatch_end = startStopDispatcher(node, is_intro);
		cancel_raf = cancel_raf = !run
			? raf_timeout(stop, end_time)
			: loopThen(
					delay,
					(t) => ((t = easing((t - start_time) / duration)), run(t, 1 - t)),
					() => (run(1, 0), stop()),
					end_time
			  );
	}

	function stop(reset_reverse?: 1 | 2) {
		if (!is_intro && reset_reverse === 1 && config && 'tick' in config) config.tick(1, 0);
		if (!running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (dispatch_end) dispatch_end();
		if (!is_intro && !--group.r) run_all(group.c);
		if (reset_reverse === 2) return run_transition(node, fn, !is_intro, params, start_time);
		else if (!~reversed_from) running_bidi.delete(node);
	}
	if (is_function(config)) add_render_callback(() => start((config = config())));
	else start(config);
	return stop;
}
export type StopResetReverse = (reset_reverse?: 1 | 2) => StopResetReverse;
const running_bidi: Map<HTMLElement, StopResetReverse> = new Map();
export function run_bidirectional_transition(node: HTMLElement, fn: TransitionFn, is_intro: boolean, params: any) {
	if (running_bidi.has(node)) {
		running_bidi.set(node, running_bidi.get(node)(2));
	} else {
		running_bidi.set(node, run_transition(node, fn, is_intro, params, -1));
	}
}
