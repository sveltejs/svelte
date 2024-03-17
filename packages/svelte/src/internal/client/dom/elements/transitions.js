import { noop, run } from '../../../common.js';
import { user_effect } from '../../reactivity/effects.js';
import { current_effect, untrack } from '../../runtime.js';
import { raf } from '../../timing.js';
import { loop } from '../../loop.js';
import { run_transitions } from '../../render.js';
import { TRANSITION_GLOBAL, TRANSITION_IN, TRANSITION_OUT } from '../../constants.js';

const active_tick_animations = new Set();
const DELAY_NEXT_TICK = Number.MIN_SAFE_INTEGER;

/** @type {undefined | number} */
let active_tick_ref = undefined;

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('#client').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @returns {void}
 */
export function animate(dom, get_transition_fn, props) {
	// TODO
	// bind_transition(dom, get_transition_fn, props, 'key', false);
}

/**
 * @template T
 * @param {string} type
 * @param {T} [detail]
 * @param {any}params_0
 * @returns {Event}
 */
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
	const e = document.createEvent('CustomEvent');
	e.initCustomEvent(type, bubbles, cancelable, detail);
	return e;
}

/**
 * @param {HTMLElement} dom
 * @param {'introstart' | 'introend' | 'outrostart' | 'outroend'} type
 * @returns {void}
 */
function dispatch_event(dom, type) {
	dom.dispatchEvent(custom_event(type));
}

/**
 * @param {string} style
 * @returns {string}
 */
function css_style_from_camel_case(style) {
	const parts = style.split('-');
	if (parts.length === 1) return parts[0];
	return (
		parts[0] +
		parts
			.slice(1)
			.map(/** @param {any} word */ (word) => word[0].toUpperCase() + word.slice(1))
			.join('')
	);
}

/**
 * @param {string} css
 * @returns {Keyframe}
 */
function css_to_keyframe(css) {
	/** @type {Keyframe} */
	const keyframe = {};
	const parts = css.split(';');
	for (const part of parts) {
		const [property, value] = part.split(':');
		if (!property || value === undefined) break;

		const formatted_property = css_style_from_camel_case(property.trim());
		keyframe[formatted_property] = value.trim();
	}
	return keyframe;
}

/** @param {number} t */
const linear = (t) => t;

/**
 * @param {Set<import('../../types.js').Transition>} transitions
 * @param {'in' | 'out' | 'key'} target_direction
 * @param {DOMRect} [from]
 * @returns {void}
 */
export function trigger_transitions(transitions, target_direction, from) {
	// noop, until we excise it from the codebase
}

// TODO make transition mode (`in:`, `out:`, `transition:` and `|global`) a bitmask
/**
 * @template P
 * @param {number} flags
 * @param {HTMLElement} element
 * @param {() => import('#client').TransitionFn<P | undefined>} get_fn
 * @param {(() => P) | null} get_params
 * @returns {void}
 */
