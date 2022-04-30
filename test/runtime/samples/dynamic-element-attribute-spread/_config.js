export default {
	props: {
		props: {
			disabled: true,
			type: 'button',
			'data-named': 'foo'
		}
	},
	html: '<button disabled type="button" data-named="foo">Click me</button>',

	test({ assert, component, target }) {
		const button = target.querySelector('button');
		assert.equal(button.disabled, true);
		assert.equal(button.type, 'button');
		assert.equal(button.dataset.named, 'foo');

		component.props = { type: 'submit' };
		assert.htmlEqual(target.innerHTML, '<button type="submit">Click me</button>');
		assert.equal(button.disabled, false);
		assert.equal(button.type, 'submit');
		assert.equal(button.dataset.named, undefined);
	}
};
