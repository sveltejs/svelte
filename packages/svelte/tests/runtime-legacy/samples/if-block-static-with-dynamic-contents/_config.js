import { test } from '../../test';

export default test({
	get props() {
		return { foo: 42 };
	},

	html: '<p>42</p>',

	test({ assert, component, target }) {
		component.foo = 43;
		assert.htmlEqual(target.innerHTML, '<p>43</p>');
	}
});
