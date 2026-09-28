import { test } from '../../test';

export default test({
	get props() {
		return { foo: 42 };
	},

	ssrHtml: '<textarea>42</textarea> <textarea>static</textarea>',

	test({ assert, component, target, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`<textarea></textarea> <textarea>${variant === 'hydrate' ? 'static' : ''}</textarea>`
		);

		const [textarea1, textarea2] = target.querySelectorAll('textarea');
		assert.strictEqual(textarea1.value, '42');
		assert.strictEqual(textarea2.value, 'static');

		component.foo = 43;
		assert.strictEqual(textarea1.value, '43');
	}
});
