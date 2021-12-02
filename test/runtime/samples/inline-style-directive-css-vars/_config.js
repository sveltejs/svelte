export default {
	html: '<p style="--border-color: red;"></p>',

	test({ assert, component, target }) {
		component.myColor = 'blue';

		assert.htmlEqual(target.innerHTML, '<p style="--border-color: blue;"></p>');
	}
};
