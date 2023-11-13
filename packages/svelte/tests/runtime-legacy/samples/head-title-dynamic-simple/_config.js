import { test } from '../../test';

export default test({
	get props() {
		return { foo: 'A Title' };
	},

	test({ assert, component, window }) {
		assert.equal(window.document.title, 'A Title');

		component.foo = 'Also A Title';
		assert.equal(window.document.title, 'Also A Title');
	}
});
