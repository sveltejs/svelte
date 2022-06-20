import { is_promise } from './utils';
import { check_outros, group_outros, transition_in, transition_out } from './transitions';
import { flush } from './scheduler';
import { get_current_component, set_current_component } from './lifecycle';

export function handle_promise(promise, info) {
	const token = info.token = {};

	function update(type, index, key?, value?) {
		if (info.token !== token) return;

		info.resolved = value;

		let child_ctx = info.ctx;

		if (key !== undefined) {
			child_ctx = child_ctx.slice();
			child_ctx[key] = value;
		}

		const block = type && (info.current = type)(child_ctx);

		let needs_flush = false;

		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach((block, i) => {
					if (i !== index && block) {
						group_outros();
						transition_out(block, 1, 1, () => {
							if (info.blocks[i] === block) {
								info.blocks[i] = null;
							}
						});
						check_outros();
					}
				});
			} else {
				info.block.d(1);
			}

			block.c();
			transition_in(block, 1);
			block.m(info.mount(), info.anchor);

			needs_flush = true;
		}

		info.block = block;
		if (info.blocks) info.blocks[index] = block;

		if (needs_flush) {
			flush();
		}
	}

	if (is_promise(promise)) {
		const current_component = get_current_component();
		promise.then(value => {
			set_current_component(current_component);
			update(info.then, 1, info.value, value);
			set_current_component(null);
		}, error => {
			set_current_component(current_component);
			update(info.catch, 2, info.error, error);
			set_current_component(null);
			if (!info.hasCatch) {
				throw error;
			}
		});

		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending, 0);
			return true;
		}
	} else {
		if (info.current !== info.then) {
			update(info.then, 1, info.value, promise);
			return true;
		}

		info.resolved = promise;
	}
}

export function update_await_block_branch(info, ctx, dirty) {
	const child_ctx = ctx.slice();
	const { resolved } = info;

	if (info.current === info.then) {
		child_ctx[info.value] = resolved;
	}
	if (info.current === info.catch) {
		child_ctx[info.error] = resolved;
	}

	info.block.p(child_ctx, dirty);
}
