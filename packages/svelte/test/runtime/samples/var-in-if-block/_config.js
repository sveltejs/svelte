export default {
	props: {
		condition: true 
	},

	html: '<p>true</p><p>123</p><p>0</p>',

	test({ assert, component, target }) {
		component.condition = false;

		assert.htmlEqual(target.innerHTML, '<p>false</p><p>123</p><p>0</p>');
	}
};
