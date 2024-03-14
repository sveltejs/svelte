import { noop } from '../../../common.js';
import { user_effect } from '../../reactivity/effects.js';
import { current_effect, untrack } from '../../runtime.js';
import { raf } from '../../timing.js';
import { loop } from '../../loop.js';
import { run_transitions } from '../../render.js';

const active_tick_animations = new Set();
const DELAY_NEXT_TICK = Number.MIN_SAFE_INTEGER;

/** @type {undefined | number} */
let active_tick_ref = undefined;

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('#client').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function transition(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'both', global);
}

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
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('#client').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
function in_fn(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'in', global);
}
export { in_fn as in };

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('#client').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function out(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'out', global);
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

/**
 * @template P
 * @param {HTMLElement} element
 * @param {() => import('#client').TransitionFn<P | undefined>} get_fn
 * @param {(() => P) | null} get_params
 * @param {'in' | 'out' | 'both'} direction
 * @param {boolean} global
 * @returns {void}
 */
export function bind_transition(element, get_fn, get_params, direction, global) {
	const effect = /** @type {import('#client').Effect} */ (current_effect);

	let p = direction === 'out' ? 1 : 0;

	/** @type {Animation | null} */
	let current_animation;

	/** @type {import('#client').Task | null} */
	let current_task;

	/** @type {import('#client').TransitionPayload | null} */
	let current_options;

	let current_delta = 0;

	/** @type {import('#client').Transition2} */
	const transition = {
		global,
		to(target, callback = noop) {
			if (current_task) {
				current_task.abort();
				current_task = null;
			}

			if (current_animation && current_options) {
				const time = /** @type {number} */ (current_animation.currentTime);
				const duration = /** @type {number} */ (current_options.duration);
				p = (Math.abs(current_delta) * time) / duration;
				current_animation.cancel();
			}

			current_options ??= get_fn()(element, get_params?.(), { direction });

			if (!current_options?.duration) {
				current_options = null;
				callback();
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
						callback();
					})
					.catch(noop);
			} else if (tick) {
				// Timer
				let running = true;
				const start_time = raf.now() + delay;
				const start_p = p;
				const end_time = start_time + adjusted_duration;

				tick(p, 1 - p); // TODO put in nested effect, to avoid interleaved reads/writes?

				current_task = loop((now) => {
					if (running) {
						if (now >= end_time) {
							p = target;
							tick(target, 1 - target);
							// dispatch(node, true, 'end'); TODO
							current_task = null;
							callback?.();
							return (running = false);
						}
						if (now >= start_time) {
							p = start_p + current_delta * easing((now - start_time) / adjusted_duration);
							tick(p, 1 - p);
						}
					}
					return running;
				});

				current_options = null;
			} else {
				setTimeout(callback, duration);
			}
		}
	};

	// TODO don't pass strings around like this, it's silly
	if (direction === 'in' || direction === 'both') {
		(effect.in ??= []).push(transition);

		// if this is a local transition, we only want to run it if the parent (block) effect's
		// parent (branch) effect is where the state change happened. we can determine that by
		// looking at whether the branch effect is currently initializing
		const should_run =
			run_transitions && (global || /** @type {import('#client').Effect} */ (effect.parent).ran);

		if (should_run) {
			user_effect(() => {
				untrack(() => transition.to(1));
			});
		} else {
			p = 1;
		}
	}

	if (direction === 'out' || direction === 'both') {
		(effect.out ??= []).push(transition);
	}
}
