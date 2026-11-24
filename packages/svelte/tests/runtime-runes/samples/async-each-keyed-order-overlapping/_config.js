import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const [set_b, list_1, list_2, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>b = 2</button><button>list = [2, 1]</button><button>list = [2, 0, 3]</button><button>resolve all</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<b>0</b><b>1</b>`);

		set_b.click();
		await tick();
		list_1.click();
		await tick();
		list_2.click();

		for (let i = 0; i < 5; i++) {
			await tick();
			resolve_all.click();
		}
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<b>4</b><b>2</b><b>5</b>`);
	}
});
