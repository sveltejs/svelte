import { assign } from './utils.js';

export function destroyIteration(iteration, lookup) {
	var first = iteration.first;
	if (first && first.parentNode) {
		iteration.u();
	}
	iteration.d();
	lookup[iteration.key] = null;
}

export function outroAndDestroyIteration(iteration, lookup) {
	iteration.o(function() {
		iteration.u();
		iteration.d();
		lookup[iteration.key] = null;
	});
}

export function updateKeyedEach(component, key, changed, key_prop, dynamic, list, head, lookup, node, has_outro, create_each_block, intro_method, get_context) {
	var old_indexes = {};
	var i = 0;

	var old_keys = [];
	while (head) {
		old_keys.push(head.key);
		old_indexes[head.key] = i++;
		head = head.next;
	}

	var o = old_keys.length;
	var n = list.length;

	var new_blocks = {};
	var deltas = {};

	var i = n;
	while (i--) {
		var key = list[i][key_prop];
		var block = lookup[key];
		if (!block) {
			block = create_each_block(component, key, get_context(i));
			block.c();
		} else if (dynamic) {
			block.p(changed, get_context(i));
		}

		new_blocks[key] = block;

		if (key in old_indexes) deltas[key] = Math.abs(i - old_indexes[key]);
	}

	var next = null;

	var will_move = {};
	var did_move = {};

	var destroy = has_outro ? outroAndDestroyIteration : destroyIteration;

	while (o && n) {
		var item = list[n - 1];
		var new_key = item[key_prop];
		var old_key = old_keys[o - 1];

		if (new_key === old_key) {
			o--;
			n--;

			next = new_blocks[new_key];
		}

		else if (lookup[old_key] && !new_blocks[old_key]) {
			// removing
			destroy(lookup[old_key], lookup);
			o--;
		}

		else if (!lookup[new_key]) {
			// creating
			new_blocks[new_key][intro_method](node, next && next.first);
			next = new_blocks[new_key];
			lookup[new_key] = new_blocks[new_key];
			n--;
		}

		else if (lookup[old_key] && lookup[new_key]) {
			if (did_move[old_key]) {
				o--;

			} else if (will_move[new_key]) {
				new_blocks[new_key][intro_method](node, next && next.first);
				next = new_blocks[new_key];
				n--;

			} else if (deltas[new_key] > deltas[old_key]) { // TODO does this make a difference?
				// we already have both blocks, but they're out of order
				new_blocks[new_key][intro_method](node, next && next.first);
				next = new_blocks[new_key];
				did_move[new_key] = true;
				n--;

			} else {
				will_move[old_key] = true;
				o--;
			}
		}
	}

	while (o--) {
		var old_key = old_keys[o];
		if (!new_blocks[old_key]) destroy(lookup[old_key], lookup);
	}

	while (n--) {
		var key = list[n][key_prop];
		new_blocks[key][intro_method](node, next && next.first);
		next = new_blocks[key];
	}

	// TODO keep track of keys, so this is unnecessary
	var next = null;
	var i = list.length;
	while (i--) {
		var key = list[i][key_prop];
		var block = lookup[key] = new_blocks[key];

		block.next = next;
		next = block;
	}
}