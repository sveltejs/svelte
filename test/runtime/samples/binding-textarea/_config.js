export default {
	props: {
		value: 'some text',
	},

	async test({ assert, component, target, window, compileOptions }) {
		const textarea = target.querySelector('textarea');
		const p = target.querySelector('p');
		assert.equal(textarea.value, 'some text');
		assert.equal(p.textContent, 'some text');
		assert.equal(textarea.attributes.length, 0);

		const event = new window.Event('input');

		textarea.value = 'hello';
		await textarea.dispatchEvent(event);

		assert.equal(textarea.value, 'hello');
		assert.equal(p.textContent, 'hello');
		assert.equal(textarea.attributes.length, 0);

		component.value = 'goodbye';
		assert.equal(textarea.value, 'goodbye');

		assert.equal(textarea.value, 'goodbye');
		assert.equal(p.textContent, 'goodbye');
		assert.equal(textarea.attributes.length, 0);
	},
};
