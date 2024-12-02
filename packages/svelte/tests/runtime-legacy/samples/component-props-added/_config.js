import { test } from '../../test';

export default test({
	get props() {
		return {};
	},

	html: '',

	async test({ assert, component, target }) {
		await component.$set({ message: 'goodbye' });

		assert.htmlEqual(target.innerHTML, '<p>goodbye</p>');
	}
});
