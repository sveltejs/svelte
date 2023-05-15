export default {
	props: {
		componentName: 'Sub'
	},
	html: '<div>Sub</div>',
	test({ assert, component, target }) {
		component.componentName = 'Proxy';
		assert.htmlEqual(target.innerHTML, '<div>Sub</div>');
		try {
			component.componentName = 'banana';
			throw new Error('Expected an error');
		} catch (err) {
			assert.equal(err.message, 'component is not a constructor');
		}
	}
};
