import { onDestroy } from './lifecycle';
import { assign } from './utils'

export function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}

export function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn
		? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
		: $$scope.ctx;
}

export function get_slot_changes(definition, $$scope, dirty, fn) {
	if (definition[2] && fn) {
		const lets = definition[2](fn(dirty));

		if ($$scope.dirty === undefined) {
			return lets;
		}

		if (typeof lets === 'object') {
			const merged = [];
			const len = Math.max($$scope.dirty.length, lets.length);
			for (let i = 0; i < len; i += 1) {
				merged[i] = $$scope.dirty[i] | lets[i];
			}

			return merged;
		}

		return $$scope.dirty | lets;
	}

	return $$scope.dirty;
}

export function create_slots_accessor(slots, scope) {
	const slot_list = [];
	function update(scope, dirty) {
		slot_list.forEach(({ slot, definition }) =>
			slot.p(
				get_slot_context(definition, [], scope, null),
				get_slot_changes(definition, scope, dirty, null)
			)
		);
	}

	const $$slots = {};
	for (const key in slots) {
		$$slots[key] = function () {
			let definition = slots[key];
			let slot = create_slot(definition, [], scope, null);

			if (slot.d) onDestroy(slot.d);
			if (slot.p) slot_list.push({ definition, slot });

			return {
					content: slot.c(),
					mount: slot.m
			};
		};
	}

	return { $$slots, update };
}
