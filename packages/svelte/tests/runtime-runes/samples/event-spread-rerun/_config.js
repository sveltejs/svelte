import { test, ok } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, logs, target }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'foo';
		await input.dispatchEvent(new Event('input'));

		assert.deepEqual(logs, ['hi']);
	}
});
