import { test } from '../../test';

export default test({
	ssrHtml: `
		<div></div>
		<div inert="">some div <button>click</button></div>
	`,

	get props() {
		return { inert: true };
	},

	test({ assert, target, component }) {
		const [div1, div2] = target.querySelectorAll('div');
		assert.ok(!div1.inert);
		assert.ok(div2.inert);

		component.inert = false;
		assert.ok(!div2.inert);
	}
});
