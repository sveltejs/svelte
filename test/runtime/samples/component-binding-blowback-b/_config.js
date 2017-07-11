export default {
	'skip-ssr': true,

	data: {
		ids: ['id-0', 'id-1', 'id-2']
	},

	html: `
		<ol>
			<li>id-0: value is zero</li>
			<li>id-1: value is one</li>
			<li>id-2: value is two</li>
		</ol>
	`,

	test (assert, component, target) {
		component.set({
			ids: ['id-0', 'id-1', 'id-2', 'id-3']
		});

		assert.htmlEqual(target.innerHTML, `
			<ol>
				<li>id-0: value is zero</li>
				<li>id-1: value is one</li>
				<li>id-2: value is two</li>
				<li>id-3: value is three</li>
			</ol>
		`);
	}
};
