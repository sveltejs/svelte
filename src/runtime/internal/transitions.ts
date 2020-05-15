import { TransitionConfig } from '../transition';
import { Fragment } from './Component';
import { custom_event } from './dom';
import { now } from 'svelte/environment';
import { setFrameTimeout, setTweenTimeout } from './loop';
import { add_measure_callback } from './scheduler';
import { animate_css } from './style_manager';
import { noop } from './utils';

type TransitionFn = (node: HTMLElement, params: any) => TransitionConfig;
export type StopResetReverse = (t?: number | -1) => StopResetReverse | void;

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

const swap = (fn, rx) =>
	fn.length === 1 ? (rx & tx.intro ? fn : (t) => fn(1 - t)) : rx & tx.intro ? (t) => fn(t, 1 - t) : (t) => fn(1 - t, t);

const mirrored = (fn, rx, easing) => {
	const run = swap(fn, rx);
	return easing ? (rx & tx.intro ? (t) => run(easing(t)) : (t) => run(1 - easing(1 - t))) : run;
};
const reversed = (fn, rx, easing, start = 0, end = 1) => {
	const run = swap(fn, rx);
	const difference = end - start;
	return easing ? (t) => run(start + difference * easing(t)) : (t) => run(start + difference * t);
};
export enum tx {
	intro = 1,
	outro = 2,
	bidirectional = 4,
	bidirectional_intro = 5,
	bidirectional_outro = 6,
	animation = 8,
}
export const run_transition = /*#__PURE__*/ Function.prototype.call.bind(function transition(
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
	let cancel_raf;

	let start_time = 0;
	let end_time = 0;

	const current_group = transition_group;
	if (rx & tx.outro) current_group.r++;

	add_measure_callback(() => {
		if (null === (config = fn(this, params))) return noop;
		return (t) => {
			if (false === running) return;
			if ('then' in config) return void config.then(stop);

			let { delay = 0, duration = 300, easing, tick, css, strategy = 'reverse' }: TransitionConfig =
				'function' === typeof config ? (config = config()) : config;

			const solver = 'reverse' === strategy ? reversed : mirrored;
			const runner = (fn) => solver(fn, rx, easing, elapsed_ratio, 1);

			if (rx & tx.bidirectional) {
				if (-1 !== delay_left) delay = delay_left;
				if (solver === reversed) duration -= elapsed_duration;
				else if (solver === mirrored) delay -= elapsed_duration;
			}

			end_time = (start_time = t + delay) + duration;

			if (0 === (rx & tx.animation)) {
				this.dispatchEvent(custom_event(`${rx & tx.intro ? 'in' : 'ou'}trostart`));
			}

			if (css) cancel_css = animate_css(this, runner(css), duration, delay);
			cancel_raf = tick ? setTweenTimeout(stop, end_time, runner(tick), duration) : setFrameTimeout(stop, end_time);
		};
	});

	const stop: StopResetReverse = (t?: number | 1 | -1) => {
		if (!running) return;
		else running = false;

		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();

		if (0 === (rx & tx.animation)) {
			if (t >= end_time) {
				this.dispatchEvent(custom_event(`${rx & tx.intro ? 'in' : 'ou'}troend`));
			}
			if (rx & tx.outro) {
				check_transition_group(current_group);
			}
		}

		if (rx & tx.bidirectional) {
			if (-1 === t) {
				return (
					(t = now()) < end_time &&
					run_transition(
						this,
						() => config,
						rx ^ 1,
						params,
						end_time - t,
						start_time > t ? start_time - t : 0,
						(1 - elapsed_ratio) * (1 - config.easing(1 - (end_time - t) / (end_time - start_time)))
					)
				);
			} else {
				running_bidi.delete(this);
			}
		}
	};

	return stop;
});

const running_bidi: Map<HTMLElement, StopResetReverse> = new Map();
export const run_bidirectional_transition = /*#__PURE__*/ Function.prototype.call.bind(function bidirectional(
	this: HTMLElement,
	fn: TransitionFn,
	rx: tx.intro | tx.outro,
	params: any
) {
	let cancel;
	running_bidi.set(
		this,
		(cancel =
			(running_bidi.has(this) && running_bidi.get(this)(-1)) || run_transition(this, fn, rx | tx.bidirectional, params))
	);
	return cancel;
});
export const run_duration = (duration, value1, value2?): number =>
	typeof duration === 'function' ? duration(value1, value2) : duration;
