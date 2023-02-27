export default {
	html: '<button>click me</button>',

	props: {
		foo: 42
	},

	test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');
		const button = target.querySelector('button');

		let count = 0;
		let number = null;

		component.$on('foo', event => {
			count++;
			number = event.detail.foo;
		});

		button.dispatchEvent(event);

		assert.equal(count, 1);
		assert.equal(number, 42);
	}
};
