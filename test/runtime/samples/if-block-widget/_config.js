export default {
	data: {
		visible: true
	},

	html: `
		before
		<p>Widget</p>
		after
	`,

	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.htmlEqual( target.innerHTML, `
			before

			after
		` );

		component.set({ visible: true });
		assert.htmlEqual( target.innerHTML, `
			before
			<p>Widget</p>
			after
		` );
	}
};
