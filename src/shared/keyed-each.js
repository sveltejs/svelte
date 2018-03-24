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

export function updateKeyedEach(old_blocks, component, changed, key_prop, dynamic, list, lookup, node, has_outro, create_each_block, intro_method, get_context) {
	var old_indexes = {};
	var i = 0;

	var old_keys = old_blocks.map(function(block) {
		return block.key;
	});

	var o = old_blocks.length;
	var n = list.length;

	var new_blocks = [];
	var new_lookup = {};
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

		new_blocks[i] = new_lookup[key] = block;

		if (key in old_indexes) deltas[key] = Math.abs(i - old_indexes[key]);
	}

	var next = null;

	var will_move = {};
	var did_move = {};

	var destroy = has_outro ? outroAndDestroyIteration : destroyIteration;

	while (o && n) {
		var new_block = new_blocks[n - 1];
		var old_block = old_blocks[o - 1];
		var new_key = new_block.key;
		var old_key = old_block.key;

		if (new_block === old_block) {
			o--;
			n--;

			next = new_block;
		}

		else if (!new_lookup[old_key]) {
			// removing
			destroy(old_block, lookup);
			o--;
		}

		else if (!lookup[new_key]) {
			// creating
			new_block[intro_method](node, next && next.first);
			next = lookup[new_key] = new_block;
			n--;
		}

		else {
			// moving
			if (did_move[old_key]) {
				o--;

			} else if (will_move[new_key]) {
				new_block[intro_method](node, next && next.first);
				next = new_block;
				n--;

			} else if (deltas[new_key] > deltas[old_key]) {
				// we already have both blocks, but they're out of order
				new_block[intro_method](node, next && next.first);
				next = new_block;
				did_move[new_key] = true;
				n--;

			} else {
				will_move[old_key] = true;
				o--;
			}
		}
	}

	while (o--) {
		var old_block = old_blocks[o];
		if (!new_lookup[old_block.key]) destroy(old_block, lookup);
	}

	while (n--) {
		var key = list[n][key_prop];
		new_lookup[key][intro_method](node, next && next.first);
		next = lookup[key] = new_lookup[key];
	}

	return list.map(function(item) {
		return new_lookup[item[key_prop]];
	});
}