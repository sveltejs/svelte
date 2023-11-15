import { test } from '../../test';

export default test({
	html: `
		<p>42</p>
	`,

	async test({ assert, component }) {
		assert.equal(component.initial_foo, 42);
	}
});
