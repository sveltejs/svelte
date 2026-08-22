import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_async: true,
	async test({ assert, target }) {
		// const [update] = target.querySelectorAll('button');
		// await tick();
		// console.log(target.innerHTML);
		// assert.htmlEqual(target.innerHTML, `<h1>0</h1> <button>update</button>`);
		// update.click();
		// await tick();
		// console.log(target.innerHTML);
		// assert.htmlEqual(target.innerHTML, `<h1>5</h1> <button>update</button>`);
	}
});
