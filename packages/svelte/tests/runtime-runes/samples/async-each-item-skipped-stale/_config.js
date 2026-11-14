import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const [skip, readd, resolve_earlier, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>c = 2, list = [3]</button><button>list = [5, 1]</button><button>resolve 6</button><button>resolve all</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<s>0|0</s><s>1|1</s>`);

		// the second item is skipped by this batch, which also changes what it shows
		skip.click();
		await tick();
		// the second item is needed again by a later batch
		readd.click();
		await tick();

		// resolve the earlier batch first, so that it commits first
		resolve_earlier.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>3|6</s>`);

		for (let i = 0; i < 5; i++) {
			await tick();
			resolve_all.click();
		}
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<s>5|10</s><s>1|2</s>`);
	}
});
