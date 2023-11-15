import { test } from '../../test';

export default test({
	html: `
		JohnJill
	`,

	test({ assert, component, target }) {
		component.names = component.names.reverse();
		assert.htmlEqual(target.innerHTML, 'JillJohn');
	}
});
