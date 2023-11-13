import { test } from '../../test';

export default test({
	props: {
		foo: true,
		bar: false
	},
	trim_whitespace: false,

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	},

	test(assert, target, _, component) {
		component.foo = false;
		component.bar = true;
		assert.htmlEqual(target.innerHTML, '<p>bar!</p>');
	}
});
