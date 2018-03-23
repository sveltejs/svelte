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

	var new_keys = list.map(item => item[key_prop]).join(''); // TODO this is temporary

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
			// TODO update
		}

		new_blocks[key] = block;

		if (key in old_indexes) deltas[key] = Math.abs(i - old_indexes[key]);
	}

	var next = null;

	var will_move = {};
	var did_move = {};

	var r = 100;

	console.log('deltas', deltas);

	while (o && n) {
		if (!--r) throw new Error('hmm');

		var item = list[n - 1];
		var new_key = item[key_prop];
		var old_key = old_keys[o - 1];
		console.log(`${old_keys.slice(0, o - 1).join('')}[${old_key}]${old_keys.slice(o).join('')} ${new_keys.slice(0, n - 1)}[${new_key}]${new_keys.slice(n)}`);

		if (new_key === old_key) {
			console.log('SAME SAME');
			o--;
			n--;

			next = new_blocks[new_key];
		}

		else if (lookup[old_key] && !new_blocks[old_key]) {
			// removing
			console.log(`removing ${old_key}`);
			destroyIteration(lookup[old_key], lookup);
			o--;
		}

		else if (!lookup[new_key]) {
			// creating
			console.log(`adding ${new_key}`);
			new_blocks[new_key][intro_method](node, next && next.first);
			next = new_blocks[new_key];
			lookup[new_key] = new_blocks[new_key];
			n--;
		}

		else if (lookup[old_key] && lookup[new_key]) {
			console.log('both previously existed');
			if (did_move[old_key]) {
				console.log('did move', old_key);
				o--;
				// next = new_blocks[old_key];

			} else if (will_move[new_key]) {
				console.log('moving', new_key);
				new_blocks[new_key][intro_method](node, next && next.first);
				n--;

			} else if (deltas[new_key] > deltas[old_key]) {
				// we already have both blocks, but they're out of order
				console.log('inserting', new_key);
				new_blocks[new_key][intro_method](node, next && next.first);
				next = new_blocks[new_key];
				did_move[new_key] = true;
				n--;

			} else {
				console.log('will move', old_key);
				will_move[old_key] = true;
				o--;
			}
		}

		else {
			throw new Error('???');
		}

		console.log(document.body.textContent);
		console.log(`next is ${next && next.key}\n`);
	}

	console.log({ will_move: Object.keys(will_move) });

	while (o--) {
		var old_key = old_keys[o];
		if (!new_blocks[old_key]) destroyIteration(lookup[old_key], lookup);
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