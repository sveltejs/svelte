import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO works on https://github.com/sveltejs/svelte/pull/17971
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

		commit.click();
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
