import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [shift, increment, commit] = target.querySelectorAll('button');

		shift.click();
		await tick();

		// baseline: count 0, even, nothing pending
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 0</p>
				<p>eager: 0</p>
				<p>pending: 0</p>
				<p>even</p>
			`
		);

		// start a fork that changes state, but does NOT commit it.
		// $effect.pending() must stay 0 — the fork's async work has not
		// been committed, so it must not surface as pending
		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 0</p>
				<p>eager: 0</p>
				<p>pending: 0</p>
				<p>even</p>
			`
		);
	}
});
