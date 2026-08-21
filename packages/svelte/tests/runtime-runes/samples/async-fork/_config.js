import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const [shift, increment, commit] = target.querySelectorAll('button');

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 0</p>
				<p>eager: 0</p>
				<p>even</p>
			`
		);

		increment.click();
		await tick();

		shift.click();
		await tick();

		// nothing updates until commit
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 0</p>
				<p>eager: 0</p>
				<p>even</p>
			`
		);

		commit.click();
		await tick();

		// nothing updates until commit
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 1</p>
				<p>eager: 1</p>
				<p>odd</p>
			`
		);

		increment.click();
		await tick();

		commit.click();
		await tick();

		// eager state updates on commit
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 1</p>
				<p>eager: 2</p>
				<p>odd</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<button>commit</button>
				<p>count: 2</p>
				<p>eager: 2</p>
				<p>even</p>
			`
		);
	}
});
