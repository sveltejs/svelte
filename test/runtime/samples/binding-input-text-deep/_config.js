export default {
	props: {
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

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');

		assert.equal(input.value, 'alice');

		const event = new window.Event('input');

		input.value = 'bob';
		await input.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello bob</p>
		`);

		const user = component.user;
		user.name = 'carol';

		component.user = user;
		assert.equal(input.value, 'carol');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello carol</p>
		`);
	},
};
