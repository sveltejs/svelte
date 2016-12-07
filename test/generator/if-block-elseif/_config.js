export default {
	data: {
		x: 11
	},

	html: `
		<p>x is greater than 10</p>
	`,

	test ( assert, component, target ) {
		component.set({ x: 4 });
		assert.htmlEqual( target.innerHTML, `
			<p>x is less than 5</p>
		` );

		component.set({ x: 6 });
		assert.htmlEqual( target.innerHTML, `
			<p>x is between 5 and 10</p>
		` );

		component.teardown();
	}
};
