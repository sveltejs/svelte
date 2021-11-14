export default {
	props: {
		foo: true,
		bar: true
	},

	html: '<body class="foo bar"></body>',

	test({ assert, component, target }) {
		component.foo = false;

		assert.htmlEqual(target.innerHTML, `
			<body class="bar"></body>
		`);
	}
};
