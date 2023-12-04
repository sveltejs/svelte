import { test } from '../../test';

// Tests that default values only fire lazily when the prop is undefined, and only initially
export default test({
	props: {
		p0: 0,
		p1: 0,
		p2: 0,
		p3: 0
	},
	html: `<p>props: 0 0 0 0 1 1 1 1</p><p>log: nested.fallback_value,fallback_fn`,
	async test({ assert, target, component }) {
		component.p0 = undefined;
		component.p1 = undefined;
		component.p2 = undefined;
		component.p3 = undefined;
		component.p4 = undefined;
		component.p5 = undefined;
		component.p6 = undefined;
		component.p7 = undefined;
		assert.htmlEqual(target.innerHTML, `<p>props: </p><p>log: nested.fallback_value,fallback_fn`);
	}
});
