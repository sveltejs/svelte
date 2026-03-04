import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [shift, update] = target.querySelectorAll('button');

		shift.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>shift</button><button>update</button><p>hello</p>');

		update.click();
		const promise = settled();

		await tick();
		shift.click();
		await promise;

		assert.htmlEqual(
			target.innerHTML,
			'<button>shift</button><button>update</button><p>goodbye</p>'
		);
	}
});
