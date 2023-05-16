export default {
	preserveIdentifiers: true,

	get props() {
		return { links: ['a', 'b', 'c'] };
	},

	html: `
		<a href="x#a">x#a</a>
		<a href="x#b">x#b</a>
		<a href="x#c">x#c</a>
	`,

	test({ assert, component, target }) {
		component.links = ['d', 'e', 'f'];

		const links = [...target.querySelectorAll('a')];

		assert.deepEqual(
			// Vitest/JSDom does prepend the base URL, so we need to strip it
			links.map((l) => l.href.slice(l.href.lastIndexOf('/') + 1)),
			['x#d', 'x#e', 'x#f']
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<a href="x#d">x#d</a>
			<a href="x#e">x#e</a>
			<a href="x#f">x#f</a>
		`
		);
	}
};
