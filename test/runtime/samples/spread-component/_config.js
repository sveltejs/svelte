export default {
	data: {
		props: {
			foo: 'lol',
			baz: 40 + 2,
			qux: `this is a ${'piece of'} string`,
			quux: 'core'
		}
	},

	html: `<div><p>foo: lol</p>\n<p>baz: 42 (number)</p>\n<p>qux: named</p>\n<p>quux: core</p></div>`,

	test ( assert, component, target ) {
		component.set({
			props: {
				foo: 'wut',
				baz: 40 + 3,
				qux: `this is a ${'rather boring'} string`,
				quux: 'heart'
			}
		});

		assert.equal( target.innerHTML, `<div><p>foo: wut</p>\n<p>baz: 43 (number)</p>\n<p>qux: named</p>\n<p>quux: heart</p></div>` );
	}
};
