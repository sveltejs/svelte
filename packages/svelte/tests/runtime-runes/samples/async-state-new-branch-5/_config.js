import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<h1>WORLD</h1>
		`
		);

		y.click();
		await tick();
		// the new branch reads `upper` — a derived owned by the pending batch — as
		// a new dependency. The two batches entangle, so the new branch is held
		// back until the async work completes (rather than rendering with the
		// derived's pre-write value, 'WORLD')
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<h1>WORLD</h1>
		`
		);

		resolve.click();
		await tick();
		// both branches commit together, fully consistent
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<h1>UNIVERSE</h1>
			universe
			<p>UNIVERSE</p>
		`
		);
	}
});
