import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>1 / 1</button>',
	async test({ assert, target }) {
		const button = target.querySelector('button');
		button?.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>3 / 2</button>');
	}
});
