let clicked = false;
function handler() {
  clicked = true;
}

export default {
	props: {
		tag: 'div',
		handler
	},
	html: '<div>Foo</div>',

	test({ assert, component, target }) {
		assert.equal(clicked, false);

		component.tag = 'button';
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');
		button.dispatchEvent(click);

		assert.equal(clicked, true);
	}
};
