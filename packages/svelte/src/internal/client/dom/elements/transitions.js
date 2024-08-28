/** @import { AnimateFn, Animation, AnimationConfig, EachItem, Effect, TransitionFn, TransitionManager } from '#client' */
import { noop, is_function } from '../../../shared/utils.js';
import { effect } from '../../reactivity/effects.js';
import { current_effect, untrack } from '../../runtime.js';
import { loop } from '../../loop.js';
import { should_intro } from '../../render.js';
import { current_each_item } from '../blocks/each.js';
import { TRANSITION_GLOBAL, TRANSITION_IN, TRANSITION_OUT } from '../../../../constants.js';
import { BLOCK_EFFECT, EFFECT_RAN, EFFECT_TRANSPARENT } from '../../constants.js';
import { queue_micro_task } from '../task.js';

/**
 * @param {Element} element
 * @param {'introstart' | 'introend' | 'outrostart' | 'outroend'} type
 * @returns {void}
 */
function dispatch_event(element, type) {
	element.dispatchEvent(new CustomEvent(type));
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
 * Called inside keyed `{#each ...}` blocks (as `$.animation(...)`). This creates an animation manager
 * and attaches it to the block, so that moves can be animated following reconciliation.
 * @template P
 * @param {Element} element
 * @param {() => AnimateFn<P | undefined>} get_fn
 * @param {(() => P) | null} get_params
 */
export function animation(element, get_fn, get_params) {
	var item = /** @type {EachItem} */ (current_each_item);

	/** @type {DOMRect} */
	var from;

	/** @type {DOMRect} */
	var to;

	/** @type {Animation | undefined} */
	var animation;

	/** @type {null | { position: string, width: string, height: string, transform: string }} */
	var original_styles = null;

	item.a ??= {
		element,
		measure() {
			from = this.element.getBoundingClientRect();
		},
		apply() {
			animation?.abort();

			to = this.element.getBoundingClientRect();

			if (
				from.left !== to.left ||
				from.right !== to.right ||
				from.top !== to.top ||
				from.bottom !== to.bottom
			) {
				const options = get_fn()(this.element, { from, to }, get_params?.());

				animation = animate(this.element, options, undefined, 1, () => {
					animation?.abort();
					animation = undefined;
				});
			}
		},
		fix() {
			// If an animation is already running, transforming the element is likely to fail,
			// because the styles applied by the animation take precedence. In the case of crossfade,
			// that means the `translate(...)` of the crossfade transition overrules the `translate(...)`
			// we would apply below, leading to the element jumping somewhere to the top left.
			if (element.getAnimations().length) return;

			// It's important to destructure these to get fixed values - the object itself has getters,
			// and changing the style to 'absolute' can for example influence the width.
			var { position, width, height } = getComputedStyle(element);

			if (position !== 'absolute' && position !== 'fixed') {
				var style = /** @type {HTMLElement | SVGElement} */ (element).style;

				original_styles = {
					position: style.position,
					width: style.width,
					height: style.height,
					transform: style.transform
				};

				style.position = 'absolute';
				style.width = width;
				style.height = height;
				var to = element.getBoundingClientRect();

				if (from.left !== to.left || from.top !== to.top) {
					var transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
					style.transform = style.transform ? `${style.transform} ${transform}` : transform;
				}
			}
		},
		unfix() {
			if (original_styles) {
				var style = /** @type {HTMLElement | SVGElement} */ (element).style;

				style.position = original_styles.position;
				style.width = original_styles.width;
				style.height = original_styles.height;
				style.transform = original_styles.transform;
			}
		}
	};

	// in the case of a `<svelte:element>`, it's possible for `$.animation(...)` to be called
	// when an animation manager already exists, if the tag changes. in that case, we need to
	// swap out the element rather than creating a new manager, in case it happened at the same
	// moment as a reconciliation
	item.a.element = element;
}

/**
 * Called inside block effects as `$.transition(...)`. This creates a transition manager and
 * attaches it to the current effect — later, inside `pause_effect` and `resume_effect`, we
 * use this to create `intro` and `outro` transitions.
 * @template P
 * @param {number} flags
 * @param {HTMLElement} element
 * @param {() => TransitionFn<P | undefined>} get_fn
 * @param {(() => P) | null} get_params
 * @returns {void}
 */
export function transition(flags, element, get_fn, get_params) {
	var is_intro = (flags & TRANSITION_IN) !== 0;
	var is_outro = (flags & TRANSITION_OUT) !== 0;
	var is_both = is_intro && is_outro;
	var is_global = (flags & TRANSITION_GLOBAL) !== 0;

	/** @type {'in' | 'out' | 'both'} */
	var direction = is_both ? 'both' : is_intro ? 'in' : 'out';

	/** @type {AnimationConfig | ((opts: { direction: 'in' | 'out' }) => AnimationConfig) | undefined} */
	var current_options;

	var inert = element.inert;

	/** @type {Animation | undefined} */
	var intro;

	/** @type {Animation | undefined} */
	var outro;

	function get_options() {
		// If a transition is still ongoing, we use the existing options rather than generating
		// new ones. This ensures that reversible transitions reverse smoothly, rather than
		// jumping to a new spot because (for example) a different `duration` was used
		return (current_options ??= get_fn()(element, get_params?.() ?? /** @type {P} */ ({}), {
			direction
		}));
	}

	/** @type {TransitionManager} */
	var transition = {
		is_global,
		in() {
			element.inert = inert;

			if (!is_intro) {
				outro?.abort();
				outro?.reset?.();
				return;
			}

			if (!is_outro) {
				// if we intro then outro then intro again, we want to abort the first intro,
				// if it's not a bidirectional transition
				intro?.abort();
			}

			dispatch_event(element, 'introstart');

			intro = animate(element, get_options(), outro, 1, () => {
				dispatch_event(element, 'introend');

				// Ensure we cancel the animation to prevent leaking
				intro?.abort();
				intro = current_options = undefined;
			});
		},
		out(fn) {
			if (!is_outro) {
				fn?.();
				current_options = undefined;
				return;
			}

			element.inert = true;

			dispatch_event(element, 'outrostart');

			outro = animate(element, get_options(), intro, 0, () => {
				dispatch_event(element, 'outroend');
				fn?.();
			});
		},
		stop: () => {
			intro?.abort();
			outro?.abort();
		}
	};

	var e = /** @type {Effect} */ (current_effect);

	(e.transitions ??= []).push(transition);

	// if this is a local transition, we only want to run it if the parent (branch) effect's
	// parent (block) effect is where the state change happened. we can determine that by
	// looking at whether the block effect is currently initializing
	if (is_intro && should_intro) {
		var run = is_global;

		if (!run) {
			var block = /** @type {Effect | null} */ (e.parent);

			// skip over transparent blocks (e.g. snippets, else-if blocks)
			while (block && (block.f & EFFECT_TRANSPARENT) !== 0) {
				while ((block = block.parent)) {
					if ((block.f & BLOCK_EFFECT) !== 0) break;
				}
			}

			run = !block || (block.f & EFFECT_RAN) !== 0;
		}

		if (run) {
			effect(() => {
				untrack(() => transition.in());
			});
		}
	}
}

/**
 * Animates an element, according to the provided configuration
 * @param {Element} element
 * @param {AnimationConfig | ((opts: { direction: 'in' | 'out' }) => AnimationConfig)} options
 * @param {Animation | undefined} counterpart The corresponding intro/outro to this outro/intro
 * @param {number} t2 The target `t` value — `1` for intro, `0` for outro
 * @param {(() => void)} on_finish Called after successfully completing the animation
 * @returns {Animation}
 */
function animate(element, options, counterpart, t2, on_finish) {
	var is_intro = t2 === 1;

	if (is_function(options)) {
		// In the case of a deferred transition (such as `crossfade`), `option` will be
		// a function rather than an `AnimationConfig`. We need to call this function
		// once the DOM has been updated...
		/** @type {Animation} */
		var a;
		var aborted = false;

		queue_micro_task(() => {
			if (aborted) return;
			var o = options({ direction: is_intro ? 'in' : 'out' });
			a = animate(element, o, counterpart, t2, on_finish);
		});

		// ...but we want to do so without using `async`/`await` everywhere, so
		// we return a facade that allows everything to remain synchronous
		return {
			abort: () => {
				aborted = true;
				a?.abort();
			},
			deactivate: () => a.deactivate(),
			reset: () => a.reset(),
			t: () => a.t()
		};
	}

	counterpart?.deactivate();

	if (!options?.duration) {
		on_finish();

		return {
			abort: noop,
			deactivate: noop,
			reset: noop,
			t: () => t2
		};
	}

	const { delay = 0, css, tick, easing = linear } = options;

	var keyframes = [];

	if (is_intro && counterpart === undefined) {
		if (tick) {
			tick(0, 1); // TODO put in nested effect, to avoid interleaved reads/writes?
		}

		if (css) {
			var styles = css_to_keyframe(css(0, 1));
			keyframes.push(styles, styles);
		}
	}

	var get_t = () => 1 - t2;

	// create a dummy animation that lasts as long as the delay (but with whatever devtools
	// multiplier is in effect). in the common case that it is `0`, we keep it anyway so that
	// the CSS keyframes aren't created until the DOM is updated
	var animation = element.animate(keyframes, { duration: delay });

	animation.onfinish = () => {
		// for bidirectional transitions, we start from the current position,
		// rather than doing a full intro/outro
		var t1 = counterpart?.t() ?? 1 - t2;
		counterpart?.abort();

		var delta = t2 - t1;
		var duration = /** @type {number} */ (options.duration) * Math.abs(delta);
		var keyframes = [];

		if (duration > 0) {
			if (css) {
				var n = Math.ceil(duration / (1000 / 60)); // `n` must be an integer, or we risk missing the `t2` value

				for (var i = 0; i <= n; i += 1) {
					var t = t1 + delta * easing(i / n);
					var styles = css(t, 1 - t);
					keyframes.push(css_to_keyframe(styles));
				}
			}

			get_t = () => {
				var time = /** @type {number} */ (
					/** @type {globalThis.Animation} */ (animation).currentTime
				);

				return t1 + delta * easing(time / duration);
			};

			if (tick) {
				loop(() => {
					if (animation.playState !== 'running') return false;

					var t = get_t();
					tick(t, 1 - t);

					return true;
				});
			}
		}

		animation = element.animate(keyframes, { duration, fill: 'forwards' });

		animation.onfinish = () => {
			get_t = () => t2;
			tick?.(t2, 1 - t2);
			on_finish();
		};
	};

	return {
		abort: () => {
			if (animation) {
				animation.cancel();
				// This prevents memory leaks in Chromium
				animation.effect = null;
			}
		},
		deactivate: () => {
			on_finish = noop;
		},
		reset: () => {
			if (t2 === 0) {
				tick?.(1, 0);
			}
		},
		t: () => get_t()
	};
}
