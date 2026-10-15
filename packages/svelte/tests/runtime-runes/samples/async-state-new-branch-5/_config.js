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
		// the new branch reads `upper` — a derived of the source the pending batch
		// wrote — as a new dependency. It renders with the pre-write value 'WORLD',
		// as the pending batch's write is hidden from the batch that commits
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<h1>WORLD</h1>
			<p>WORLD</p>
		`
		);

		resolve.click();
		await tick();
		// the pending batch discovers that the new branch depends on its write
		// when it resumes, and commits it fully consistent
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
