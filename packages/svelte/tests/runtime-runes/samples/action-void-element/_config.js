import { test } from '../../test';

export default test({
	html: `<input><input>`,

	async test({ assert, target }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].value, 'set from action');
		assert.equal(inputs[1].value, 'set from action');
	}
});
