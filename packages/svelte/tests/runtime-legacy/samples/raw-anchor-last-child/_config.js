import { ok, test } from '../../test';

export default test({
	get props() {
		return { raw: '<span>foo</span>' };
	},

	test({ assert, component, target }) {
		const span = target.querySelector('span');
		ok(span);

		// In Svelte 5 we have an anchor after the raw fragment
		assert.ok(span.nextSibling);
		assert.ok(!span.nextSibling?.nextSibling);

		component.raw = '<span>bar</span>';
	}
});
