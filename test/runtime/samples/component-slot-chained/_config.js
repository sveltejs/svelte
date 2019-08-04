export default {
	html: 'one',

	test({ assert, component, target }) {
		component.text = 'two';
		assert.htmlEqual(target.innerHTML, `two`);
	}
};
