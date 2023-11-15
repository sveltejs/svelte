import { test } from '../../test';

export default test({
	props: {
		x: 1,
		y: 2,
		z: 3
	},
	html: `<pre>{"x":1,"z":3}</pre>`,

	async test({ assert, target, component }) {
		component.y = 4;
		assert.htmlEqual(target.innerHTML, `<pre>{"x":1,"z":3}</pre>`);
	}
});
