export default {
	data: {
		user: {
			name: 'alice',
		},
	},

	html: `
		<input>
		<p>hello alice</p>
	`,

	ssrHtml: `
		<input value=alice>
		<p>hello alice</p>
	`,

	test(assert, component, target, window) {
		const input = target.querySelector('input');

		assert.equal(input.value, 'alice');

		const event = new window.Event('input');

		input.value = 'bob';
		input.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello bob</p>
		`);

		const user = component.get().user;
		user.name = 'carol';

		component.set({ user });
		assert.equal(input.value, 'carol');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello carol</p>
		`);
	},
};
