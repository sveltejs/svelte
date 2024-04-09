import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<button>click true</button> Child: true`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>click false</button> Child: false`);

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>click true</button> Child: true`);
	}
});
