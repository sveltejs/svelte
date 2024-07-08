import { test } from '../../test';

const data = {
	message: 'hello'
};

export default test({
	get props() {
		data.message = 'hello';

		return {
			data
		};
	},

	html: '<p>hello</p>',

	async test({ assert, component, target }) {
		data.message = 'goodbye';
		await component.$set({ data });

		assert.htmlEqual(target.innerHTML, '<p>goodbye</p>');
	}
});
