import { assign } from './utils.js';

export function destroyIteration(iteration, lookup) {
	var first = iteration.first
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
	var expected = head;

	var keep = {};
	var should_remount = {};

	for (var i = 0; i < list.length; i += 1) {
		var key = list[i][key_prop];
		var iteration = lookup[key];

		if (dynamic && iteration) iteration.p(changed, get_context(i));

		if (expected && (key === expected.key)) {
			var first = iteration && iteration.first;
			var parentNode = first && first.parentNode;

			var next_item = list[i + 1];
			var next = next_item && lookup[next_item[key_prop]];

			if (!parentNode || (iteration && iteration.next) != next) should_remount[key] = 1;
			expected = iteration.next;
		} else if (iteration) {
			should_remount[key] = 1;
			expected = iteration.next;
		} else {
			// key is being inserted
			iteration = lookup[key] = create_each_block(component, key, get_context(i));
			iteration.c();
			should_remount[key] = 1;
		}

		lookup[key] = iteration;
		keep[iteration.key] = 1;
	}

	var destroy = has_outro
		? outroAndDestroyIteration
		: destroyIteration;

	iteration = head;
	while (iteration) {
		if (!keep[iteration.key]) destroy(iteration, lookup);
		iteration = iteration.next;
	}

	var next = null;
	var next_iteration = null;

	for (i = list.length - 1; i >= 0; i -= 1) {
		var data = list[i];
		var key = data[key_prop];
		iteration = lookup[key];

		if (key in should_remount) {
			var anchor;

			if (has_outro) {
				var next_key = next && next.key;
				var neighbour = iteration.next;
				var anchor_key;

				while (neighbour && anchor_key != next_key && !keep[anchor_key]) {
					anchor = neighbour && neighbour.first;
					neighbour = neighbour.next;
					anchor_key = neighbour && neighbour.key;
				}
			} else {
				anchor = next_iteration && next_iteration.first;
			}

			iteration[intro_method](node, anchor);
		}

		iteration.next = next_iteration;
		if (next_iteration) next_iteration.last = iteration;
		next_iteration = iteration;
	}
}