let clicked = false;
function handler() {
  clicked = true;
}

export default {
	props: {
		handler
	},
	html: '<button>Foo</button>',

	test({ assert, target }) {
		assert.equal(clicked, false);

		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');
		button.dispatchEvent(click);

		assert.equal(clicked, true);
	}
};
