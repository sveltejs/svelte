export function noop() {}

export function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

export function _differsImmutable(a, b) {
	return a != a ? b == b : a !== b;
}

export function run(fn) {
	fn();
}

export function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

export function isPromise(value) {
	return value && typeof value.then === 'function';
}

export var PENDING = {};
export var SUCCESS = {};
export var FAILURE = {};

export function removeFromStore() {
	this.store._remove(this);
}