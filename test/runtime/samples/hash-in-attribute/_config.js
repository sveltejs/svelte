export default {
	preserveIdentifiers: true,

	props: {
		links: ['a', 'b', 'c']
	},

	html: `
		<a href="x#a">x#a</a>
		<a href="x#b">x#b</a>
		<a href="x#c">x#c</a>
	`,

	test({ assert, component, target }) {
		component.links = ['d', 'e', 'f'];

		const links = [...target.querySelectorAll('a')];
		assert.deepEqual(links.map(l => l.href), ['x#d', 'x#e', 'x#f']);

		assert.htmlEqual(target.innerHTML, `
			<a href="x#d">x#d</a>
			<a href="x#e">x#e</a>
			<a href="x#f">x#f</a>
		`);
	}
};