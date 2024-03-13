import { EACH_IS_ANIMATED, EACH_IS_CONTROLLED } from '../../../../constants.js';
import { noop } from '../../../common.js';
import { destroy_each_item_block, get_first_element } from '../blocks/each.js';
import { schedule_raf_task } from '../task.js';
import { append_child, empty } from '../operations.js';
import { user_effect } from '../../reactivity/effects.js';
import { current_effect, execute_effect, untrack } from '../../runtime.js';
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

class TickAnimation {
	/** @type {null | (() => void)} */
	onfinish;

	/** @type {(t: number, u: number) => string} */
	#tick_fn;

	/** @type {number} */
	#duration;

	/** @type {number} */
	#current;

	/** @type {number} */
	#delay;

	/** @type {number} */
	#previous;

	/** @type {boolean} */
	paused;

	/** @type {boolean} */
	#reversed;

	/** @type {number} */
	#delay_current;

	/** @type {boolean} */
	#delayed_reverse;

	/**
	 * @param {(t: number, u: number) => string} tick_fn
	 * @param {number} duration
	 * @param {number} delay
	 * @param {boolean} out
	 */
	constructor(tick_fn, duration, delay, out) {
		this.#duration = duration;
		this.#delay = delay;
		this.paused = false;
		this.#tick_fn = tick_fn;
		this.#reversed = out;
		this.#delay_current = delay;
		this.#current = out ? duration : 0;
		this.#previous = 0;
		this.#delayed_reverse = false;
		this.onfinish = null;
		if (this.#delay) {
			if (!out) {
				this.#tick_fn(0, 1);
			}
		}
	}

	pause() {
		this.paused = true;
	}

	play() {
		this.paused = false;
		if (!active_tick_animations.has(this)) {
			this.#previous = raf.now();
			if (active_tick_ref === undefined) {
				active_tick_ref = raf.tick(handle_raf);
			}
			active_tick_animations.add(this);
		}
	}

	#reverse() {
		this.#reversed = !this.#reversed;
		if (this.paused) {
			if (this.#current === 0) {
				this.#current = this.#duration;
			}
			this.play();
		}
	}

	reverse() {
		if (this.#delay === 0) {
			this.#reverse();
		} else {
			this.#delay_current = this.#delay;
			this.#delayed_reverse = true;
		}
	}

	cancel() {
		active_tick_animations.delete(this);
		const current = this.#current / this.#duration;
		if (current > 0 && current < 1) {
			const t = this.#reversed ? 1 : 0;
			this.#tick_fn(t, 1 - t);
		}
	}

	finish() {
		active_tick_animations.delete(this);
		if (this.onfinish) {
			this.onfinish();
		}
	}

	/** @param {number} time */
	_update(time) {
		let diff = time - this.#previous;
		this.#previous = time;
		if (this.#delay_current !== 0) {
			const is_delayed = this.#delay_current === DELAY_NEXT_TICK;
			let cancel = !this.#delayed_reverse;
			this.#delay_current -= diff;
			if (this.#delay_current < 0 || is_delayed || (this.#delay_current === 0 && this.#reversed)) {
				const delay_diff = is_delayed ? 0 : -this.#delay_current;
				this.#delay_current = 0;

				if (this.#delayed_reverse) {
					this.#delayed_reverse = false;
					this.#reverse();
				} else if (delay_diff !== 0 || this.#reversed) {
					diff = delay_diff;
				}
				cancel = false;
			} else if (this.#delay_current === 0) {
				this.#delay_current = DELAY_NEXT_TICK;
			}
			if (cancel) {
				return;
			}
		}
		this.#current += this.#reversed ? -diff : diff;
		let t = this.#current / this.#duration;

		if (t < 0) {
			t = 0;
		} else if (t > 1) {
			t = 1;
		}

		if ((this.#reversed && t <= 0) || (!this.#reversed && t >= 1)) {
			t = this.#reversed ? 0 : 1;
			if (this.#delay_current === 0) {
				active_tick_animations.delete(this);
				if (this.onfinish) {
					this.paused = true;
					this.onfinish();
				}
			}
		}
		this.#tick_fn(t, 1 - t);
	}
}

/** @param {number} time */
function handle_raf(time) {
	for (const animation of active_tick_animations) {
		if (!animation.paused) {
			animation._update(time);
		}
	}
	if (active_tick_animations.size !== 0) {
		active_tick_ref = raf.tick(handle_raf);
	} else {
		active_tick_ref = undefined;
	}
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
		to(target, callback) {
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
				callback?.();
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
						callback?.();
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
