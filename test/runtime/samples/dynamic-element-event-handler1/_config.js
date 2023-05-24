let clicked = false;
function handler() {
	clicked = true;
}

export default {
	get props() {
		return { handler };
	},
	html: '<button>Foo</button>',

	before_test() {
		clicked = false;
	},

	test({ assert, target }) {
		assert.equal(clicked, false);

		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');
		button.dispatchEvent(click);

		assert.equal(clicked, true);
	}
};
