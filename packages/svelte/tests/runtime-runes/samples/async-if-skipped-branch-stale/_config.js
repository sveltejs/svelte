import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const [skip, show, resolve_earlier, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>b = 1, show = false</button><button>c = 1, show = true</button><button>resolve p1</button><button>resolve all</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<p>p0</p><u>c0</u><i>i0</i>`);

		// the branch is skipped by this batch, which also changes what the branch shows
		skip.click();
		await tick();
		// the branch is needed again by a later batch
		show.click();
		await tick();

		// resolve the earlier batch first, so that it commits first
		resolve_earlier.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p1</p><u>c0</u>`);

		for (let i = 0; i < 5; i++) {
			await tick();
			resolve_all.click();
		}
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p1</p><u>c1</u><i>i1</i>`);
	}
});
