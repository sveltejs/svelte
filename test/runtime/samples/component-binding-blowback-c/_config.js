export default {
	skip_if_ssr: true,

	get props() {
		return { count: 3 };
	},

	html: `
		<input type='number'>
		<ol>
			<li>id-2: value is two</li>
			<li>id-1: value is one</li>
			<li>id-0: value is zero</li>
		</ol>
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');

		input.value = 4;
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<input type='number'>
			<ol>
				<li>id-3: value is three</li>
				<li>id-2: value is two</li>
				<li>id-1: value is one</li>
				<li>id-0: value is zero</li>
			</ol>
		`
		);
	}
};
