// Exercises `current_sources` membership checks. Every `state(...)` inside
// a derived adds to `current_sources`; every subsequent `set(...)` on those
// sources checks membership in two hot places (state_unsafe_mutation guard
// and schedule_possible_effect_self_invalidation). With many sources this
// was O(n) per check via Array.includes; Set.has is O(1).

import * as $ from 'svelte/internal/client';

const N = 500;

export default () => {
	const trigger = $.state(0);
	let dirty = $.derived(() => {
		$.get(trigger);

		// Create N sources inside this derived. Each goes through
		// push_reaction_value -> current_sources (Array or Set).
		const sources = [];
		for (let i = 0; i < N; i++) {
			sources[i] = $.state(i);
		}

		// Mutate each one. Hits the current_sources membership check on
		// every iteration via set() -> state_unsafe_mutation guard and
		// schedule_possible_effect_self_invalidation. Note: we don't read
		// these sources back (no dependency on them) so this doesn't loop.
		let total = 0;
		for (let i = 0; i < N; i++) {
			$.set(sources[i], i * 2);
			total += sources[i].v;
		}

		return total;
	});

	return {
		destroy: () => {},
		/** @param {number} i */
		run(i) {
			$.flush(() => $.set(trigger, i));
			$.get(dirty);
		}
	};
};
