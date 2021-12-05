export default {
	props: {
		foo: 42
	},

	html: '<p>42</p>',

	test({ assert, component, target }) {
		component.foo = 43;
		assert.htmlEqual(target.innerHTML, '<p>43</p>');
	}
};
