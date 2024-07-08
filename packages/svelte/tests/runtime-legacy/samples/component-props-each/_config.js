import { test } from '../../test';

const data = {
	items: [1, 1]
};

export default test({
	get props() {
		data.items = [1, 1];

		return {
			data
		};
	},

	async test({ assert, component, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<div>1</div><div>1</div>`
		);

		data.items = [2, 2];

		await component.$set({
			data
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>2</div><div>2</div>`
		);
	}
});
