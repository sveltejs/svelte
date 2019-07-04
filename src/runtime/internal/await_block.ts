import { assign, is_promise } from './utils';
import { check_outros, group_outros, transition_in, transition_out } from './transitions';
import { flush } from './scheduler';

export function handle_promise(promise, info) {
	const token = info.token = {};

	function update(type, index, key?, value?) {
		if (info.token !== token) return;

		info.resolved = key && { [key]: value };

		const child_ctx = assign(assign({}, info.ctx), info.resolved);
		const block = type && (info.current = type)(child_ctx);

		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach((block, i) => {
					if (i !== index && block) {
						group_outros();
						transition_out(block, 1, 1, () => {
							info.blocks[i] = null;
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

			flush();
		}

		info.block = block;
		if (info.blocks) info.blocks[index] = block;
	}

	if (is_promise(promise)) {
		promise.then(value => {
			update(info.then, 1, info.value, value);
		}, error => {
			update(info.catch, 2, info.error, error);
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

		info.resolved = { [info.value]: promise };
	}
}
