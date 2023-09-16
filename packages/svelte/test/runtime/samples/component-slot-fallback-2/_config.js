export default {
	html: '<input> <input> <input>',
	ssrHtml: '<input value="Blub"> <input value="Blub"> <input value="Blub">',

	async test({ assert, target, component, window }) {
		const [input1, input2, input_fallback] = target.querySelectorAll('input');

		assert.equal(component.getSubscriberCount(), 3);

		input1.value = 'a';
		await input1.dispatchEvent(new window.Event('input'));
		input1.value = 'ab';
		await input1.dispatchEvent(new window.Event('input'));
		assert.equal(input1.value, 'ab');
		assert.equal(input2.value, 'ab');
		assert.equal(input_fallback.value, 'ab');

		component.props = 'hello';

		assert.htmlEqual(
			target.innerHTML,
			`
			<input> hello
			<input> hello
			<input>
			`
		);

		component.fallback = 'world';
		assert.htmlEqual(
			target.innerHTML,
			`
			<input> hello
			<input> hello
			<input> world
		`
		);
	}
};
