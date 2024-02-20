import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>state1.value: a state2.value: a</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>state1.value: b state2.value: b</button>`);
	}
});