export function transition(flags, element, get_fn, get_params) {
	const effect = /** @type {import('#client').Effect} */ (current_effect);

	const intro = (flags & TRANSITION_IN) !== 0;
	const outro = (flags & TRANSITION_OUT) !== 0;
	const global = (flags & TRANSITION_GLOBAL) !== 0;

	const direction = intro && outro ? 'both' : intro ? 'in' : 'out';

	let p = 0;

	/** @type {0 | TRANSITION_IN | TRANSITION_OUT} */
	let current_direction = 0;

	/** @type {Animation | null} */
	let current_animation;

	/** @type {import('#client').Task | null} */
	let current_task;

	/** @type {import('#client').TransitionPayload | null} */
	let current_options;

	let current_delta = 0;

	/** @type {Array<() => void>} */
	let callbacks = [];

	/** @param {number} target */
	function start(target) {
		// TODO if this is an `in:` transition and we just called `out()`, do nothing (let it play until the block is destroyed, probably immediately)
		// TODO if this is an `out:` transition and we just called `in()`, abort everything and reset to 1 immediately
		// TODO add a `transition.abort()` method to cancel an outro transition immediately when an effect is destroyed before the transition finishes running — don't want tickers etc to continue

		stop();

		dispatch_event(element, target === 1 ? 'introstart' : 'outrostart');

		current_options ??= get_fn()(element, get_params?.(), { direction });

		if (!current_options?.duration) {
			current_options = null;
			callbacks.forEach(run);
			return;
		}

		const { delay = 0, duration, css, tick, easing = linear } = current_options;

		const n = current_options.duration / (1000 / 60);
		current_delta = target - p;

		const adjusted_duration = duration * Math.abs(current_delta);

		if (css) {
			// WAAPI
			const keyframes = [];

			for (let i = 0; i <= n; i += 1) {
				const eased = easing(i / n);
				const t = p + current_delta * eased;
				const styles = css(t, 1 - t);
				keyframes.push(css_to_keyframe(styles));
			}

			current_animation = element.animate(keyframes, {
				delay,
				duration: adjusted_duration,
				easing: 'linear',
				fill: 'forwards'
			});

			current_animation.finished
				.then(() => {
					p = target;
					current_animation = current_options = null;
					callbacks.forEach(run);
					dispatch_event(element, target === 1 ? 'introend' : 'outroend');
				})
				.catch(noop);
		} else {
			// Timer
			let running = true;
			const start_time = raf.now() + delay;
			const start_p = p;
			const end_time = start_time + adjusted_duration;

			// tick?.(p, 1 - p); // TODO put in nested effect, to avoid interleaved reads/writes?

			current_task = loop((now) => {
				if (running) {
					if (now >= end_time) {
						p = target;
						tick?.(target, 1 - target);
						// dispatch(node, true, 'end'); TODO
						current_task = current_options = null;
						callbacks.forEach(run);
						dispatch_event(element, target === 1 ? 'introend' : 'outroend');
						return (running = false);
					}
					if (now >= start_time) {
						p = start_p + current_delta * easing((now - start_time) / adjusted_duration);
						tick?.(p, 1 - p);
					}
				}
				return running;
			});
		}
	}

	function stop() {
		if (current_task) {
			current_task.abort();
			current_task = null;
		}

		if (current_animation && current_options) {
			const time = /** @type {number} */ (current_animation.currentTime);
			const duration = /** @type {number} */ (current_options.duration);
			p = (Math.abs(current_delta) * time) / duration;
			current_animation.cancel();
			current_animation = null;
		}
	}

	/** @type {import('#client').Transition2} */
	// TODO this needs to be `in()` and `out()` rather than `to()`, and both
	// need to be idempotent (because of `{#if ...}{#if ...}`). `out()` should
	// return a promise (callbacks would be more performant but we don't
	// care about that yet)
	const transition = {
		global,
		in() {
			callbacks = [];

			if (intro) {
				if (current_direction !== TRANSITION_IN) {
					current_direction = TRANSITION_IN;
					start(1);
				}
			} else {
				current_options?.tick?.(1, 0);
				current_direction = 0;
				stop();
			}
		},
		out(callback) {
			if (outro) {
				if (callback) {
					callbacks.push(callback);
				}

				if (current_direction !== TRANSITION_OUT) {
					current_direction = TRANSITION_OUT;
					start(0);
				}
			} else {
				if (callback) {
					callback();
				}
			}
		},
		stop
	};

	(effect.transitions ??= []).push(transition);

	// if this is a local transition, we only want to run it if the parent (block) effect's
	// parent (branch) effect is where the state change happened. we can determine that by
	// looking at whether the branch effect is currently initializing
	if (
		intro &&
		run_transitions &&
		(global || /** @type {import('#client').Effect} */ (effect.parent).ran)
	) {
		user_effect(() => {
			untrack(() => transition.in());
		});
	} else {
		p = 1;
	}
}
