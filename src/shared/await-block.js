import { assign, isPromise } from './utils.js';

export function handlePromise(promise, info, mount, anchor) {
	var token = info.token = {};

	function update(type) {
		if (info.token !== token) return;

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
			if (info.value) {
				info.resolved = { [info.value]: value };
				update(info.then);
			} else {
				info.resolved = null;
				update(null);
			}
		}, error => {
			if (info.error) {
				info.resolved = { [info.error]: error };
				update(info.catch);
			} else {
				info.resolved = null;
				update(null);
			}
		});

		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending);
			return true;
		}
	} else {
		info.resolved = { [info.value]: promise };
		if (info.current !== info.then) {
			update(info.then);
			return true;
		}
	}
}