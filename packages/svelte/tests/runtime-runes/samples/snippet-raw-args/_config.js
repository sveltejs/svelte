import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // Render in dev mode to check that the validation error is not thrown
	},
	html: `<div><div>0</div></div><button>+</button>`,

	test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		b1?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<div><div>1</div></div><button>+</button>`);
	}
});
