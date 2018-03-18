import { assign } from './utils.js';

export function updateKeyedEach(component, key, changed, block_key, dynamic, each_block_value, head, lookup, updateMountNode, hasOutroMethod, create_each_block, get_context) {
	var last = null;
	var expected = head;

	var keep = {};
	var mounts = {};
	var next_iteration = null;

	for (i = 0; i < each_block_value.length; i += 1) {
		var key = each_block_value[i][block_key];
		var iteration = lookup[key];
		var next_data = each_block_value[i+1];
		var next = next_data && lookup[next_data[block_key]];

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
		last = iteration;
	}

	var destroy = hasOutroMethod
		? function(iteration) {
			iteration.o(function() {
				iteration.u();
				iteration.d();
				lookup[iteration.key] = null;
			});
		}
		: function(iteration) {
			var first = iteration.first
			if (first && first.parentNode) {
				iteration.u();
			}
			iteration.d();
			lookup[iteration.key] = null;
		}

	iteration = head;
	while(iteration) {
		if (!keep[iteration.key]) {
			destroy(iteration);
		}
		iteration = iteration.next;
	}

	// Work backwards due to DOM api having insertBefore
	for (i = each_block_value.length - 1; i >= 0; i -= 1) {
		var data = each_block_value[i];
		var key = data[block_key];
		iteration = lookup[key];

		var block = mounts[key];
		if (block) {
			var anchor;

			if (hasOutroMethod) {
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

			block[block.i ? 'i' : 'm'](updateMountNode, anchor);
		}
		iteration.next = next_iteration;
		if (next_iteration) next_iteration.last = iteration;
		next_iteration = iteration;
	}
}