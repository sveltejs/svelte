import { test } from '../../test';

export default test({
	html: `<p>42</p>`,

	async test({ assert, target, window, component }) {
		assert.equal(component.answer, undefined);
	}
});
