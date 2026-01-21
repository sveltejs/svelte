import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const button = /** @type {HTMLElement} */ (target.querySelector('button'));

		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li data-item="1"><span>10</span><span>20</span></li></ul><button>add</button>`
		);

		button.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li data-item="1"><span>10</span><span>20</span></li><li data-item="2"><span>20</span><span>40</span></li></ul><button>add</button>`
		);

		button.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li data-item="1"><span>10</span><span>20</span></li><li data-item="2"><span>20</span><span>40</span></li><li data-item="3"><span>30</span><span>60</span></li></ul><button>add</button>`
		);
	}
});
