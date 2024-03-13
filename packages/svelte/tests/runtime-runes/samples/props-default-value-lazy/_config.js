import { test } from '../../test';

// Tests that default values only fire lazily when the prop is undefined, and every time
export default test({
	props: {
		p0: 0,
		p1: 0,
		p2: 0,
		p3: 0
	},
	html: `<p>props: 0 0 0 0 1 1 1 1</p><p>log: nested.fallback_value,fallback_fn`,
	async test({ assert, target, component }) {
		// using component.p0 etc would set it to undefined, because the setter forgoes the default value
		await component.$set({
			p0: undefined,
			p1: undefined,
			p2: undefined,
			p3: undefined,
			p4: undefined,
			p5: undefined,
			p6: undefined,
			p7: undefined
		});
		assert.htmlEqual(
			target.innerHTML,
			`<p>props: 1 1 1 1 1 1 1 1</p><p>log: nested.fallback_value,fallback_fn,nested.fallback_value,fallback_fn`
		);
	}
});
