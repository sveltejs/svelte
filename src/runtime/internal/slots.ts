import { onDestroy } from './lifecycle';
import { assign, noop } from './utils';

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
	const update_list = [];
	function update(scope) {
		update_list.forEach(fn => fn(scope));
	}

	const $$slots = {};
	for (const key in slots) {
		$$slots[key] = function (ctx, callback = noop) {
			const definition = slots[key];
			const slot = create_slot(definition, null, scope, () => ctx);
			const content = slot.c();

			function local_update (scope, ctx_fn, dirty_fn) {
					slot.p(
						get_slot_context(definition, null, scope, ctx_fn),
						get_slot_changes(definition, scope, 0, dirty_fn)
					);
					callback(content);
			}

			if (slot.d) onDestroy(slot.d);
			if (slot.p) update_list.push(local_update);

			return {
				content,
				mount: slot.m,
				update: props => local_update(
					scope,
					() => assign(ctx, props),
					() => Object.keys(props).reduce((o, k) => (o[k] = true, o), {})
				),
				destroy: () => {
					slot.d();
					const i = update_list.indexOf(local_update);
					if (i !== -1) update_list.splice(i, 1);
				}
			};
		};
	}

	return { $$slots, update };
}
