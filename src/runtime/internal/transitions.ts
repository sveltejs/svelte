import { Fragment } from "./Component";
import { custom_event } from "./dom";
import { setFrameTimeout, setTweenTimeout, frame } from "./loop";
import { add_measure_callback, tick } from "./scheduler";
import { animate_css } from "./style_manager";
import { methodify, noop } from "./utils";


export interface CssAnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
}
export interface CssTransitionConfig extends CssAnimationConfig {
	css?: (t: number, u?: number) => string;
	tick?: (t: number, u?: number) => void;
	strategy?: EasingStrategy;
}
export type TimeableConfig = Omit<CssAnimationConfig, 'duration'> & { duration?: number | ((len: number) => number) };
const enum EasingStrategy {
	balanced = "balanced",
	reversed = "reversed",
	mirrored = "mirrored",
}
const enum TransitionEvent {
	introstart = "introstart",
	introend = "introend",
	outrostart = "outrostart",
	outroend = "outroend"
}
export const transition_in = (block: Fragment, local?) => {
	// todo : is `!block` necessary ?
	if (!block || !block.i) return;
	outroing.delete(block);
	block.i(local);
};

export const transition_out = (block: Fragment, local?) => {
	// todo : are `!block` and `outroing.has` checks necessary ?
	if (!block || !block.o || outroing.has(block)) return;
	outroing.add(block);
	block.o(local);
};
type TransitionGroup = {
	/* parent group 		*/ p: TransitionGroup;
	/* callbacks 			*/ c: Array<(cancelled: boolean) => void>;
	/* running outros		*/ r: number;
	/* stop callbacks		*/ s: Array<(t: number) => void>;
	/* outro timeout 		*/ t: number;
};
let transition_group: TransitionGroup;
const outroing = new Set();
export const group_transition_out = (fn) => {
	const c = [];
	const current_group = (transition_group = {
		p: transition_group,
		c,
		r: 0,
		s: [],
		t: 0,
	});
	fn((block, callback, detach = true) => {
		if (!block || !block.o || outroing.has(block)) return;
		outroing.add(block);
		c.push((cancelled = false) => {
			if (cancelled) {
				// block destroyed before outro ended
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
type Rect = DOMRect | ClientRect;
type MeasureCallback = (is_intro?: boolean) => CssTransitionConfig;
type CustomTransitionFunction = (node: HTMLElement, params: any) => MeasureCallback | CssTransitionConfig;
type AnimationFn = (node: Element, { from, to }: { from: Rect; to: Rect }, params: any) => CssTransitionConfig;
type StopResetReverseFn = (t?: number | 1 | -1) => StopResetReverseFn | void;

const swap = (fn, is_intro) =>
	fn.length === 1
		? is_intro
			? fn
			: (t) => fn(1 - t)
		: is_intro
		? (t) => fn(t, 1 - t)
		: (t) => fn(1 - t, t);

const mirrored = (fn, is_intro, easing, _start?, _end?) => {
	const run = swap(fn, is_intro);
	return easing
		? is_intro
			? (t) => run(easing(t))
			: (t) => run(1 - easing(1 - t))
		: run;
};

const reversed = (fn, is_intro, easing, start = 0, end = 1) => {
	const run = swap(fn, is_intro);
	const difference = end - start;
	return easing
		? (t) => run(start + difference * easing(t))
		: (t) => run(start + difference * t);
};

const balanced = (fn, is_intro, easing, start = 0, end = 1) => {
	const run = swap(fn, is_intro);
	const difference = end - start;
	return easing
		? (t) => run(start + difference * easing(t))
		: (t) => run(start + difference * t);
};

export const run_animation = /*#__PURE__*/ methodify(function (this: HTMLElement, from: Rect, fn: AnimationFn, params: CssTransitionConfig = {}) {
	let running = true;
	let cancel_css;
	let cancel_raf;
	add_measure_callback(() => {
		const to = this.getBoundingClientRect();
		if (from.top === to.top && from.left === to.left && from.right === to.right && from.bottom === to.bottom) return noop;
		const config = fn(this, { from, to }, params);
		return (current_frame_time) => {
			if (false === running) return;
			const { delay = 0, duration = 300, easing, tick, css }: CssTransitionConfig = config;
			const end_time = current_frame_time + delay + duration;
			const runner = (fn) => reversed(fn, true, easing);
			if (css) cancel_css = animate_css(this, runner(css), duration, delay);
			if (tick) tick(0, 1);
			cancel_raf = tick ? setTweenTimeout(stop, end_time, runner(tick), duration) : setFrameTimeout(stop, end_time);
		};
	});
	const stop = () => {
		if (false === running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
	};
	return stop;
});
export const run_in = /*#__PURE__*/ methodify(function (this: HTMLElement, fn: CustomTransitionFunction, params: CssTransitionConfig = {}) {
	let config;
	let running = true;
	let cancel_css;
	let cancel_raf;
	let end_time;
	add_measure_callback(() => {
		config = fn(this, params);
		return (current_frame_time) => {
			const { delay = 0, duration = 300, easing, tick, css }: CssTransitionConfig =
				"function" === typeof config ? (config = config()) : config;
			const runner = (fn) => balanced(fn, true, easing);
			end_time = current_frame_time + delay + duration;
			this.dispatchEvent(custom_event(TransitionEvent.introstart));
			if (css) cancel_css = animate_css(this, runner(css), duration, delay);
			cancel_raf = tick ? setTweenTimeout(stop, end_time, runner(tick), duration ) : setFrameTimeout(stop, end_time);
		};
	});
	const stop = (t?: number) => {
		if (false === running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (t && t >= end_time) this.dispatchEvent(custom_event(TransitionEvent.introend));
	};
	return stop;
});
export const run_out = /*#__PURE__*/ methodify(function (this: HTMLElement, fn: CustomTransitionFunction, params: CssTransitionConfig = {}) {
	let config;
	let running = true;
	let cancel_css;
	let cancel_raf;
	let end_time;
	const current_group = transition_group;
	current_group.r++;
	add_measure_callback(() => {
		config = fn(this, params);
		return (current_frame_time) => {
			const { delay = 0, duration = 300, easing, tick, css }: CssTransitionConfig =
				"function" === typeof config ? (config = config()) : config;
			const runner = (fn) => balanced(fn, false, easing);
			end_time = current_frame_time + delay + duration;
			current_group.t = Math.max(end_time, current_group.t);
			if (current_group.s.push(stop) === current_group.r) {
				setFrameTimeout((t) => {
					for (let i = 0; i < current_group.s.length; i++) {
						current_group.s[i](t);
					}
				}, current_group.t);
			}
			this.dispatchEvent(custom_event(TransitionEvent.outrostart));
			if (css) cancel_css = animate_css(this, runner(css), duration, delay);
			if (tick) cancel_raf = setTweenTimeout(noop, end_time, runner(tick), duration);
		};
	});
	const stop = (t?: number) => {
		if (1 === t && "tick" in config) config.tick(1, 0);
		if (false === running) return;
		else running = false;
		if (cancel_css) cancel_css();
		if (cancel_raf) cancel_raf();
		if (t && t >= end_time) {
			if ("tick" in config) config.tick(0, 1);
			this.dispatchEvent(custom_event(TransitionEvent.outroend));
		}
		if (!--current_group.r) for (let i = 0, { c } = current_group, r = t === void 0;i < c.length;i++) c[i](r);
	};
	return stop;
});
export const create_bidirectional_transition = /*#__PURE__*/ methodify(function(this: HTMLElement, fn: CustomTransitionFunction, params?: CssTransitionConfig) {
	let transition_delay = 0.0;
	let pending = 0;
	let prev;

	const u = (new_fn = fn, new_params = params) => {
		let test_config;
		if (typeof (test_config = (fn = new_fn)(this,(params = new_params))) === "function") test_config = test_config();
		transition_delay = test_config.delay || 0.0;
	};
	u();

	const run_transition = (is_intro: boolean, cancel_previous?) => {
		const delayed_start = transition_delay && cancel_previous && pending;

		let config;

		let running = true;
		let cancelled = false;

		let cancel_css;
		let cancel_raf;

		let start_time = 0.0;
		let end_time = 0.0;
		let ratio_left = 0.0;

		const current_group = transition_group;
		if (!is_intro) current_group.r++;

		const run = (flush_frame_time) => {
			pending++;
			const [prev_duration_left, prev_ratio_left] = ((cancel_previous && cancel_previous(flush_frame_time)) || [0.0, 0.0] );
			ratio_left = prev_ratio_left;
			return () => {
				config = fn(this, params);
				return (current_frame_time) => {
					let { tick, css, duration = 300.0, delay = 0.0, easing, strategy = EasingStrategy.balanced }: CssTransitionConfig = 
						"function" === typeof config ? (config = config(is_intro)) : config;
					const solver = EasingStrategy.balanced === strategy ? balanced : EasingStrategy.reversed === strategy ? reversed : mirrored;
					const runner = (fn) => solver(fn, is_intro, easing, ratio_left, 1);
					if (delayed_start) delay = 0;
					if (solver === reversed) duration -= prev_duration_left;
					else if (solver === balanced) duration *= 1 - ratio_left;
					else if (solver === mirrored) delay -= prev_duration_left;
					start_time = current_frame_time + delay;
					end_time = start_time + duration;
					if (cancelled) return;
					this.dispatchEvent(custom_event(is_intro ? TransitionEvent.introstart : TransitionEvent.outrostart));
					if (css) cancel_css = animate_css(this, runner(css), duration, delay);
					if (tick) cancel_raf = setTweenTimeout(is_intro ? stop : noop, end_time, runner(tick), duration);
					else if (is_intro) cancel_raf = setFrameTimeout(stop, end_time);
					if (!is_intro) {
						current_group.t = Math.max(end_time, current_group.t);
						if (current_group.s.push(stop) === current_group.r) {
							setFrameTimeout((t) => {
								for (let i = 0; i < current_group.s.length; i++) {
									current_group.s[i](t);
								}
							}, current_group.t);
						}
					}
					setFrameTimeout(() => {
						if (!cancelled || !pending) {
							if (!is_intro && tick) tick(0, 1);
							this.dispatchEvent(custom_event(is_intro ? TransitionEvent.introend : TransitionEvent.outroend));
						}
					}, end_time);
				};
			};
		};

		const cancel = (t) => {
			if (!cancelled) {
				pending--;
				cancelled = true;
				if (cancel_css) cancel_css();
				if (cancel_raf) cancel_raf();
			}
			if (!config || 1 === t) return;
			const duration_left = end_time - t;
			const next_ratio_left = 1 - duration_left / (end_time - start_time);
			return duration_left > 0 && next_ratio_left > 0 && [duration_left, (1 - ratio_left) * (1 - (config.easing || ((v) => v))(next_ratio_left))];
		};

		const stop: StopResetReverseFn = (t?: number | -1 | 1) => {
			if (running) {
				running = false;
				if (config) {
					if (t && t >= end_time) {
						if (pending === 1) cancel(1);
					}
					if (!is_intro) {
						if (!--current_group.r) {
							for (let i = 0, { c } = current_group, r = Math.abs(t) === 1; i < c.length; i++) c[i](r);
						}
					}
				}
			}
			if (t === -1) return run_transition(!is_intro, cancel);
		};

		if (delayed_start) {
			setFrameTimeout((t) => {
				add_measure_callback(run(t));
				tick();
			}, frame.time + transition_delay);
		} else {
			add_measure_callback(run(frame.time));
		}

		return stop;
	};

	return {
		u,
		o() {
			prev = prev ? prev(-1) : run_transition(false);
		},
		i() {
			prev = prev ? prev(-1) : run_transition(true);
		},
		d() {
			if (prev) prev(1);
		}
	};
});
export const run_duration = (duration, value1, value2?): number =>
	typeof duration === "function" ? duration(value1, value2) : duration;
