import { noop } from './environment';

export const is_promise = <T = any>(value: any): value is PromiseLike<T> =>
	value && typeof value === 'object' && typeof value.then === 'function';

export const safe_not_equal = (a, b) =>
	a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';

export const not_equal = (a, b) => (a != a ? b == b : a !== b);

export function subscribe(store, subscriber, invalidator?) {
	if (store == null) return noop;
	const unsub = store.subscribe(subscriber, invalidator);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

export function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}

export function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn ? Object.assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}

export function get_slot_changes(definition, $$scope, dirty, fn) {
	if (!definition[2] || !fn) return $$scope.dirty;
	const lets = definition[2](fn(dirty));
	if ($$scope.dirty === void 0) return lets;
	else if (typeof lets === 'object') {
		const merged = new Array(Math.max($$scope.dirty.length, lets.length));
		for (let i = 0; i < merged.length; i += 1) merged[i] = $$scope.dirty[i] | lets[i];
		return merged;
	} else return $$scope.dirty | lets;
}

export function once(fn) {
	let ran = false;
	return function (this: any, ...args) {
		if (ran) return;
		ran = true;
		fn.call(this, ...args);
	};
}
export const set_store_value = (store, ret, value) => (store.set(value || ret), ret);

export function action_destroyer(action_result) {
	return action_result && 'function' === typeof action_result.destroy ? action_result.destroy : noop;
}
