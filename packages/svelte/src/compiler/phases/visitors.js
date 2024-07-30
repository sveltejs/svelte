/** @import { Visitors, Context } from 'zimmerframe' */
const overrides = {
	visit() {
		throw new Error('Cannot call visit() during analysis');
	},
	stop() {
		throw new Error('Cannot call stop() during analysis');
	}
};

// TODO get rid of this
/**
 * @template {{ type: string }} T
 * @template U
 * @param  {...Visitors<T, U>} tasks
 * @returns
 */
export function merge(...tasks) {
	/** @type {Record<string, any[]>} */
	const visitors = {};

	for (const task of tasks) {
		for (const key in task) {
			if (!visitors[key]) visitors[key] = [];
			visitors[key].push(task[key]);
		}
	}

	/** @type {Visitors<T, U>} */
	// @ts-expect-error
	const combined = {};

	for (const key in visitors) {
		const fns = visitors[key];

		/**
		 * @param {T} node
		 * @param {Context<T, U>} context
		 */
		function visitor(node, context) {
			/**
			 * @param {number} i
			 * @param {U} state
			 */
			function go(i, state) {
				const fn = fns[i];
				if (!fn) return context.next(state);

				let called_next = false;

				fn(node, {
					...context,
					...overrides,
					state,
					next(next_state = state) {
						called_next = true;
						go(i + 1, next_state);
					}
				});

				if (!called_next) {
					go(i + 1, state);
				}
			}

			go(0, context.state);
		}

		// @ts-expect-error
		combined[key] = visitor;
	}

	return combined;
}
