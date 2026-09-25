import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO works on https://github.com/sveltejs/svelte/pull/17971
	async test({ assert, target }) {
		const [x, y, resolve, commit] = target.querySelectorAll('button');

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
			<button>commit</button>
			<hr>
			world
			"world"
			world
			world
			world
			"world"
		`
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			<button>commit</button>
			<hr>
			world
			"world"
			world
			world
			world
			"world"
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
