export default {
	html: `
		<button>click me</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		let answer;
		component.$on('foo', event => {
			answer = event.detail.answer;
		});

		button.dispatchEvent(event);
		assert.equal(answer, 42);
	}
};
