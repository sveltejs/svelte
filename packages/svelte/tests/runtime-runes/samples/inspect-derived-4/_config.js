import { tick } from 'svelte';
import { test } from '../../test';
import { normalise_inspect_logs } from '../../../helpers';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [b] = target.querySelectorAll('button');

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>first unseen: 1</button>`);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>first unseen: 2</button>`);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>first unseen:</button>`);

		assert.deepEqual(normalise_inspect_logs(logs), [
			[0, 1, 2],
			[1, 2],
			'at SvelteSet.add',
			[2],
			'at SvelteSet.add',
			[],
			'at SvelteSet.add'
		]);
	}
});
