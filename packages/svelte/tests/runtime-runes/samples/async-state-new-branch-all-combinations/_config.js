import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	timeout: 20_000,
	async test({ assert, target }) {
		const [x, fork_x, y, fork_y, shift, pop, commit_x, commit_y, reset] =
			target.querySelectorAll('button');

		const initial = `
			<button>x</button>
			<button>x (fork)</button>
			<button>y++</button>
			<button>y++ (fork)</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit x</button>
			<button>commit y</button>
			<button>reset</button>
			<hr>
		`;

		const final = `
			<button>x</button>
			<button>x (fork)</button>
			<button>y++</button>
			<button>y++ (fork)</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit x</button>
			<button>commit y</button>
			<button>reset</button>
			universe
			universe
			"universe"
			universe
			universe
			universe
			"universe"
			<hr>
			universe
			"universe"
			universe
			universe
			universe
			"universe"
		`;

		/** @param {HTMLElement} button */
		async function click(button) {
			button.click();
			await tick();
		}

		/**
		 * Generate all permutations of an array.
		 * @param {HTMLElement[]} actions
		 * @returns {HTMLElement[][]}
		 */
		function permutations(actions) {
			if (actions.length <= 1) return [actions];

			/** @type {HTMLElement[][]} */
			const result = [];

			for (let i = 0; i < actions.length; i++) {
				const head = actions[i];
				const rest = actions.slice(0, i).concat(actions.slice(i + 1));
				for (const tail of permutations(rest)) {
					result.push([head, ...tail]);
				}
			}

			return result;
		}

		/**
		 * Keep only valid orders where fork commits happen after their fork action.
		 * @param {HTMLElement[]} order
		 */
		function is_valid_order(order) {
			const x_fork_index = order.indexOf(fork_x);
			const commit_x_index = order.indexOf(commit_x);
			if (commit_x_index !== -1 && (x_fork_index === -1 || commit_x_index < x_fork_index)) {
				return false;
			}

			const y_fork_index = order.indexOf(fork_y);
			const commit_y_index = order.indexOf(commit_y);
			if (commit_y_index !== -1 && (y_fork_index === -1 || commit_y_index < y_fork_index)) {
				return false;
			}

			return true;
		}

		/**
		 * Four control scenarios:
		 * - x direct, y direct
		 * - x direct, y via fork+commit
		 * - x via fork+commit, y direct
		 * - x via fork+commit, y via fork+commit
		 */
		const control_scenarios = [
			[x, y],
			[x, fork_y, commit_y],
			[fork_x, commit_x, y],
			[fork_x, commit_x, fork_y, commit_y]
		];

		const control_orders = control_scenarios.flatMap((scenario) =>
			permutations(scenario).filter(is_valid_order)
		);

		/**
		 * All shift/pop combinations for draining async work.
		 * We click three times because this scenario can queue up to 3 deferred resolutions.
		 */
		const resolve_orders = [
			[shift, shift, shift],
			[shift, pop, pop],
			[pop, shift, shift],
			[pop, pop, pop]
		];

		for (const controls of control_orders) {
			for (const resolves of resolve_orders) {
				for (const action of controls) {
					await click(action);
				}

				for (const action of resolves) {
					await click(action);
				}

				const failure_msg = `Failed for: ${controls
					.map((btn) => btn.textContent)
					.concat(...resolves.map((btn) => btn.textContent))
					.join(', ')}`;
				assert.htmlEqual(target.innerHTML, final, failure_msg);

				await click(reset);
				assert.htmlEqual(target.innerHTML, initial, failure_msg);
			}
		}

		const other_scenarios = [
			[x, shift, y, shift, shift],
			[x, shift, y, pop, pop],
			[fork_x, shift, y, shift, commit_x, shift],
			[fork_x, shift, y, pop, commit_x, pop],
			[y, shift, x, shift, shift],
			[y, shift, x, pop, pop],
			[fork_y, shift, x, shift, commit_y, shift],
			[fork_y, shift, x, pop, commit_y, pop]
		];

		for (const scenario of other_scenarios) {
			for (const action of scenario) {
				await click(action);
			}

			const failure_msg = `Failed for: ${scenario.map((btn) => btn.textContent).join(', ')}`;
			assert.htmlEqual(target.innerHTML, final, failure_msg);

			await click(reset);
			assert.htmlEqual(target.innerHTML, initial, failure_msg);
		}
	}
});
