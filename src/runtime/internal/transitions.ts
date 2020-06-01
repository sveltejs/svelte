import { CssTransitionConfig } from '../transition';
import { Fragment } from './Component';
import { custom_event } from './dom';
import { now } from './environment';
import { setFrameTimeout, setTweenTimeout } from './loop';
import { add_measure_callback } from './scheduler';
import { animate_css } from './style_manager';
import { methodify, noop } from './utils';

type TransitionFn = (node: HTMLElement, params: any) => CssTransitionConfig;
export type StopResetReverseFn = (t?: number | -1) => StopResetReverseFn | void;

export const transition_in = (block: Fragment, local?) => {
	if (!block || !block.i) return;
	outroing.delete(block);
	block.i(local);
};

export const transition_out = (block: Fragment, local?) => {
	if (!block || !block.o || outroing.has(block)) return;
	outroing.add(block);
	block.o(local);
};
type TransitionGroup = {
	/* parent group 		*/ p: TransitionGroup;
	/* callbacks 			*/ c: Array<((cancelled: boolean) => void)>;
	/* running outros		*/ r: number;
	/* stop callbacks		*/ s: Array<((t: number) => void)>;
	/* outro timeout 		*/ t: number;
};
let transition_group: TransitionGroup;
const outroing = new Set();
export const group_transition_out = (fn) => {
	const c = [];
	const current_group = (transition_group = { p: transition_group, c, r: 0, s: [], t: 0 });
	fn((block, callback, detach = true) => {
		if (!block || !block.o || outroing.has(block)) return;
		outroing.add(block);
		c.push((cancelled = false) => {
			if (cancelled) {
				// block was destroyed before outro ended
				outroing.delete(block);
			} else if (outroing.has(block)) {
				outroing.delete(block);
				if (detach) block.d(1);
				callback();
			}
		});
		block.o(1);
	});
	if (!current_group.r) for (let i = 0; i < c.length; i++) c[i]();
	transition_group = transition_group.p;
};

const swap = (fn, rx) =>
	fn.length === 1
		? rx & tx.intro
			? fn
			: (t) => fn(1 - t)
		: rx & tx.intro
		? (t) => fn(t, 1 - t)
		: (t) => fn(1 - t, t);

const mirrored = (fn, rx, easing, _start, _end) => {
	const run = swap(fn, rx);
	return easing
		? rx & tx.intro
			? (t) => run(easing(t))
			: (t) => run(1 - easing(1 - t))
		: run;
};
const reversed = (fn, rx, easing, start = 0, end = 1) => {
	const run = swap(fn, rx);
	const difference = end - start;
	return easing
		? (t) => run(start + difference * easing(t))
		: (t) => run(start + difference * t);
};
const enum tx {
	intro = 1,
	outro = 2,
	reverse = 3,
	bidirectional = 4,
	animation = 8,
}
export const run_transition = /*#__PURE__*/ methodify(function transition(
	this: HTMLElement,
	fn: TransitionFn,
	rx: tx,
	params = {},
	/* internal to this file */
	elapsed_duration = 0,
	delay_left = -1,
	elapsed_ratio = 0
) {
	let config;
	
	let running = true;

	let cancel_css;
	let	cancel_raf;

	let start_time = 0;
	let	end_time = 0;

	const current_group = transition_group;
	if (rx & tx.outro) current_group.r++;

	add_measure_callback(() => {
		if (null === (config = fn(this, params))) return noop;
		return (current_frame_time) => {
			if (false === running) return;

			let { delay = 0, duration = 300, easing, tick, css, strategy = 'reverse' }: CssTransitionConfig =
				'function' === typeof config ? (config = config()) : config;

			const solver = 'reverse' === strategy ? reversed : mirrored;
			const runner = (fn) => solver(fn, rx, easing, elapsed_ratio, 1);

			if (rx & tx.bidirectional) {
				if (-1 !== delay_left) delay = delay_left;
				if (solver === reversed) duration -= elapsed_duration;
				else if (solver === mirrored) delay -= elapsed_duration;
			}

			end_time = (start_time = current_frame_time + delay) + duration;

			if (0 === (rx & tx.animation)) {
				this.dispatchEvent(custom_event(`${rx & tx.intro ? 'in' : 'ou'}trostart`));
			}

			if (css) cancel_css = animate_css(this, runner(css), duration, delay);
			
			if (rx & tx.outro) {
				if (current_group.s.push(stop) === current_group.r) {
					setFrameTimeout((t) => {
						for (let i = 0; i < current_group.s.length; i++) current_group.s[i](t);
					}, Math.max(end_time, current_group.t));
				} else {
					current_group.t = Math.max(end_time, current_group.t);
				}
				if (tick) cancel_raf = setTweenTimeout(noop, end_time, runner(tick), duration, true);
			} else {
				cancel_raf = tick ? setTweenTimeout(stop, end_time, runner(tick), duration) : setFrameTimeout(stop, end_time);
			}
		};
	});

	const stop: StopResetReverseFn = (t?: number | 1 | -1) => {
		if (t === 1 && rx & tx.outro && 0 === (rx & tx.bidirectional) && 'tick' in config) config.tick(1, 0);

		if (false === running) return;
		else running = false;

		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf(rx & tx.outro && t >= end_time);

		if (rx & tx.animation) return;

		if (t >= end_time) this.dispatchEvent(custom_event(`${rx & tx.intro ? 'in' : 'ou'}troend`));

		if (rx & tx.outro && !--current_group.r)
			for (let i = 0; i < current_group.c.length; i++) current_group.c[i](t === void 0);

		if (0 === (rx & tx.bidirectional)) return;

		if (-1 === t)
			return (
				(t = now()) < end_time &&
				run_transition(
					this,
					() => config,
					rx ^ tx.reverse,
					params,
					end_time - t,
					start_time > t ? start_time - t : 0,
					(1 - elapsed_ratio) * (1 - (config.easing || ((v) => v))(1 - (end_time - t) / (end_time - start_time)))
				)
			);
		else running_bidi.delete(this);
	};

	return stop;
});

const running_bidi: Map<HTMLElement, StopResetReverseFn> = new Map();
export const run_bidirectional_transition = /*#__PURE__*/ methodify(
	function bidirectional(this: HTMLElement, fn: TransitionFn, rx: tx.intro | tx.outro, params: any ) {
		let cancel;
		running_bidi.set(
			this,
			(cancel =
				(running_bidi.has(this) && running_bidi.get(this)(-1)) || run_transition(this, fn, rx | tx.bidirectional, params))
		);
		return cancel;
	}
);
export const run_duration = (duration, value1, value2?): number =>
	typeof duration === 'function' ? duration(value1, value2) : duration;
