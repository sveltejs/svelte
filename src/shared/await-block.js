import { assign, isPromise } from './utils.js';

export function handlePromise(promise, info) {
	var token = info.token = {};

	function update(type, key, value) {
		if (info.token !== token) return;

		info.resolved = key && { [key]: value };

		const child_ctx = assign(assign({}, info.ctx), info.resolved);
		const block = type && (info.current = type)(info.component, child_ctx);

		if (info.block) {
			info.block.u();
			info.block.d();
			block.c();
			block.m(info.mount(), info.anchor);

			info.component.root.set({});
		}

		info.block = block;
	}

	if (isPromise(promise)) {
		promise.then(value => {
			update(info.then, info.value, value);
		}, error => {
			update(info.catch, info.error, error);
		});

		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending);
			return true;
		}
	} else {
		if (info.current !== info.then) {
			update(info.then, info.value, promise);
			return true;
		}

		info.resolved = { [info.value]: promise };
	}
}