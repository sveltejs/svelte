import { insert, detach } from './dom';

export function noop() {}

export const identity = x => x;

export function assign(tar, src) {
	for (const k in src) tar[k] = src[k];
	return tar;
}

export function is_promise(value) {
	return value && typeof value.then === 'function';
}

export function add_location(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
	};
}

export function run(fn) {
	return fn();
}

export function blank_object() {
	return Object.create(null);
}

export function run_all(fns) {
	fns.forEach(run);
}

export function is_function(thing) {
	return typeof thing === 'function';
}

export function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

export function not_equal(a, b) {
	return a != a ? b == b : a !== b;
}

export function validate_store(store, name) {
	if (!store || typeof store.subscribe !== 'function') {
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}

export function subscribe(component, store, callback) {
	const unsub = store.subscribe(callback);

	component.$$.on_destroy.push(unsub.unsubscribe
		? () => unsub.unsubscribe()
		: unsub);
}

export function create_slot(definition, ctx, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, fn);
		return definition[0](slot_ctx);
	}
}

export function get_slot_context(definition, ctx, fn) {
	return definition[1]
		? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
		: ctx.$$scope.ctx;
}

export function get_slot_changes(definition, ctx, changed, fn) {
	return definition[1]
		? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
		: ctx.$$scope.changed || {};
}

export function exclude_internal_props(props) {
	const result = {};
	for (const k in props) if (k[0] !== '$') result[k] = props[k];
	return result;
}

function create_root_component_slot_fn(elements) {
	return function create_root_component_slot() {
		return {
			c: noop,

			m: function mount(target, anchor) {
				elements.forEach(element => {
					insert(target, element, anchor);
				});
			},

			d: function destroy(detaching) {
				if (detaching) {
					elements.forEach(element => detach(element));
				}
			},

			l: noop,
		};
	};
}

export function create_root_component_slots(slots) {
	const root_component_slots = {};
	for (const slot_name in slots) {
		let elements = slots[slot_name];
		if (!Array.isArray(elements)) {
			elements = [elements];
		}
		root_component_slots[slot_name] = [create_root_component_slot_fn(elements)];
	}
	return root_component_slots;
}
