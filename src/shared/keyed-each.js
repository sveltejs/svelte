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

// TODO is it possible to avoid mounting iterations that are
// already in the right place?
export function updateKeyedEach(component, key, changed, key_prop, dynamic, list, head, lookup, node, has_outro, create_each_block, intro_method, get_context) {
	var expected = head;

	var keep = {};
	var mounts = {};

	for (var i = 0; i < list.length; i += 1) {
		var key = list[i][key_prop];
		var iteration = lookup[key];
		var next_data = list[i+1];
		var next = next_data && lookup[next_data[key_prop]];

		if (dynamic && iteration) iteration.p(changed, get_context(i)); // TODO should this be deferred? could it be redundant?

		if (expected && (key === expected.key)) {
			var first = iteration && iteration.first;
			var parentNode = first && first.parentNode
			if (!parentNode || (iteration && iteration.next) != next) mounts[key] = iteration;
			expected = iteration.next;
		} else if (iteration) {
			mounts[key] = iteration;
			expected = iteration.next;
		} else {
			// key is being inserted
			iteration = lookup[key] = create_each_block(component, key, get_context(i));
			iteration.c();
			mounts[key] = iteration;
		}
		lookup[key] = iteration;
		keep[iteration.key] = iteration;
		// last = iteration;
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

		var block = mounts[key];
		if (block) {
			var anchor;

			if (has_outro) {
				var key_next_iteration = next_iteration && next_iteration.key;
				var iteration_anchor = iteration.next;
				var key_anchor;
				do {
					anchor = iteration_anchor && iteration_anchor.first;
					iteration_anchor = iteration_anchor && iteration_anchor.next;
					key_anchor = iteration_anchor && iteration_anchor.key;
				} while(iteration_anchor && key_anchor != key_next_iteration && !keep[key_anchor])
			} else {
				anchor = next_iteration && next_iteration.first;
			}

			block[intro_method](node, anchor);
		}

		iteration.next = next_iteration;
		if (next_iteration) next_iteration.last = iteration;
		next_iteration = iteration;
	}
}