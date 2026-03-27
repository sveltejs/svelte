import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
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
			world
		` // if this does not show world - that would also be ok
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
		// assert.deepEqual(logs, ['universe', 'universe', '$effect: universe', '$effect: universe']); // this would also be ok
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
