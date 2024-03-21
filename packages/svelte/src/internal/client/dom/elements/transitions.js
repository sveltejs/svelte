import { noop } from '../../../common.js';
import { user_effect } from '../../reactivity/effects.js';
import { current_effect, untrack } from '../../runtime.js';
import { raf } from '../../timing.js';
import { loop } from '../../loop.js';
import { run_transitions } from '../../render.js';
import { TRANSITION_GLOBAL, TRANSITION_IN, TRANSITION_OUT } from '../../constants.js';
import { is_function } from '../../utils.js';

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
 * @param {Element} dom
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

export function animation() {
	// TODO
}

/**
 * @template P
 * @param {number} flags
 * @param {HTMLElement} element
 * @param {() => import('#client').TransitionFn<P | undefined>} get_fn
 * @param {(() => P) | null} get_params
 * @returns {void}
 */
export function transition(flags, element, get_fn, get_params) {
	var is_intro = (flags & TRANSITION_IN) !== 0;
	var is_outro = (flags & TRANSITION_OUT) !== 0;
	var is_global = (flags & TRANSITION_GLOBAL) !== 0;

	/** @type {'in' | 'out' | 'both'} */
	var direction = is_intro && is_outro ? 'both' : is_intro ? 'in' : 'out';

	/** @type {import('#client').TransitionConfig | ((opts: { direction: 'in' | 'out' }) => import('#client').TransitionConfig) | undefined} */
	var current_options;

	var inert = element.inert;

	/** @type {import('#client').Animation | undefined} */
	var intro;

	/** @type {import('#client').Animation | undefined} */
	var outro;

	/** @type {(() => void) | undefined} */
	var reset;

	function get_options() {
		return (current_options ??= get_fn()(element, get_params?.(), { direction }));
	}

	/** @type {import('#client').TransitionManager} */
	var transition = {
		is_global,
		async in() {
			element.inert = inert;

			if (is_intro) {
				intro = animate(element, get_options(), outro, 1, () => {
					intro = current_options = undefined;
				});
			} else {
				outro?.abort();
				reset?.();
			}
		},
		async out(fn) {
			if (is_outro) {
				element.inert = true;

				outro = animate(element, get_options(), intro, 0, () => {
					outro = current_options = undefined;
					fn?.();
				});

				reset = outro.reset;
			} else {
				fn?.();
			}
		},
		stop: () => {
			intro?.abort();
			outro?.abort();
		}
	};

	var effect = /** @type {import('#client').Effect} */ (current_effect);

	(effect.transitions ??= []).push(transition);

	// if this is a local transition, we only want to run it if the parent (block) effect's
	// parent (branch) effect is where the state change happened. we can determine that by
	// looking at whether the branch effect is currently initializing
	if (
		is_intro &&
		run_transitions &&
		(is_global || /** @type {import('#client').Effect} */ (effect.parent).ran)
	) {
		user_effect(() => {
			untrack(() => transition.in());
		});
	}
}

/**
 * @param {Element} element
 * @param {import('#client').TransitionConfig | ((opts: { direction: 'in' | 'out' }) => import('#client').TransitionConfig)} options
 * @param {import('#client').Animation | undefined} counterpart
 * @param {number} t2
 * @param {(() => void) | undefined} callback
 * @returns {import('#client').Animation}
 */
function animate(element, options, counterpart, t2, callback) {
	if (is_function(options)) {
		/** @type {import('#client').Animation} */
		var a;

		user_effect(() => {
			var o = untrack(() => options({ direction: t2 === 1 ? 'in' : 'out' }));
			a = animate(element, o, counterpart, t2, callback);
		});

		return {
			abort: () => a.abort(),
			neuter: () => a.neuter(),
			reset: () => a.reset(),
			p: (now) => a.p(now)
		};
	}

	counterpart?.neuter();

	if (!options?.duration) {
		callback?.();
		return {
			abort: noop,
			neuter: noop,
			reset: noop,
			p: () => t2
		};
	}

	dispatch_event(element, t2 === 1 ? 'introstart' : 'outrostart');

	var { delay = 0, duration, css, tick, easing = linear } = options;

	var start = raf.now() + delay;
	var t1 = counterpart?.p(start) ?? 1 - t2;
	var delta = t2 - t1;

	duration *= Math.abs(delta);
	var end = start + duration;

	/** @type {Animation} */
	var animation;

	/** @type {import('#client').Task} */
	var task;

	if (css) {
		// WAAPI
		var keyframes = [];
		var n = duration / (1000 / 60);

		for (var i = 0; i <= n; i += 1) {
			var t = t1 + delta * easing(i / n);
			var styles = css(t, 1 - t);
			keyframes.push(css_to_keyframe(styles));
		}

		animation = element.animate(keyframes, {
			delay,
			duration,
			easing: 'linear',
			fill: 'forwards'
		});

		animation.finished
			.then(() => {
				callback?.();
				dispatch_event(element, t2 === 1 ? 'introend' : 'outroend');
			})
			.catch(noop);
	} else {
		// Timer
		if (t1 === 0) {
			tick?.(0, 1); // TODO put in nested effect, to avoid interleaved reads/writes?
		}

		task = loop((now) => {
			if (now >= end) {
				tick?.(t2, 1 - t2);
				callback?.();
				dispatch_event(element, t2 === 1 ? 'introend' : 'outroend');
				return false;
			}

			if (now >= start) {
				var p = t1 + delta * easing((now - start) / duration);
				tick?.(p, 1 - p);
			}

			return true;
		});
	}

	return {
		abort: () => {
			animation?.cancel();
			task?.abort();
		},
		neuter: () => {
			callback = undefined;
		},
		reset: () => {
			if (t2 === 0) {
				tick?.(1, 0);
			}
		},
		p: (now) => {
			var t = t1 + delta * easing((now - start) / duration);
			return Math.min(1, Math.max(0, t));
		}
	};
}
