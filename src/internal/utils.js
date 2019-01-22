export function noop() {}

export const identity = x => x;

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
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

export function exclude(src, prop) {
	const tar = {};
	for (const k in src) k === prop || (tar[k] = src[k]);
	return tar;
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

export function create_slot(definition, ctx) {
	if (definition) {
		const slot_ctx = definition[1]
			? assign({}, assign(ctx.$$scope.ctx, definition[1](ctx)))
			: ctx.$$scope.ctx;

		return definition[0](slot_ctx);
	}
}