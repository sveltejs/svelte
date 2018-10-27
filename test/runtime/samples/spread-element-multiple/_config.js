export default {
	data: {
		a: {
			'data-one': 1,
			'data-two': 2,
		},
		c: {
			'data-b': 'overridden',
		},
		d: 'deeeeee',
	},

	html: `
		<div data-one="1" data-two="2" data-b="overridden" data-d="deeeeee" >test</div>
	`,

	test(assert, component, target) {
		component.set({
			a: {
				'data-one': 10
			},
			c: {
				'data-c': 'new'
			},
			d: 'DEEEEEE'
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div data-one="10" data-b="b" data-c="new" data-d="DEEEEEE" >test</div>`
		);
	},
};
