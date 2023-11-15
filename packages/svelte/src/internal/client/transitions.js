import { EACH_IS_ANIMATED, EACH_IS_CONTROLLED } from '../../constants.js';
import {
	AWAIT_BLOCK,
	DYNAMIC_COMPONENT_BLOCK,
	EACH_BLOCK,
	EACH_ITEM_BLOCK,
	IF_BLOCK,
	KEY_BLOCK,
	ROOT_BLOCK
} from './block.js';
import { append_child } from './operations.js';
import { destroy_each_item_block, empty } from './render.js';
import {
	current_block,
	current_effect,
	destroy_signal,
	effect,
	managed_effect,
	managed_pre_effect,
	mark_subtree_inert,
	untrack
} from './runtime.js';
import { raf } from './timing.js';

const active_tick_animations = new Set();
const DELAY_NEXT_TICK = Number.MIN_SAFE_INTEGER;

/** @type {undefined | number} */
let active_tick_ref = undefined;

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
		const t = this.#reversed ? 1 : 0;
		active_tick_animations.delete(this);
		this.#tick_fn(t, 1 - t);
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

/**
 * @param {HTMLElement} dom
 * @param {() => import('./types.js').TransitionPayload} init
 * @param {'in' | 'out' | 'both' | 'key'} direction
 * @param {import('./types.js').Signal<unknown>} effect
 * @returns {import('./types.js').Transition}
 */
function create_transition(dom, init, direction, effect) {
	let curr_direction = 'in';

	/** @type {Array<() => void>} */
	let subs = [];

	/** @type {null | Animation | TickAnimation} */
	let animation = null;
	let cancelled = false;

	const create_animation = () => {
		let payload = /** @type {import('./types.js').TransitionPayload} */ (transition.payload);
		if (typeof payload === 'function') {
			// @ts-ignore
			payload = payload({ direction: curr_direction });
		}
		const duration = payload.duration ?? 300;
		const delay = payload.delay ?? 0;
		const css_fn = payload.css;
		const tick_fn = payload.tick;

		/** @param {number} t */
		const linear = (t) => t;
		const easing_fn = payload.easing || linear;

		/** @type {Keyframe[]} */
		const keyframes = [];

		if (typeof tick_fn === 'function') {
			animation = new TickAnimation(tick_fn, duration, delay, direction === 'out');
		} else {
			if (typeof css_fn === 'function') {
				// We need at least two frames
				const frame_time = 16.666;
				const max_duration = Math.max(duration, frame_time);
				// Have a keyframe every fame for 60 FPS
				for (let i = 0; i <= max_duration; i += frame_time) {
					let time;
					if (i + frame_time > max_duration) {
						time = 1;
					} else if (i === 0) {
						time = 0;
					} else {
						time = i / max_duration;
					}
					const t = easing_fn(time);
					keyframes.push(css_to_keyframe(css_fn(t, 1 - t)));
				}
				if (direction === 'out') {
					keyframes.reverse();
				}
			}
			animation = dom.animate(keyframes, {
				duration,
				endDelay: delay,
				delay,
				fill: 'both'
			});
		}
		animation.pause();

		animation.onfinish = () => {
			const is_outro = curr_direction === 'out';
			/** @type {Animation | TickAnimation} */ (animation).pause();
			if (is_outro) {
				for (const sub of subs) {
					sub();
				}
				subs = [];
			}
			dispatch_event(dom, is_outro ? 'outroend' : 'introend');
		};
	};

	/** @type {import('./types.js').Transition} */
	const transition = {
		effect,
		init,
		payload: null,

		/** @param {() => void} fn */
		finished(fn) {
			subs.push(fn);
		},
		in() {
			const needs_reverse = curr_direction !== 'in';
			curr_direction = 'in';
			if (animation === null || cancelled) {
				cancelled = false;
				create_animation();
			}
			dispatch_event(dom, 'introstart');
			if (needs_reverse) {
				/** @type {Animation | TickAnimation} */ (animation).reverse();
			}
			/** @type {Animation | TickAnimation} */ (animation).play();
		},
		out() {
			const needs_reverse = direction === 'both' && curr_direction !== 'out';
			curr_direction = 'out';
			if (animation === null || cancelled) {
				cancelled = false;
				create_animation();
			}
			dispatch_event(dom, 'outrostart');
			if (needs_reverse) {
				/** @type {Animation | TickAnimation} */ (animation).reverse();
			} else {
				/** @type {Animation | TickAnimation} */ (animation).play();
			}
		},
		cancel() {
			/** @type {Animation | TickAnimation} */ (animation).cancel();
			cancelled = true;
		},
		cleanup() {
			for (const sub of subs) {
				sub();
			}
			subs = [];
		},
		direction,
		dom
	};
	return transition;
}

/**
 * @param {import('./types.js').Block} block
 * @returns {boolean}
 */
