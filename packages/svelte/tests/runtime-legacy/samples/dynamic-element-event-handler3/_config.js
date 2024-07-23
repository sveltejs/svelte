import { test } from '../../test';

export default test({
	html: '<button>Click</button>',

	test({ assert, logs, target }) {
		const button = target.querySelector('button');

		button?.click();
		button?.click();
		button?.click();

		assert.deepEqual(logs, ['create', 'trigger', 'trigger', 'trigger']);
	}
});
