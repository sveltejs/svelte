import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>0 | 0</button>',
	async test({ assert, target }) {
		const [increment] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>1 | 2</button>');
	}
});
