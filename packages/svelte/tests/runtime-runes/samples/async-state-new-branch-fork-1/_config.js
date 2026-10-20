import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [x, y, shift, pop, commit] = target.querySelectorAll('button');

		x.click();
		await tick();

		y.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit</button>
			<hr>
		`
		);

		commit.click(); // puts fork (x) behind y so it has to wait on y first
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit</button>
			<hr>
		`
		);

		shift.click(); // ... which is why nothing happens yet on first shift
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit</button>
			<hr>
		`
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>shift</button>
			<button>pop</button>
			<button>commit</button>
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
