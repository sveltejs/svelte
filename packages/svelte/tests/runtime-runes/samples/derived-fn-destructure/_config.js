import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	html: `<button>0</button>`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await btn?.dispatchEvent(clickEvent);

		assert.htmlEqual(target.innerHTML, `<button>2</button>`);
		assert.deepEqual(log, ['create_derived']);
	}
});
