/** @import { Derived, Effect, Fork, Value } from '#client' */
import { BLOCK_EFFECT, DERIVED, DIRTY, TEMPLATE_EFFECT } from './constants.js';
import { queue_micro_task } from './dom/task.js';
import { flush_sync, schedule_effect, set_signal_status } from './runtime.js';

/** @type {Fork | null} */
export let active_fork = null;

/**
 * @param {Fork | null} fork
 */
export function set_active_fork(fork) {
	active_fork = fork;
}

/**
 * @param {(error?: Error) => void} callback
 * @returns {Fork}
 */
function create_fork(callback) {
	return {
		pending: 0,
		sources: new Map(),
		callback
	};
}

/**
 * @param {Fork} fork
 */
export function increment_fork(fork) {
	fork.pending += 1;
}

/**
 * @param {Fork} fork
 */
export function decrement_fork(fork) {
	fork.pending -= 1;

	queue_micro_task(() => {
		if (fork.pending === 0) {
			if (is_valid(fork)) {
				// TODO we also need to handle a case like
				// `{#if a || b}` where the fork makes `a`
				// truthy but `b` became truthy in the
				// meantime — requires a 'rebase'
				fork.callback();
			} else {
				fork.callback(new Error('stale fork'));
			}
		}
	});
}

/**
 * @param {Fork} fork
 */
function is_valid(fork) {
	for (const [source, source_fork] of fork.sources) {
		if (source.wv > source_fork.wv) {
			return false;
		}
	}

	return true;
}

/**
 * @param {Fork} fork
 */
function apply_fork(fork) {
	if (!is_valid(fork)) {
		throw new Error('stale fork');
	}

	for (const [source, saved] of fork.sources) {
		source.v = saved.next_v;
		source.wv = saved.next_wv;

		mark_effects(source);
	}
}

/**
 * @param {Value} value
 */
function mark_effects(value) {
	if (value.reactions === null) return;

	for (var reaction of value.reactions) {
		var flags = reaction.f;

		if ((flags & DERIVED) !== 0) {
			mark_effects(/** @type {Derived} */ (reaction));
		} else {
			if ((flags & BLOCK_EFFECT) === 0 || (flags & TEMPLATE_EFFECT) !== 0) {
				set_signal_status(reaction, DIRTY);
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}
}

/**
 * @param {Fork} fork
 */
function revert(fork) {
	for (const [source, saved] of fork.sources) {
		source.v = saved.v;
		source.wv = saved.wv;
	}
}

/**
 * @param {() => void} fn
 * @returns {Promise<{ apply: () => void }>}
 */
export function fork(fn) {
	flush_sync();

	if (active_fork !== null) {
		throw new Error("TODO can't fork inside a fork, you mad fool");
	}

	try {
		return new Promise((fulfil, reject) => {
			var f = (active_fork = create_fork((error) => {
				if (error) {
					reject(error);
				} else {
					fulfil({
						apply: () => apply_fork(f)
					});
				}
			}));

			fn();
			flush_sync();

			revert(active_fork);
		});
	} finally {
		active_fork = null;
	}
}
