import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');

		button.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>hide</button> <p>hello</p>');
	}
});
