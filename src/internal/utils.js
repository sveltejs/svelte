export function noop() {}

export const identity = x => x;

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function isPromise(value) {
	return value && typeof value.then === 'function';
}

export function addLoc(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
	};
}

export function run(fn) {
	return fn();
}

export function blankObject() {
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
	component.$$.on_destroy.push(store.subscribe(callback));
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

export function exclude_internal_props(props) {
	const result = {};
	for (const k in props) if (k[0] !== '$') result[k] = props[k];
	return result;
}