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

export function updateKeyedEach(component, key, changed, key_prop, dynamic, list, head, lookup, updateMountNode, hasOutroMethod, create_each_block, get_context) {
	var keep = {};

	var i = list.length;
	while (i--) {
		var key = list[i][key_prop];
		var iteration = lookup[key];

		if (iteration) {
			if (dynamic) iteration.p(changed, get_context(i));
		} else {
			iteration = lookup[key] = create_each_block(component, key, get_context(i));
			iteration.c();
		}

		lookup[key] = iteration;
		keep[key] = 1;
	}

	var destroy = hasOutroMethod
		? outroAndDestroyIteration
		: destroyIteration;

	iteration = head;
	while (iteration) {
		if (!keep[iteration.key]) destroy(iteration, lookup);
		iteration = iteration.next;
	}

	var next = null;

	i = list.length;
	while (i--) {
		key = list[i][key_prop];
		iteration = lookup[key];

		var anchor;

		if (hasOutroMethod) {
			var next_key = next && next.key;
			var neighbour = iteration.next;
			var anchor_key;

			while (neighbour && anchor_key != next_key && !keep[anchor_key]) {
				anchor = neighbour && neighbour.first;
				neighbour = neighbour.next;
				anchor_key = neighbour && neighbour.key;
			}
		} else {
			anchor = next && next.first;
		}

		iteration[iteration.i ? 'i' : 'm'](updateMountNode, anchor);

		iteration.next = next;
		if (next) next.last = iteration;
		next = iteration;
	}
}