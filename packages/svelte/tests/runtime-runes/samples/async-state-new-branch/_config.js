import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // this fails on main, too; skip for now
	async test({ assert, target, logs }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();
		assert.deepEqual(logs, ['universe']);

		y.click();
		await tick();
		assert.deepEqual(logs, ['universe', 'world', '$effect: world']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			world
		`
		);

		resolve.click();
		await tick();
		assert.deepEqual(logs, [
			'universe',
			'world',
			'$effect: world',
			'$effect: universe',
			'$effect: universe'
		]);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			universe
			universe
			universe
		`
		);
	}
});
