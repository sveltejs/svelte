export default {
	'skip-ssr': true,

	data: {
		count: 3
	},

	html: `
		<input type='number'>
		<ol>
			<li>id-2: value is two</li>
			<li>id-1: value is one</li>
			<li>id-0: value is zero</li>
		</ol>
	`,

	test (assert, component, target, window) {
		const input = target.querySelector('input');

		input.value = 4;
		input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<ol>
				<li>id-3: value is three</li>
				<li>id-2: value is two</li>
				<li>id-1: value is one</li>
				<li>id-0: value is zero</li>
			</ol>
		`);
	}
};
