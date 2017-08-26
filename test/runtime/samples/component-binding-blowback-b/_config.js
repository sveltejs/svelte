export default {
	'skip-ssr': true,

	data: {
		count: 3
	},

	html: `
		<input type='number'>
		<ol>
			<li><slot>id-0: value is zero</slot></li>
			<li><slot>id-1: value is one</slot></li>
			<li><slot>id-2: value is two</slot></li>
		</ol>
	`,

	test (assert, component, target, window) {
		const input = target.querySelector('input');

		input.value = 4;
		input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<ol>
				<li><slot>id-0: value is zero</slot></li>
				<li><slot>id-1: value is one</slot></li>
				<li><slot>id-2: value is two</slot></li>
				<li><slot>id-3: value is three</slot></li>
			</ol>
		`);
	}
};
