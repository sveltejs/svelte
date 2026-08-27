import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();

		y.click();
		await tick();
		// the new branch's reads of `x` are new dependencies on a value the
		// pending batch has written, so they see the latest value ('universe')
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<hr>
			universe
			"universe"
			universe
			universe
			universe
			"universe"
		`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
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
		`
		);
	}
});
