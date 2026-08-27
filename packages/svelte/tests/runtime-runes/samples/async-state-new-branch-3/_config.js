import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();

		y.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<hr>
		`
		);

		resolve.click();
		await tick();
		// the new branch's async expression read `x` as a new dependency on a value
		// the pending batch had written, so it saw the latest value ('universe')
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
