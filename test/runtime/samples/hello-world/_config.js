export default {
	props: {
		name: 'world'
	},

	html: '<h1>Hello world!</h1>',

	test({ assert, component, target }) {
		component.name = 'everybody';
		assert.htmlEqual(target.innerHTML, '<h1>Hello everybody!</h1>');

		component.$destroy();
		assert.htmlEqual(target.innerHTML, '');
	}
};
