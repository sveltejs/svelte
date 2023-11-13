import { test } from '../../test';

export default test({
	get props() {
		return { raw: '<p>does not change</p>' };
	},

	html: '<div><p>does not change</p></div>',

	test({ assert, component, target }) {
		const p = target.querySelector('p');

		component.raw = '<p>does not change</p>';
		assert.htmlEqual(target.innerHTML, '<div><p>does not change</p></div>');
		assert.strictEqual(target.querySelector('p'), p);
	}
});
