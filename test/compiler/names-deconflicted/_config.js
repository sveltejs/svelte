export default {
	html: `<p>1: foo</p><p>2: bar</p><p>3: baz</p>`,

	test ( assert, component, target ) {
		component.set({
			widgets: [
				{ name: 'bish' },
				{ name: 'bosh' }
			]
		});

		assert.htmlEqual( target.innerHTML, `<p>1: bish</p><p>2: bosh</p>` );
	}
};
