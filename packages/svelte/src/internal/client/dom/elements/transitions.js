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

	/** @type {import('#client').TransitionPayload | ((opts: { direction: 'in' | 'out' }) => import('#client').TransitionPayload) | undefined} */
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

	/** @type {import('#client').Transition} */
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
 * @param {import('#client').TransitionPayload | ((opts: { direction: 'in' | 'out' }) => import('#client').TransitionPayload)} options
 * @param {import('#client').Animation | undefined} counterpart
 * @param {number} target
 * @param {(() => void) | undefined} callback
 * @returns {import('#client').Animation}
 */
function animate(element, options, counterpart, target, callback) {
	if (is_function(options)) {
		/** @type {import('#client').Animation} */
		var a;

		user_effect(() => {
			var o = untrack(() => options({ direction: target === 1 ? 'in' : 'out' }));
			a = animate(element, o, counterpart, target, callback);
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
			p: () => target
		};
	}

	dispatch_event(element, target === 1 ? 'introstart' : 'outrostart');

	const { delay = 0, duration, css, tick, easing = linear } = options;

	const start_time = raf.now() + delay;
	const start_p = counterpart?.p(start_time) ?? 1 - target;
	const delta = target - start_p;
	const adjusted_duration = duration * Math.abs(delta);
	const end_time = start_time + adjusted_duration;

	/** @type {Animation} */
	var animation;

	/** @type {import('#client').Task} */
	var task;

	if (css) {
		// WAAPI
		const keyframes = [];
		const n = options.duration / (1000 / 60); // TODO should be adjusted_duration?

		for (let i = 0; i <= n; i += 1) {
			const eased = easing(i / n);
			const t = start_p + delta * eased;
			const styles = css(t, 1 - t);
			keyframes.push(css_to_keyframe(styles));
		}

		animation = element.animate(keyframes, {
			delay,
			duration: adjusted_duration,
			easing: 'linear',
			fill: 'forwards'
		});

		animation.finished
			.then(() => {
				callback?.();
				dispatch_event(element, target === 1 ? 'introend' : 'outroend');
			})
			.catch(noop);
	} else {
		// Timer
		if (start_p === 0) {
			tick?.(0, 1); // TODO put in nested effect, to avoid interleaved reads/writes?
		}

		task = loop((now) => {
			if (now >= end_time) {
				tick?.(target, 1 - target);
				callback?.();
				dispatch_event(element, target === 1 ? 'introend' : 'outroend');
				return false;
			}

			if (now >= start_time) {
				var p = start_p + delta * easing((now - start_time) / adjusted_duration);
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
			if (target === 0) {
				tick?.(1, 0);
			}
		},
		p: (now) => {
			return clamp(start_p + delta * easing((now - start_time) / adjusted_duration), 0, 1);
		}
	};
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