function is_transition_block(block) {
	return (
		block.type === IF_BLOCK ||
		block.type === EACH_ITEM_BLOCK ||
		block.type === KEY_BLOCK ||
		block.type === AWAIT_BLOCK ||
		block.type === DYNAMIC_COMPONENT_BLOCK ||
		(block.type === EACH_BLOCK && block.items.length === 0)
	);
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {import('./types.js').TransitionFn<P | undefined> | import('./types.js').AnimateFn<P | undefined>} transition_fn
 * @param {(() => P) | null} props_fn
 * @param {'in' | 'out' | 'both' | 'key'} direction
 * @param {boolean} global
 * @returns {void}
 */
export function bind_transition(dom, transition_fn, props_fn, direction, global) {
	const transition_effect = /** @type {import('./types.js').EffectSignal} */ (current_effect);
	const block = current_block;
	const props = props_fn === null ? {} : props_fn();

	let skip_intro = true;

	/** @type {import('./types.js').Block | null} */
	let transition_block = block;
	while (transition_block !== null) {
		if (is_transition_block(transition_block)) {
			if (transition_block.type === EACH_ITEM_BLOCK) {
				// Lazily apply the each block transition
				transition_block.transition = each_item_transition;
				transition_block = transition_block.parent;
			} else if (transition_block.type === AWAIT_BLOCK && transition_block.pending) {
				skip_intro = false;
			}
			if (skip_intro) {
				skip_intro = transition_block.effect === null;
			}
			if (!skip_intro || !global) {
				break;
			}
		} else if (
			transition_block.type === ROOT_BLOCK &&
			(transition_block.effect !== null || transition_block.intro)
		) {
			skip_intro = false;
		}
		transition_block = transition_block.parent;
	}

	/** @type {import('./types.js').Transition} */
	let transition;

	effect(() => {
		/** @param {DOMRect} [from] */
		const init = (from) =>
			untrack(() =>
				direction === 'key'
					? /** @type {import('./types.js').AnimateFn<any>} */ (transition_fn)(
							dom,
							{ from: /** @type {DOMRect} */ (from), to: dom.getBoundingClientRect() },
							props,
							{}
					  )
					: /** @type {import('./types.js').TransitionFn<any>} */ (transition_fn)(dom, props, {
							direction
					  })
			);

		transition = create_transition(dom, init, direction, transition_effect);
		const show_intro = !skip_intro && (direction === 'in' || direction === 'both');

		if (show_intro) {
			transition.payload = transition.init();
		}

		const effect = managed_pre_effect(() => {
			destroy_signal(effect);
			dom.inert = false;

			if (show_intro) {
				transition.in();
			}

			/** @type {import('./types.js').Block | null} */
			let transition_block = block;
			while (transition_block !== null) {
				const parent = transition_block.parent;
				if (is_transition_block(transition_block)) {
					if (transition_block.transition !== null) {
						transition_block.transition(transition);
					}
					if (
						parent === null ||
						(!global &&
							(transition_block.type !== IF_BLOCK || parent.type !== IF_BLOCK || parent.current))
					) {
						break;
					}
				}
				transition_block = parent;
			}
		}, false);
	});

	if (direction === 'key') {
		effect(() => {
			return () => {
				transition.cleanup();
			};
		});
	}
}

/**
 * @param {Set<import('./types.js').Transition>} transitions
 */
export function remove_in_transitions(transitions) {
	for (let other of transitions) {
		if (other.direction === 'in') {
			transitions.delete(other);
		}
	}
}

/**
 * @param {Set<import('./types.js').Transition>} transitions
 * @param {'in' | 'out' | 'key'} target_direction
 * @param {DOMRect} [from]
 * @returns {void}
 */
export function trigger_transitions(transitions, target_direction, from) {
	/** @type {Array<() => void>} */
	const outros = [];
	for (const transition of transitions) {
		const direction = transition.direction;
		if (target_direction === 'in') {
			if (direction === 'in' || direction === 'both') {
				if (direction === 'in') {
					transition.cancel();
				}
				transition.in();
			} else {
				transition.cancel();
			}
			transition.dom.inert = false;
			mark_subtree_inert(transition.effect, false);
		} else if (target_direction === 'key') {
			if (direction === 'key') {
				transition.payload = transition.init(/** @type {DOMRect} */ (from));
				transition.in();
			}
		} else {
			if (direction === 'out' || direction === 'both') {
				transition.payload = transition.init();
				outros.push(transition.out);
			}
			transition.dom.inert = true;
			mark_subtree_inert(transition.effect, true);
		}
	}
	if (outros.length > 0) {
		// Defer the outros to a microtask
		const e = managed_pre_effect(() => {
			destroy_signal(e);
			const e2 = managed_effect(() => {
				destroy_signal(e2);
				outros.forEach(/** @param {any} o */ (o) => o());
			});
		}, false);
	}
}

/**
 * @this {import('./types.js').EachItemBlock}
 * @param {import('./types.js').Transition} transition
 * @returns {void}
 */
function each_item_transition(transition) {
	const block = this;
	const each_block = block.parent;
	const is_controlled = (each_block.flags & EACH_IS_CONTROLLED) !== 0;
	// Disable optimization
	if (is_controlled) {
		const anchor = empty();
		each_block.flags ^= EACH_IS_CONTROLLED;
		append_child(/** @type {Element} */ (each_block.anchor), anchor);
		each_block.anchor = anchor;
	}
	if (transition.direction === 'key' && (each_block.flags & EACH_IS_ANIMATED) === 0) {
		each_block.flags |= EACH_IS_ANIMATED;
	}
	let transitions = block.transitions;
	if (transitions === null) {
		block.transitions = transitions = new Set();
	}
	transition.finished(() => {
		if (transitions !== null) {
			transitions.delete(transition);
			if (transition.direction !== 'key') {
				for (let other of transitions) {
					if (other.direction === 'key' || other.direction === 'in') {
						transitions.delete(other);
					}
				}
				if (transitions.size === 0) {
					block.transitions = null;
					destroy_each_item_block(block, null, true);
				}
			}
		}
	});
	transitions.add(transition);
}
