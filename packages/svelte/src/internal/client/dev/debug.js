/** @import { Derived, Effect, Value } from '#client' */

import {
	BLOCK_EFFECT,
	BOUNDARY_EFFECT,
	BRANCH_EFFECT,
	CLEAN,
	DERIVED,
	EFFECT,
	MAYBE_DIRTY,
	RENDER_EFFECT,
	ROOT_EFFECT
} from '#client/constants';

/**
 *
 * @param {Effect} effect
 */
export function root(effect) {
	while (effect.parent !== null) {
		effect = effect.parent;
	}

	return effect;
}

/**
 *
 * @param {Effect} effect
 */
export function log_effect_tree(effect, depth = 0) {
	const flags = effect.f;

	let label = '(unknown)';

	if ((flags & ROOT_EFFECT) !== 0) {
		label = 'root';
	} else if ((flags & BOUNDARY_EFFECT) !== 0) {
		label = 'boundary';
	} else if ((flags & BLOCK_EFFECT) !== 0) {
		label = 'block';
	} else if ((flags & BRANCH_EFFECT) !== 0) {
		label = 'branch';
	} else if ((flags & RENDER_EFFECT) !== 0) {
		label = 'render effect';
	} else if ((flags & EFFECT) !== 0) {
		label = 'effect';
	}

	let status =
		(flags & CLEAN) !== 0 ? 'clean' : (flags & MAYBE_DIRTY) !== 0 ? 'maybe dirty' : 'dirty';

	// eslint-disable-next-line no-console
	console.group(`%c${label} (${status})`, `font-weight: ${status === 'clean' ? 'normal' : 'bold'}`);

	if (depth === 0) {
		const callsite = new Error().stack
			?.split('\n')[2]
			.replace(/\s+at (?: \w+\(?)?(.+)\)?/, (m, $1) => $1.replace(/\?[^:]+/, ''));

		// eslint-disable-next-line no-console
		console.log(callsite);
	}

	if (effect.deps !== null) {
		// eslint-disable-next-line no-console
		console.groupCollapsed('%cdeps', 'font-weight: normal');

		for (const dep of effect.deps) {
			log_dep(dep);
		}

		// eslint-disable-next-line no-console
		console.groupEnd();
	}

	let child = effect.first;
	while (child !== null) {
		log_effect_tree(child, depth + 1);
		child = child.next;
	}

	// eslint-disable-next-line no-console
	console.groupEnd();
}

/**
 *
 * @param {Value} dep
 */
function log_dep(dep) {
	if ((dep.f & DERIVED) !== 0) {
		const derived = /** @type {Derived} */ (dep);

		// eslint-disable-next-line no-console
		console.groupCollapsed('%cderived', 'font-weight: normal', derived.v);
		if (derived.deps) {
			for (const d of derived.deps) {
				log_dep(d);
			}
		}

		// eslint-disable-next-line no-console
		console.groupEnd();
	} else {
		// eslint-disable-next-line no-console
		console.log('state', dep.v);
	}
}
